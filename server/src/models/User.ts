import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  bio?: string;
  stripeAccountId?: string | null;
  paypalEmail?: string | null;
  isActive: boolean;
  passwordResetCodeHash?: string | null;
  passwordResetCodeExpiresAt?: Date | null;
  passwordResetCodeRequestedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): any;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
      required: true
    },
    avatar: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      default: null
    },
    stripeAccountId: {
      type: String,
      default: null
    },
    paypalEmail: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    passwordResetCodeHash: {
      type: String,
      default: null
    },
    passwordResetCodeExpiresAt: {
      type: Date,
      default: null
    },
    passwordResetCodeRequestedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  // Backward compatibility: some legacy records may contain plaintext passwords.
  if (typeof this.password === 'string' && !this.password.startsWith('$2')) {
    return candidatePassword === this.password;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function() {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

// Virtual for fullName
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
