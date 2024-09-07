const User = require('../models/User');
const Admin = require('../models/Admin')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Import axios to make requests
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');

exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      phoneNumber: user.phoneNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = req.user;

    // Update user fields with the new data from the request
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.country = req.body.country || user.country;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    // Save the updated user back to the database
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      country: updatedUser.country,
      phoneNumber: updatedUser.phoneNumber,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, country, phoneNumber, password, captchaToken } = req.body;

  try {
    // Verify reCAPTCHA token
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=6LeGSzYqAAAAAOxfkgdBGURt46LH9vLMMVm0xXjT&response=${captchaToken}`
    );

    const { success } = recaptchaResponse.data;
    if (!success) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if the email is in the admin list
    const admin = await Admin.findOne({ email });
    const isAdmin = admin ? true : false;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create the user
    user = await User.create({
      firstName,
      lastName,
      email,
      country,
      phoneNumber,
      password: hashedPassword,
      verificationToken,
      isAdmin
    });

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    const message = `
      <p>Please verify your email by clicking on the following link:</p>
      <a href="${verificationUrl}" target="_blank">Verify your email</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      html: message,
    });

    res.status(201).json({ message: 'User registered. Please check your email to verify.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Generate the verification URL
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    const message = `
      <p>Please verify your email by clicking on the following link:</p>
      <a href="${verificationUrl}" target="_blank">Verify your email</a>
    `;

    // Send the verification email
    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      html: message, // Use 'html' to send HTML formatted email
    });

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully, login now' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const token = generateToken(user._id, user.isAdmin);  // Pass isAdmin

    res.status(200).json({
      _id: user._id,
      email: user.email,
      token,               // Token now includes isAdmin
      isAdmin: user.isAdmin
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



exports.requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token (JWT with a short expiration, e.g., 1 hour)
    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Optionally save token and its expiration to the user's record in the database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Create a user-friendly reset message with a clickable link
    const message = `
      <p>You have requested to reset your password. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Click here to reset your password</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: message, // Use 'html' to send HTML formatted email
    });

    res.status(200).json({ message: 'Reset link sent to your email' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Find the user by the reset token
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};