import User from './User';
import Course from './Course';
import Video from './Video';
import Note from './Note';
import Category from './Category';
import Enrollment from './Enrollment';
import Purchase from './Purchase';

// Re-export enums and types for easier imports
export { UserRole } from './User';
export { CourseLevel, CourseStatus } from './Course';
export { NoteStatus } from './Note';
export { EnrollmentStatus } from './Enrollment';

// Re-export interfaces for type safety
export type { IUser } from './User';
export type { ICourse } from './Course';
export type { IVideo } from './Video';
export type { INote } from './Note';
export type { ICategory } from './Category';
export type { IEnrollment } from './Enrollment';
export type { IPurchase } from './Purchase';

// Export models
export {
  User,
  Course,
  Video,
  Note,
  Category,
  Enrollment,
  Purchase
};

// Export all models as default
export default {
  User,
  Course,
  Video,
  Note,
  Category,
  Enrollment,
  Purchase
};
