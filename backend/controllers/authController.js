const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, errorResponse, successResponse } = require('../utils/helpers');
const { sendVerificationEmail } = require('../services/emailService');

const getFrontendBaseUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return frontendUrl.replace(/\/+$/, '');
};

const createEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  return { token, expires };
};

const buildVerificationUrl = (token) => `${getFrontendBaseUrl()}/verify-email?token=${token}`;

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, university, department, specialization } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email and password');
    }

    // Check if user already exists
    const normalizedEmail = String(email).toLowerCase().trim();
    const userExists = await User.findOne({ where: { email: normalizedEmail } });
    const { token, expires } = createEmailVerificationToken();

    if (userExists) {
      if (userExists.emailVerified) {
        return errorResponse(res, 400, 'User already exists with this email');
      }

      userExists.name = name || userExists.name;
      userExists.password = password;
      userExists.university = university || userExists.university;
      userExists.department = department || userExists.department;
      userExists.specialization = specialization || userExists.specialization;
      userExists.emailVerificationToken = token;
      userExists.emailVerificationExpires = expires;
      await userExists.save();

      let emailSent = true;
      try {
        await sendVerificationEmail({
          to: userExists.email,
          name: userExists.name,
          verifyUrl: buildVerificationUrl(token)
        });
      } catch (error) {
        emailSent = false;
        console.error('Verification email failed:', error);
      }

      return successResponse(res, 200, 'Verification email sent. Please check your inbox.', {
        requiresVerification: true,
        emailSent
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'student',
      university,
      department,
      specialization,
      emailVerified: false,
      emailVerificationToken: token,
      emailVerificationExpires: expires
    });

    let emailSent = true;
    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verifyUrl: buildVerificationUrl(token)
      });
    } catch (error) {
      emailSent = false;
      console.error('Verification email failed:', error);
    }

    return successResponse(res, 201, 'Registration successful. Please verify your email.', {
      requiresVerification: true,
      emailSent
    });
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 500, error.message || 'Error registering user');
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const token = req.query?.token || req.body?.token;

    if (!token) {
      return errorResponse(res, 400, 'Verification token is required');
    }

    const user = await User.findOne({ where: { emailVerificationToken: token } });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired verification token');
    }

    if (user.emailVerified) {
      return successResponse(res, 200, 'Email already verified');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return errorResponse(res, 400, 'Verification token has expired', { expired: true });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return successResponse(res, 200, 'Email verified successfully', { user: user.toJSON() });
  } catch (error) {
    console.error('Verify email error:', error);
    return errorResponse(res, 500, 'Error verifying email');
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.emailVerified) {
      return successResponse(res, 200, 'Email already verified');
    }

    const { token, expires } = createEmailVerificationToken();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = expires;
    await user.save();

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verifyUrl: buildVerificationUrl(token)
      });
    } catch (error) {
      console.error('Resend verification email failed:', error);
      return errorResponse(res, 500, 'Unable to send verification email');
    }

    return successResponse(res, 200, 'Verification email resent');
  } catch (error) {
    console.error('Resend verification error:', error);
    return errorResponse(res, 500, 'Error resending verification email');
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Find user
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 401, 'Account is deactivated');
    }

    if (!user.emailVerified) {
      return errorResponse(res, 403, 'Please verify your email before logging in.', {
        requiresVerification: true
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          university: user.university,
          department: user.department,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 500, error.message || 'Error logging in');
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    successResponse(res, 200, 'User profile retrieved', { user });
  } catch (error) {
    console.error('Get profile error:', error);
    errorResponse(res, 500, 'Error fetching profile');
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, university, department, specialization, bio, avatar } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Update fields
    if (name) user.name = name;
    if (university) user.university = university;
    if (department) user.department = department;
    if (specialization) user.specialization = specialization;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    console.error('Update profile error:', error);
    errorResponse(res, 500, 'Error updating profile');
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Please provide current and new password');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters');
    }

    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 500, 'Error changing password');
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  getMe,
  updateProfile,
  changePassword
};