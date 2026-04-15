import mongoose, { Schema, Document, Model } from 'mongoose';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: EnrollmentStatus;
  progress: number;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
      required: true
    },
    progress: {
      type: Number,
      default: 0,
      required: true,
      comment: 'Progress percentage (0-100)'
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Create unique compound index on userId and courseId
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment: Model<IEnrollment> = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

export default Enrollment;
