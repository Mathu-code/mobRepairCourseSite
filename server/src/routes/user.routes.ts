import { Router, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import User, { UserRole } from '../models/User';
import Enrollment from '../models/Enrollment';
import Purchase from '../models/Purchase';
import Course from '../models/Course';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (role) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search as string, 'i') },
        { lastName: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter, { password: 0 })
        .limit(limitNum)
        .skip(skip)
        .sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get users'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user'
    });
  }
});

// Get user's enrolled courses
router.get('/:id/enrollments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Only allow users to view their own enrollments or admin
    if (req.user?.userId !== id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these enrollments'
      });
    }

    const enrollments = await Enrollment.find({ userId: id })
      .populate({
        path: 'courseId',
        populate: {
          path: 'instructorId',
          select: 'firstName lastName avatar'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error: any) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get enrollments'
    });
  }
});

// Update user's enrollment progress (student or admin)
router.patch('/:id/enrollments/:courseId/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id, courseId } = req.params;
    const progressValue = Number(req.body?.progress ?? 0);

    if (!isValidObjectId(id) || !isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user or course id'
      });
    }

    // Only allow users to update their own progress or admin
    if (req.user?.userId !== id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this progress'
      });
    }

    if (Number.isNaN(progressValue)) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be a number'
      });
    }

    const clampedProgress = Math.max(0, Math.min(100, Math.round(progressValue)));

    const enrollment = await Enrollment.findOne({ userId: id, courseId });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    enrollment.progress = clampedProgress;
    if (clampedProgress >= 100) {
      enrollment.status = 'completed' as any;
      enrollment.completedAt = enrollment.completedAt || new Date();
    }

    await enrollment.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment
    });
  } catch (error: any) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update progress'
    });
  }
});

// Get user's purchases
router.get('/:id/purchases', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Only allow users to view their own purchases or admin
    if (req.user?.userId !== id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these purchases'
      });
    }

    const purchases = await Purchase.find({ userId: id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchases
    });
  } catch (error: any) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get purchases'
    });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isActive, phone, bio } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user.toSafeObject()
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user'
    });
  }
});

export default router;
