import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Create upload directories if they don't exist
const uploadDirs = ['uploads', 'uploads/videos', 'uploads/notes', 'uploads/thumbnails', 'uploads/avatars'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '../../', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../uploads');
    
    if (file.fieldname === 'video') {
      uploadPath = path.join(uploadPath, 'videos');
    } else if (file.fieldname === 'note' || file.fieldname === 'pdf') {
      uploadPath = path.join(uploadPath, 'notes');
    } else if (file.fieldname === 'thumbnail') {
      uploadPath = path.join(uploadPath, 'thumbnails');
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadPath, 'avatars');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueId}-${safeName}`);
  }
});

// File filter for different types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed'
  ];
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.fieldname === 'video') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Allowed: MP4, WebM, OGG, MOV, AVI'));
    }
  } else if (file.fieldname === 'note' || file.fieldname === 'pdf') {
    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Allowed: PDF, DOC, DOCX, ZIP'));
    }
  } else if (file.fieldname === 'thumbnail' || file.fieldname === 'avatar') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Allowed: JPEG, PNG, GIF, WebP'));
    }
  } else {
    cb(null, true);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB default
  }
});

// Export different upload configurations
export const uploadVideo = upload.single('video');
export const uploadNote = upload.single('note');
export const uploadPdf = upload.single('pdf');
export const uploadThumbnail = upload.single('thumbnail');
export const uploadAvatar = upload.single('avatar');

export const uploadCourseFiles = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

export const uploadNoteFiles = upload.fields([
  { name: 'note', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

export const uploadMultipleVideos = upload.array('videos', 50);

export default upload;
