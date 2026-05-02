import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  instructorId?: mongoose.Types.ObjectId | null;
  itemType: 'course' | 'note';
  itemId: mongoose.Types.ObjectId;
  amount: number;
  platformFee?: number;
  instructorEarnings?: number;
  paymentProvider?: 'stripe' | 'paypal' | 'manual' | string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | string;
  paymentMethod?: string;
  externalPaymentId?: string | null;
  transactionId?: string;
  payoutStatus?: 'pending' | 'eligible' | 'paid' | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    itemType: {
      type: String,
      enum: ['course', 'note'],
      required: true
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      default: 0
    },
    instructorEarnings: {
      type: Number,
      default: 0
    },
    paymentProvider: {
      type: String,
      default: 'manual'
    },
    paymentStatus: {
      type: String,
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      default: null
    },
    externalPaymentId: {
      type: String,
      default: null
    },
    transactionId: {
      type: String,
      default: null
    },
    payoutStatus: {
      type: String,
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Purchase: Model<IPurchase> = mongoose.model<IPurchase>('Purchase', purchaseSchema);

export default Purchase;
