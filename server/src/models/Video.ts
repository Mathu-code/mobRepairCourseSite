import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
  courseId: mongoose.Types.ObjectId;
  order: number;
  isFree: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: null
    },
    videoUrl: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      default: null
    },
    duration: {
      type: Number,
      default: null,
      comment: 'Duration in seconds'
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    order: {
      type: Number,
      default: 0,
      required: true
    },
    isFree: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Video: Model<IVideo> = mongoose.model<IVideo>('Video', videoSchema);

export default Video;
