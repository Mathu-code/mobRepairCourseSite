import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';
import User, { UserRole } from '../models/User';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const RESET_CODE_TTL_MINUTES = 15;

const generateResetCode = (): string => randomInt(100000, 1000000).toString();

const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    : undefined
});

const sendVerificationCodeEmail = async (toEmail: string, verificationCode: string): Promise<void> => {
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const appName = process.env.APP_NAME || 'MobRepairHouse';

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !fromEmail) {
    throw new Error('Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in server/.env');
  }

  await mailTransport.sendMail({
    from: `${appName} <${fromEmail}>`,
    to: toEmail,
    subject: `${appName} password reset verification code`,
    text: `Your verification code is ${verificationCode}. It expires in ${RESET_CODE_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">Password reset verification code</h2>
        <p style="margin: 0 0 12px;">Use the following code to reset your password:</p>
        <div style="display: inline-block; padding: 16px 20px; border-radius: 12px; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 28px; letter-spacing: 0.35em; font-weight: 700;">${verificationCode}</div>
        <p style="margin: 16px 0 0;">This code expires in ${RESET_CODE_TTL_MINUTES} minutes.</p>
        <p style="margin: 8px 0 0; color: #475569;">If you did not request a password reset, you can ignore this email.</p>
      </div>
    `
  });
};

// Register a new student
router.post('/register', async (req: Request, res: Response) => {
  try {
    let { email, password, firstName, lastName, name, phone, bio, role } = req.body as any;

    email = (email || '').toString().trim().toLowerCase();
    firstName = (firstName || '').toString().trim();
    lastName = (lastName || '').toString().trim();
    password = (password || '').toString();

    // Accept either separate first/last or a single `name` field.
    if (!firstName && name && typeof name === 'string') {
      const parts = name.trim().split(/\s+/);
      firstName = parts.shift() || '';
      lastName = parts.join(' ');
    }

    // Validation: require email, password and at least a first name
    if (!email || !password || !firstName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and first name are required'
      });
    }

    // Ensure lastName is a string (can be empty)
    lastName = lastName || '';

    // Only allow student/instructor via public registration
    const normalizedRole = role === UserRole.INSTRUCTOR ? UserRole.INSTRUCTOR : UserRole.STUDENT;

    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
    const normalizedBio = typeof bio === 'string' ? bio.trim() : '';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.'
      });
    }

    // Create new user (students only through registration)
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone: normalizedPhone || null,
      bio: normalizedBio || null,
      role: normalizedRole
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.toSafeObject()
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profile'
    });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, bio, avatar, email } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (firstName) user.firstName = String(firstName).trim();
    if (lastName !== undefined) user.lastName = String(lastName || '').trim();
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    if (email !== undefined) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Another account already uses this email'
        });
      }

      user.email = normalizedEmail;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toSafeObject()
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
});

// Delete current user account (self-service)
router.delete('/account', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword } = req.body || {};

    if (!String(currentPassword || '').trim()) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required to delete account'
      });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(String(currentPassword));
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete account'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
});

// Forgot password: generate and store a verification code.
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const email = (req.body?.email || '').toString().trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      const verificationCode = generateResetCode();
      const passwordResetCodeHash = await bcrypt.hash(verificationCode, 10);

      user.passwordResetCodeHash = passwordResetCodeHash;
      user.passwordResetCodeExpiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);
      user.passwordResetCodeRequestedAt = new Date();
      await user.save();

      try {
        await sendVerificationCodeEmail(email, verificationCode);
      } catch (mailError) {
        user.passwordResetCodeHash = null;
        user.passwordResetCodeExpiresAt = null;
        user.passwordResetCodeRequestedAt = null;
        await user.save();
        throw mailError;
      }

      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification code has been sent'
      });
    }

    // Don't reveal if user exists or not for security
    res.json({
      success: true,
      message: 'If an account exists with this email, a verification code has been sent'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process request'
    });
  }
});

// Reset password using a verification code.
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const email = (req.body?.email || '').toString().trim().toLowerCase();
    const code = (req.body?.code || '').toString().trim();
    const newPassword = (req.body?.newPassword || '').toString();

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetCodeHash || !user.passwordResetCodeExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    if (user.passwordResetCodeExpiresAt.getTime() < Date.now()) {
      user.passwordResetCodeHash = null;
      user.passwordResetCodeExpiresAt = null;
      user.passwordResetCodeRequestedAt = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    const isCodeValid = await bcrypt.compare(code, user.passwordResetCodeHash);
    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    user.password = newPassword;
    user.passwordResetCodeHash = null;
    user.passwordResetCodeExpiresAt = null;
    user.passwordResetCodeRequestedAt = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
});

export default router;
