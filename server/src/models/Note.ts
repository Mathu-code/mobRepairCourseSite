import mongoose, { Schema, Document, Model } from 'mongoose';

export enum NoteStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface INote extends Document {
  title: string;
  description: string;
  fileUrl: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  instructorId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  status: NoteStatus;
  pages?: number;
  fileSize?: number;
  downloads: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
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
    status: {
      type: String,
      enum: Object.values(NoteStatus),
      default: NoteStatus.DRAFT,
      required: true
    },
    pages: {
      type: Number,
      default: null
    },
    fileSize: {
      type: Number,
      default: null,
      comment: 'File size in bytes'
    },
    downloads: {
      type: Number,
      default: 0,
      required: true
    }
  },
  { timestamps: true }
);

const Note: Model<INote> = mongoose.model<INote>('Note', noteSchema);

export default Note;
