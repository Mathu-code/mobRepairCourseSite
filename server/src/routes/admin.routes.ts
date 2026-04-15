import { Router, Response } from 'express';
import User, { UserRole } from '../models/User';
import Course, { CourseStatus } from '../models/Course';
import Note, { NoteStatus } from '../models/Note';
import Video from '../models/Video';
import Category from '../models/Category';
import Enrollment from '../models/Enrollment';
import Purchase from '../models/Purchase';
import { authenticateToken, requireAdmin, requireInstructor, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalNotes,
      publishedNotes,
      totalEnrollments,
      totalPurchases
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: UserRole.STUDENT }),
      User.countDocuments({ role: UserRole.INSTRUCTOR }),
      Course.countDocuments(),
      Course.countDocuments({ status: CourseStatus.PUBLISHED }),
      Note.countDocuments(),
      Note.countDocuments({ status: NoteStatus.PUBLISHED }),
      Enrollment.countDocuments(),
      Purchase.countDocuments()
    ]);

    // Calculate revenue
    const purchasesForRevenue = await Purchase.find().select('amount');
    const totalRevenue = purchasesForRevenue.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    // Recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent courses
    const recentCourses = await Course.find()
      .populate({
        path: 'instructorId',
        select: 'firstName lastName'
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalInstructors,
          totalCourses,
          publishedCourses,
          totalNotes,
          publishedNotes,
          totalEnrollments,
          totalPurchases,
          totalRevenue
        },
        recentUsers,
        recentCourses
      }
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard data'
    });
  }
});

// Get all users with filters
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
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
      User.find(filter)
        .select('-password')
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

// Create instructor/admin user
router.post('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone, bio } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, last name, and role are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      bio
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user.toSafeObject()
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user'
    });
  }
});

// Update user role
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user.toSafeObject()
    });
  } catch (error: any) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update role'
    });
  }
});

// Toggle user status
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user.toSafeObject()
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update status'
    });
  }
});

// Get all courses for admin
router.get('/courses', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.title = new RegExp(search as string, 'i');
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [total, courses] = await Promise.all([
      Course.countDocuments(filter),
      Course.find(filter)
        .populate({
          path: 'instructorId',
          select: 'firstName lastName email'
        })
        .populate('categoryId')
        .limit(limitNum)
        .skip(skip)
        .sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get courses'
    });
  }
});

// Approve/publish course
router.put('/courses/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(CourseStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.status = status;
    await course.save();

    res.json({
      success: true,
      message: 'Course status updated successfully',
      data: course
    });
  } catch (error: any) {
    console.error('Update course status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update course status'
    });
  }
});

// Get all notes for admin
router.get('/notes', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.title = new RegExp(search as string, 'i');
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [total, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
        .populate({
          path: 'instructorId',
          select: 'firstName lastName email'
        })
        .populate('categoryId')
        .limit(limitNum)
        .skip(skip)
        .sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notes'
    });
  }
});

// Approve/publish note
router.put('/notes/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(NoteStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.status = status;
    await note.save();

    res.json({
      success: true,
      message: 'Note status updated successfully',
      data: note
    });
  } catch (error: any) {
    console.error('Update note status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update note status'
    });
  }
});

// Category management - GET
router.get('/categories', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.find({ parentId: null })
      .populate('parentId')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get categories'
    });
  }
});

// Category management - POST
router.post('/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, icon, parentId } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon,
      parentId
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category'
    });
  }
});

// Category management - PUT
router.put('/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, parentId, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (parentId !== undefined) category.parentId = parentId;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update category'
    });
  }
});

// Category management - DELETE
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has courses or notes
    const [coursesCount, notesCount] = await Promise.all([
      Course.countDocuments({ categoryId: id }),
      Note.countDocuments({ categoryId: id })
    ]);

    if (coursesCount > 0 || notesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated courses or notes'
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete category'
    });
  }
});

// Get all purchases
router.get('/purchases', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [total, purchases] = await Promise.all([
      Purchase.countDocuments(),
      Purchase.find()
        .populate({
          path: 'userId',
          select: 'firstName lastName email'
        })
        .limit(limitNum)
        .skip(skip)
        .sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        purchases,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get purchases'
    });
  }
});

export default router;
