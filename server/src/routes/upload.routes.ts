import { Router, Response, Request } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireInstructor, AuthRequest } from '../middleware/auth.middleware';
import { 
  uploadVideo, 
  uploadNote, 
  uploadPdf,
  uploadThumbnail, 
  uploadAvatar,
  uploadCourseFiles,
  uploadNoteFiles,
  uploadMultipleVideos
} from '../middleware/upload.middleware';

const router = Router();

// Helper to get file URL
const getFileUrl = (filename: string, folder: string): string => {
  return `/uploads/${folder}/${filename}`;
};

// Upload single video
router.post('/video', authenticateToken, requireInstructor, (req: AuthRequest, res: Response) => {
  uploadVideo(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload video'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: getFileUrl(req.file.filename, 'videos')
      }
    });
  });
});

// Upload multiple videos
router.post('/videos', authenticateToken, requireInstructor, (req: AuthRequest, res: Response) => {
  uploadMultipleVideos(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload videos'
      });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No video files provided'
      });
    }

    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: getFileUrl(file.filename, 'videos')
    }));

    res.json({
      success: true,
      message: `${files.length} videos uploaded successfully`,
      data: uploadedFiles
    });
  });
});

// Upload note/PDF
router.post('/note', authenticateToken, requireInstructor, (req: AuthRequest, res: Response) => {
  uploadNote(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload note'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No note file provided'
      });
    }

    res.json({
      success: true,
      message: 'Note uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: getFileUrl(req.file.filename, 'notes')
      }
    });
  });
});

// Upload PDF
router.post('/pdf', authenticateToken, requireInstructor, (req: AuthRequest, res: Response) => {
  uploadPdf(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload PDF'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file provided'
      });
    }

    res.json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: getFileUrl(req.file.filename, 'notes')
      }
    });
  });
});

// Upload thumbnail
router.post('/thumbnail', authenticateToken, requireInstructor, (req: AuthRequest, res: Response) => {
  uploadThumbnail(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload thumbnail'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No thumbnail file provided'
      });
    }

    res.json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: getFileUrl(req.file.filename, 'thumbnails')
      }
    });
  });
});

// Upload avatar
router.post('/avatar', authenticateToken, (req: AuthRequest, res: Response) => {
  uploadAvatar(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload avatar'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file provided'
      });
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: getFileUrl(req.file.filename, 'avatars')
      }
    });
  });
});

// Upload course files (video + thumbnail)
router.post('/course-files', authenticateToken, requireInstructor, (req: AuthRequest, res: Response) => {
  uploadCourseFiles(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload course files'
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const result: any = {};

    if (files.video && files.video[0]) {
      result.video = {
        filename: files.video[0].filename,
        originalName: files.video[0].originalname,
        size: files.video[0].size,
        url: getFileUrl(files.video[0].filename, 'videos')
      };
    }

    if (files.thumbnail && files.thumbnail[0]) {
      result.thumbnail = {
        filename: files.thumbnail[0].filename,
        originalName: files.thumbnail[0].originalname,
        size: files.thumbnail[0].size,
        url: getFileUrl(files.thumbnail[0].filename, 'thumbnails')
      };
    }

    res.json({
      success: true,
      message: 'Course files uploaded successfully',
      data: result
    });
  });
});

// Upload note files (pdf + thumbnail)
router.post('/note-files', authenticateToken, requireInstructor, (req: AuthRequest, res: Response) => {
  uploadNoteFiles(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload note files'
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const result: any = {};

    if (files.note && files.note[0]) {
      result.note = {
        filename: files.note[0].filename,
        originalName: files.note[0].originalname,
        size: files.note[0].size,
        url: getFileUrl(files.note[0].filename, 'notes')
      };
    }

    if (files.pdf && files.pdf[0]) {
      result.pdf = {
        filename: files.pdf[0].filename,
        originalName: files.pdf[0].originalname,
        size: files.pdf[0].size,
        url: getFileUrl(files.pdf[0].filename, 'notes')
      };
    }

    if (files.thumbnail && files.thumbnail[0]) {
      result.thumbnail = {
        filename: files.thumbnail[0].filename,
        originalName: files.thumbnail[0].originalname,
        size: files.thumbnail[0].size,
        url: getFileUrl(files.thumbnail[0].filename, 'thumbnails')
      };
    }

    res.json({
      success: true,
      message: 'Note files uploaded successfully',
      data: result
    });
  });
});

// Delete file
router.delete('/:folder/:filename', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const { folder, filename } = req.params;
    
    const allowedFolders = ['videos', 'notes', 'thumbnails', 'avatars'];
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', folder, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete file'
    });
  }
});

export default router;
