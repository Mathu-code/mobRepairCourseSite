import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: 'course' | 'note';
  itemId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
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
    paymentMethod: {
      type: String,
      default: null
    },
    transactionId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

const Purchase: Model<IPurchase> = mongoose.model<IPurchase>('Purchase', purchaseSchema);

export default Purchase;
