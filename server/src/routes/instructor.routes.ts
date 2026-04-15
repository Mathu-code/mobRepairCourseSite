import { Router, Response } from 'express';
import Course from '../models/Course';
import Note from '../models/Note';
import Enrollment from '../models/Enrollment';
import Purchase from '../models/Purchase';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Instructor dashboard stats
router.get('/:id/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Only allow instructor themselves or admin
    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [courses, notes] = await Promise.all([
      Course.find({ instructorId: id }),
      Note.find({ instructorId: id })
    ]);

    const courseIds = courses.map(c => c._id);
    const noteIds = notes.map(n => n._id);

    const totalPublishedCourses = courses.filter(c => c.status === 'published').length;
    const totalPublishedNotes = notes.filter(n => n.status === 'published').length;

    // Total students: count unique users enrolled across these courses
    let totalStudents = 0;
    if (courseIds.length) {
      const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
      const uniqueUserIds = new Set(enrollments.map(e => e.userId.toString()));
      totalStudents = uniqueUserIds.size;
    }

    // Revenue: sum purchases for courseIds and noteIds
    let totalEarnings = 0;
    const purchases = await Purchase.find({
      $or: [
        { itemType: 'course', itemId: { $in: courseIds } },
        { itemType: 'note', itemId: { $in: noteIds } }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    totalEarnings = purchases.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    // Attach purchaser info for recent purchases
    const recentPurchases = await Promise.all(purchases.map(async (p: any) => {
      const user = await User.findById(p.userId);
      return {
        id: p._id,
        student: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Student',
        itemType: p.itemType,
        itemId: p.itemId,
        amount: Number(p.amount || 0),
        date: p.createdAt
      };
    }));

    res.json({
      success: true,
      data: {
        totalEarnings,
        totalStudents,
        totalPublishedCourses,
        totalPublishedNotes,
        courses,
        notes,
        recentPurchases
      }
    });
  } catch (error: any) {
    console.error('Instructor dashboard error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get dashboard' });
  }
});

export default router;
