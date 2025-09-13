const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { createOTP, verifyOTP, sendOTPEmail, sendOTPSMS } = require('../utils/otp');

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { name, email, password, phone, role = 'USER' } = req.body;

    // Check if email already exists
    const existingEmail = await prisma.email.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await prisma.phone.findUnique({
        where: { phone }
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with email
    const user = await prisma.user.create({
      data: {
        name,
        role,
        password: hashedPassword,
        emails: {
          create: {
            email
          }
        },
        ...(phone && {
          phones: {
            create: {
              phone
            }
          }
        })
      },
      include: {
        emails: true,
        phones: true
      }
    });

    // Create email verification OTP
    const emailOTP = await createOTP(user.id, 'VERIFICATION', email);
    await sendOTPEmail(email, emailOTP.code, 'account verification');

    // Create phone verification OTP (if phone provided)
    if (phone) {
      const phoneOTP = await createOTP(user.id, 'CONTACT_VERIFICATION', phone);
      await sendOTPSMS(phone, phoneOTP.code, 'phone verification');
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email, role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          emails: user.emails,
          phones: user.phones,
          createdAt: user.createdAt
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const emailRecord = await prisma.email.findUnique({
      where: { email },
      include: {
        user: {
          include: {
            emails: true,
            phones: true,
            sellerProfile: true
          }
        }
      }
    });

    if (!emailRecord || !emailRecord.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = emailRecord.user;

    // Check if user is deleted
    if (user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Verify password
    if (!user.password || !(await comparePassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          emails: user.emails,
          phones: user.phones,
          sellerProfile: user.sellerProfile,
          createdAt: user.createdAt
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
}

/**
 * Verify email with OTP
 */
async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    const userId = req.user.id;

    // Verify OTP
    const isValidOTP = await verifyOTP(userId, otp, 'VERIFICATION', email);

    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update email as verified
    await prisma.email.update({
      where: { email },
      data: { verified: true }
    });

    // Update user as verified if this is their primary email
    const primaryEmail = await prisma.email.findFirst({
      where: { userId, verified: true }
    });

    if (primaryEmail) {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true }
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
}

/**
 * Verify phone with OTP
 */
async function verifyPhone(req, res) {
  try {
    const { phone, otp } = req.body;
    const userId = req.user.id;

    // Verify OTP
    const isValidOTP = await verifyOTP(userId, otp, 'CONTACT_VERIFICATION', phone);

    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update phone as verified
    await prisma.phone.update({
      where: { phone },
      data: { verified: true }
    });

    res.json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Phone verification failed',
      error: error.message
    });
  }
}

/**
 * Resend verification OTP
 */
async function resendVerificationOTP(req, res) {
  try {
    const { email, phone } = req.body;
    const userId = req.user.id;

    if (email) {
      const emailOTP = await createOTP(userId, 'VERIFICATION', email);
      await sendOTPEmail(email, emailOTP.code, 'account verification');
    }

    if (phone) {
      const phoneOTP = await createOTP(userId, 'CONTACT_VERIFICATION', phone);
      await sendOTPSMS(phone, phoneOTP.code, 'phone verification');
    }

    res.json({
      success: true,
      message: 'Verification OTP sent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
}

/**
 * Request password reset
 */
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    // Find user by email
    const emailRecord = await prisma.email.findUnique({
      where: { email },
      include: { user: true }
    });

    if (!emailRecord || !emailRecord.user || emailRecord.user.deletedAt) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    const user = emailRecord.user;

    // Create password reset OTP
    const resetOTP = await createOTP(user.id, 'PASSWORD_RESET', email, 15); // 15 minutes expiry
    await sendOTPEmail(email, resetOTP.code, 'password reset');

    res.json({
      success: true,
      message: 'Password reset OTP sent successfully'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
}

/**
 * Reset password with OTP
 */
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user by email
    const emailRecord = await prisma.email.findUnique({
      where: { email },
      include: { user: true }
    });

    if (!emailRecord || !emailRecord.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = emailRecord.user;

    // Verify OTP
    const isValidOTP = await verifyOTP(user.id, otp, 'PASSWORD_RESET', email);

    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
}

/**
 * Get current user profile
 */
async function getProfile(req, res) {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          emails: user.emails,
          phones: user.phones,
          sellerProfile: user.sellerProfile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
}

/**
 * Update user profile
 */
async function updateProfile(req, res) {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      include: {
        emails: true,
        phones: true,
        sellerProfile: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          emails: updatedUser.emails,
          phones: updatedUser.phones,
          sellerProfile: updatedUser.sellerProfile,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
}

module.exports = {
  register,
  login,
  verifyEmail,
  verifyPhone,
  resendVerificationOTP,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile,
};