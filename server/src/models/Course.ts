import mongoose, { Schema, Document, Model } from 'mongoose';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface ICourse extends Document {
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  instructorId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  level: CourseLevel;
  status: CourseStatus;
  duration?: number;
  totalLessons?: number;
  requirements?: string;
  whatYouWillLearn?: string;
  lessonVideos?: Array<{
    title: string;
    videoUrl: string;
    videoName?: string;
  }>;
  resourceFiles?: Array<{
    name: string;
    size?: string;
    url: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    shortDescription: {
      type: String,
      default: null
    },
    thumbnail: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      default: 0,
      required: true
    },
    discountPrice: {
      type: Number,
      default: null
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    level: {
      type: String,
      enum: Object.values(CourseLevel),
      default: CourseLevel.BEGINNER,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
      required: true
    },
    duration: {
      type: Number,
      default: null,
      comment: 'Duration in minutes'
    },
    totalLessons: {
      type: Number,
      default: null
    },
    requirements: {
      type: String,
      default: null
    },
    whatYouWillLearn: {
      type: String,
      default: null
    },
    lessonVideos: {
      type: [
        {
          title: { type: String, default: '' },
          videoUrl: { type: String, default: '' },
          videoName: { type: String, default: '' }
        }
      ],
      default: []
    },
    resourceFiles: {
      type: [
        {
          name: { type: String, default: '' },
          size: { type: String, default: '' },
          url: { type: String, default: '' }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

const Course: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
