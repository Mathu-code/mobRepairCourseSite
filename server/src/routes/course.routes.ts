import { Router, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Course, { CourseStatus, CourseLevel } from '../models/Course';
import Video from '../models/Video';
import User, { UserRole } from '../models/User';
import Category from '../models/Category';
import Enrollment, { EnrollmentStatus } from '../models/Enrollment';
import { authenticateToken, requireInstructor, AuthRequest } from '../middleware/auth.middleware';
import { uploadCourseFiles } from '../middleware/upload.middleware';

const router = Router();

// Get all published courses
router.get('/', async (req: any, res: Response) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    
    const filter: any = { status: CourseStatus.PUBLISHED };
    
    if (category) {
      filter.categoryId = category;
    }
    if (level) {
      filter.level = level;
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') }
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [total, courses] = await Promise.all([
      Course.countDocuments(filter),
      Course.find(filter)
        .populate({
          path: 'instructorId',
          select: 'firstName lastName avatar'
        })
        .populate({
          path: 'categoryId',
          select: 'name slug'
        })
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

// Get course by ID with videos
router.get('/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course id'
      });
    }

    const course = await Course.findById(id)
      .populate({
        path: 'instructorId',
        select: 'firstName lastName avatar bio'
      })
      .populate({
        path: 'categoryId',
        select: 'name slug'
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const videos = await Video.find({ courseId: id }).sort({ order: 1 });

    res.json({
      success: true,
      data: {
        ...course.toObject(),
        videos
      }
    });
  } catch (error: any) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get course'
    });
  }
});

// Create course (instructor/admin only)
router.post('/', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      shortDescription,
      thumbnail,
      price,
      discountPrice,
      categoryId,
      level,
      requirements,
      whatYouWillLearn,
      status,
      lessonVideos,
      resourceFiles
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    if (categoryId !== undefined && categoryId !== null && categoryId !== '' && !isValidObjectId(String(categoryId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category id'
      });
    }

    const course = await Course.create({
      title,
      description,
      shortDescription,
      thumbnail,
      price: price || 0,
      discountPrice,
      instructorId: req.user!.userId,
      categoryId: isValidObjectId(String(categoryId || '')) ? categoryId : undefined,
      level: level || CourseLevel.BEGINNER,
      status: status === CourseStatus.DRAFT ? CourseStatus.DRAFT : CourseStatus.PUBLISHED,
      requirements,
      whatYouWillLearn,
      lessonVideos: Array.isArray(lessonVideos) ? lessonVideos : [],
      resourceFiles: Array.isArray(resourceFiles) ? resourceFiles : []
    });

    if (Array.isArray(lessonVideos) && lessonVideos.length > 0) {
      const videosToCreate = lessonVideos
        .filter((video: any) => (video?.videoUrl || '').trim())
        .map((video: any, index: number) => ({
          title: (video?.title || `Lesson ${index + 1}`).trim(),
          description: null,
          videoUrl: video.videoUrl,
          thumbnail: null,
          duration: null,
          courseId: course._id,
          order: index,
          isFree: false
        }));

      if (videosToCreate.length > 0) {
        await Video.insertMany(videosToCreate);
        course.totalLessons = videosToCreate.length;
        await course.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error: any) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create course'
    });
  }
});

// Update course
router.put('/:id', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course id'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership (unless admin)
    if (course.instructorId.toString() !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    if (updates.categoryId !== undefined && updates.categoryId !== null && updates.categoryId !== '' && !isValidObjectId(String(updates.categoryId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category id'
      });
    }

    if (Array.isArray(updates.lessonVideos)) {
      const normalizedLessons = updates.lessonVideos.map((lesson: any) => ({
        title: String(lesson?.title || '').trim(),
        videoUrl: String(lesson?.videoUrl || '').trim(),
        videoName: String(lesson?.videoName || '').trim()
      }));
      const effectiveLessons = normalizedLessons.filter((lesson: any) => lesson.title || lesson.videoUrl);

      const hasInvalidLesson = effectiveLessons.length === 0 || effectiveLessons.some((lesson: any) => !lesson.title || !lesson.videoUrl);
      if (hasInvalidLesson) {
        return res.status(400).json({
          success: false,
          message: 'Each lesson must have a title and uploaded video while editing a course.'
        });
      }

      updates.lessonVideos = effectiveLessons;
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'instructorId') {
        (course as any)[key] = updates[key];
      }
    });

    await course.save();

    if (Array.isArray(updates.lessonVideos)) {
      await Video.deleteMany({ courseId: course._id });

      const videosToCreate = updates.lessonVideos
        .filter((video: any) => (video?.videoUrl || '').trim())
        .map((video: any, index: number) => ({
          title: (video?.title || `Lesson ${index + 1}`).trim(),
          description: null,
          videoUrl: video.videoUrl,
          thumbnail: null,
          duration: null,
          courseId: course._id,
          order: index,
          isFree: false
        }));

      if (videosToCreate.length > 0) {
        await Video.insertMany(videosToCreate);
      }

      course.totalLessons = videosToCreate.length;
      await course.save();
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error: any) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update course'
    });
  }
});

// Delete course
router.delete('/:id', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course id'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership (unless admin)
    if (course.instructorId.toString() !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Soft delete by archiving
    course.status = CourseStatus.ARCHIVED;
    await course.save();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete course'
    });
  }
});

// Add video to course
router.post('/:id/videos', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, thumbnail, duration, order, isFree } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add videos to this course'
      });
    }

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnail,
      duration,
      courseId: id,
      order: order || 0,
      isFree: isFree || false
    });

    // Update course video count
    const videoCount = await Video.countDocuments({ courseId: id });
    course.totalLessons = videoCount;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Video added successfully',
      data: video
    });
  } catch (error: any) {
    console.error('Add video error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add video'
    });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user!.userId,
      courseId: id
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    const enrollment = await Enrollment.create({
      userId: req.user!.userId,
      courseId: id,
      status: EnrollmentStatus.ACTIVE,
      progress: 0
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment
    });
  } catch (error: any) {
    console.error('Enroll error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enroll'
    });
  }
});

// Get instructor's courses
router.get('/instructor/:instructorId', async (req: any, res: Response) => {
  try {
    const { instructorId } = req.params;
    const { status, page = 1, limit = 12 } = req.query;

    const filter: any = { instructorId };
    if (status) {
      filter.status = status;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [total, courses] = await Promise.all([
      Course.countDocuments(filter),
      Course.find(filter)
        .populate({
          path: 'categoryId',
          select: 'name slug'
        })
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
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get courses'
    });
  }
});

export default router;
