const User = require('../models/User');
const { generateToken, errorResponse, successResponse } = require('../utils/helpers');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, university, department, specialization } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email and password');
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return errorResponse(res, 400, 'User already exists with this email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      university,
      department,
      specialization
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          university: user.university,
          department: user.department
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 500, error.message || 'Error registering user');
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
  getMe,
  updateProfile,
  changePassword
};