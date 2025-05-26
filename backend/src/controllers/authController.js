const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const { getPasswordResetEmail, getWelcomeEmail, getVerificationEmail } = require('../utils/emailTemplates');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.EMAIL_APP_PASSWORD
  }
});

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: user.role === 'admin' ? '24h' : '30d' }
  );
};

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verificationEmailTemplate = (verificationCode) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #333;">رمز التحقق</h1>
    </div>
    <div style="background-color: white; padding: 30px; border-radius: 5px; text-align: center;">
      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">رمز التحقق الخاص بك هو:</p>
      <div style="background-color: #f2f2d3; padding: 15px; border-radius: 5px; display: inline-block;">
        <h2 style="color: #333; margin: 0; letter-spacing: 5px;">${verificationCode}</h2>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">هذا الرمز صالح لمدة 10 دقائق فقط.</p>
    </div>
  </div>
`;

const newVerificationEmailTemplate = (verificationCode) => `
  <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #333;">رمز تحقق جديد</h1>
    </div>
    <div style="background-color: white; padding: 30px; border-radius: 5px; text-align: center;">
      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">رمز التحقق الجديد الخاص بك هو:</p>
      <div style="background-color: #f2f2d3; padding: 15px; border-radius: 5px; display: inline-block;">
        <h2 style="color: #333; margin: 0; letter-spacing: 5px;">${verificationCode}</h2>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">هذا الرمز صالح لمدة 10 دقائق فقط.</p>
    </div>
  </div>
`;

// Protect middleware
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and add to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'غير مصرح' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, phoneNumber, password } = req.body;
    
    // Find user based on the provided identifier
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'يرجى تقديم البريد الإلكتروني أو اسم المستخدم أو رقم الهاتف' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'بيانات تسجيل الدخول غير صحيحة' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'بيانات تسجيل الدخول غير صحيحة' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'الحساب غير نشط' 
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        success: false,
        message: 'يرجى تأكيد البريد الإلكتروني أولاً' 
      });
    }

    // Generate token
    const token = generateToken(user);

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpire;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpire;

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'حدث خطأ في الخادم' 
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, username, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'البريد الإلكتروني أو اسم المستخدم مسجل مسبقاً' 
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpire = Date.now() + 3600000; // 1 hour

    // Create new user
    const user = new User({
      name,
      username,
      email,
      password,
      phoneNumber,
      verificationCode,
      verificationCodeExpires: verificationCodeExpire
    });

    await user.save();

    // Send verification email
    const emailSent = await sendEmail({
      email: user.email,
      subject: 'رمز التحقق - TourA4i',
      html: verificationEmailTemplate(verificationCode)
    });

    if (!emailSent) {
      console.error('Failed to send verification email to:', user.email);
      return res.status(500).json({
        success: false,
        message: 'فشل إرسال بريد التحقق. يرجى المحاولة مرة أخرى لاحقاً.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء عملية التسجيل'
    });
  }
};

exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'البريد الإلكتروني مفعل بالفعل' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 10);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    const emailSent = await sendEmail({
      email: user.email,
      subject: 'رمز التحقق - TourA4i',
      html: verificationEmailTemplate(verificationCode)
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'خطأ في إرسال رمز التحقق' });
    }

    res.status(200).json({ 
      message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      success: true
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'خطأ في إرسال رمز التحقق' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'البريد الإلكتروني مفعل بالفعل' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'رمز التحقق غير صحيح' });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'انتهت صلاحية رمز التحقق' });
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'تم تفعيل البريد الإلكتروني بنجاح',
      success: true
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'خطأ في تفعيل البريد الإلكتروني' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'البريد الإلكتروني مفعل بالفعل' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 10);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    const emailSent = await sendEmail({
      email: user.email,
      subject: 'رمز تحقق جديد - TourA4i',
      html: newVerificationEmailTemplate(verificationCode)
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'خطأ في إرسال رمز التحقق' });
    }

    res.status(200).json({ 
      message: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني',
      success: true
    });
  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({ message: 'خطأ في إرسال رمز التحقق' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const resetCode = generateVerificationCode();
    const resetCodeExpires = new Date();
    resetCodeExpires.setMinutes(resetCodeExpires.getMinutes() + 10);

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpire = resetCodeExpires;
    await user.save();

    const emailSent = await sendEmail({
      email: user.email,
      subject: 'رمز إعادة تعيين كلمة المرور - TourA4i',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333;">إعادة تعيين كلمة المرور</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 5px; text-align: center;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">رمز إعادة تعيين كلمة المرور الخاص بك هو:</p>
            <div style="background-color: #f2f2d3; padding: 15px; border-radius: 5px; display: inline-block;">
              <h2 style="color: #333; margin: 0; letter-spacing: 5px;">${resetCode}</h2>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">هذا الرمز صالح لمدة 10 دقائق فقط.</p>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
          </div>
        </div>
      `
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'خطأ في إرسال رمز إعادة تعيين كلمة المرور' });
    }

    res.status(200).json({ 
      message: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
      success: true
    });
  } catch (error) {
    console.error('Error sending reset code:', error);
    res.status(500).json({ message: 'خطأ في إرسال رمز إعادة تعيين كلمة المرور' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'البريد الإلكتروني ورمز التحقق وكلمة المرور الجديدة مطلوبة' });
    }

    const user = await User.findOne({ 
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'رمز التحقق غير صالح أو منتهي الصلاحية' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
      success: true
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'خطأ في إعادة تعيين كلمة المرور' });
  }
};

exports.validate = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
}; 