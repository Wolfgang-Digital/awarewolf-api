import db from '../models';
import { comparePasswords, signJwt, hashPassword } from '../utils';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import cloudinary from 'cloudinary';

const userController = {};

const capitaliseWord = word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();

const sendConfirmationEmail = async (user, req, res) => {
  // Create email confirmation token.
  const token = new db.Token({
    _userId: user._id,
    token: crypto.randomBytes(16).toString('hex')
  });
  await token.save();

  const transporter = nodemailer.createTransport({
    service: 'Sendgrid',
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_PASSWORD
    }
  });
  const mailOptions = {
    from: 'no-reply@awarewolf.com',
    to: user.email,
    subject: 'Awarewolf Account Verification',
    text: `Hi ${capitaliseWord(user.username)},\n\n` +
          `Please verify your email by clicking the following link: \nhttp:\/\/${req.headers.host}\/auth\/confirm\/${token.token}.\n`
  };
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).json({ messages: ['Error sending verification email.'] });
    }
    return res.status(200).json({ success: true, data: `Verification email sent.` });
  });
};

userController.login = async (req, res) => {
  req.check('email', 'Email is not valid.').isEmail();
  req.check('email', 'Email cannot be blank.').notEmpty();
  req.check('password', 'Password cannot be blank.').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const user = await db.User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ messages: ['Email address not found.'] });
    
    if (!comparePasswords(req.body.password, user.password)) return res.status(401).json({ messages: 'Invalid password.' });

    if (!user.isVerified) return res.status(401).json({ messages: ['Account has not been verified.'] });

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        id: user._id,
        token: signJwt(user),
        avatar: user.avatar,
        roles: user.roles
      }
    });
  } catch (err) {
    res.status(500).json({ messages: ['Database error.'] });
  }
};

userController.create = async (req, res) => {
  req.check('email', 'Email is not valid.').isEmail();
  req.check('email', 'Email cannot be blank.').notEmpty();
  req.check('password', 'Password must be at least 8 characters long.').len(8);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  // Check for validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    let user = await db.User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ messages: ['Email is already in use.'] });

    // Check if Wolfgang email.
    if (req.body.email.split('@')[1] !== 'wolfgangdigital.com') {
      return res.status(401).json({ messages: ['Must be a valid Wolfgang email.'] });
    }

    const username = req.body.email.split('@')[0].replace('_', ' ').replace('.', ' ');
    user = new db.User({
      username,
      password: req.body.password,
      email: req.body.email
    });
    await user.save();
    
    await sendConfirmationEmail(user, req, res);
    
  } catch (err) {
    res.status(500).json({ messages: ['Database error.'] });
  }
};

userController.confirmEmail = async (req, res) => {
  try {
    const token = await db.Token.findOne({ token: req.params.token });
    if (!token) return res.status(400).send('Unable to find a valid token. Your token may have expired.');

    const user = await db.User.findOne({ _id: token._userId });

    if (!user) return res.status(400).send('Unable to find a user associated with this token.');

    if (user.isVerified) return res.status(400).send('User already verified.');

    await user.update({ $set: { 'isVerified': true }});
    res.status(200).send('Your account has been verified. You may log in now.');

  } catch (err) {
    res.status(500).send('Error locating user or token.');
  }
};

userController.resendToken = async (req, res) => {
  req.check('email', 'Email is not valid.').isEmail();
  req.check('email', 'Email cannot be blank.').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  // Check validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const user = await db.User.findOne({ email: req.email });

    if (!user) return res.status(400).json({ messages: ['Unable to find a user with this email.'] });

    if (user.isVerified) return res.status(400).json({ messages: ['This account has already been verfied.'] });

    await sendConfirmationEmail(user, req, res);

  } catch (err) {
    res.status(500).json({ messages: ['Error locating user or token.'] });
  }
};

// Handle user avatar uploads.
userController.upload = async (req, res) => {
  const { user, file } = req;
  if (!file) return res.status(400).json({ messages: ['Invalid file upload.'] });

  try {
    cloudinary.config({
      cloud_name: 'wg-assets',
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET
    });
    cloudinary.v2.uploader.upload_stream({
      public_id: `Awarewolf/${user._id}`,
      use_filename: true, 
      resource_type: 'raw',
    }, async (err, result) => {
      if (err) res.status(500).json({ messages: ['Error uploading file.'] });

      const updatedUser = await db.User.findByIdAndUpdate(
        user._id,
        { $set: { 'avatar': result.secure_url } },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: {
          username: updatedUser.username,
          id: updatedUser._id,
          token: signJwt(updatedUser),
          avatar: updatedUser.avatar,
          roles: updatedUser.roles
        }
      });
    })
    .end(file.buffer);
  } catch (err) {
    console.log(err.toString());
    return res.status(500).json({ messages: ['Error uploading image.'] });
  }
};

userController.removeAvatar = async (req, res) => {
  try {
    await req.user.update({ $set: { 'avatar': '' } });

    const updatedUser = await db.User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        username: updatedUser.username,
        id: updatedUser._id,
        token: signJwt(updatedUser),
        avatar: updatedUser.avatar,
        roles: updatedUser.roles
      }
    });

  } catch (err) {
    res.status(400).json({ messages: ['Error removing image.'] });
  }
};

userController.getUsers = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ messages: ['Unauthorised access.'] });

  try {
    const users = await db.User.find({}).select('-password');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(400).json({ messages: ['Error: Object not found.'] });
  }
};

userController.resetPassword = async (req, res) => {
  req.check('email', 'Email is not valid.').isEmail();
  req.check('email', 'Email cannot be blank.').notEmpty();

  // Check validation errors.
  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    const resetToken = crypto.randomBytes(16).toString('hex');

    const user = await db.User.findOneAndUpdate({
      'email': decodeURIComponent(req.params.email)
    }, {
      $set: { 
        'passwordResetToken': resetToken,
        'passwordResetExpires': Date.now() + 86400000
      }
    });

    const transporter = nodemailer.createTransport({
      service: 'Sendgrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      from: 'no-reply@awarewolf.com',
      to: user.email,
      subject: 'Awarewolf Password Reset',
      text: `Hi ${capitaliseWord(user.username)},\n\n` +
            `To reset your password click following link: \nhttps:\/\/awarewolf.netlify.com\/reset-password\/${resetToken}.\n\n` +
            `This link will expire in 24 hours.`
    };
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).json({ messages: ['Error sending password reset email.'] });
      }
      return res.status(200).json({ success: true, data: `Password reset email sent.` });
    });
  } catch (err) {
    console.log(error);
    res.status(400).json({ messages: [err.toString()] });
  }
};

userController.confirmReset = async (req, res) => {
  try {
    const { resetToken, password } = req.body.data;

    if (!resetToken || !password) return res.status(400).json({ messages: ['Missing password or token.'] });
   
    const user = await db.User.findOneAndUpdate({
      'passwordResetToken': resetToken,
      'passwordResetExpires': {
        $gt: Date.now()
      }
    },{
      $set: {
        'password': hashPassword(password),
        'passwordResetToken': '',
        'passwordResetExpires': null
      }
    })
    
    if (user) {
      res.status(200).json({
        success: true,
        data: {
          username: user.username,
          id: user._id,
          token: signJwt(user),
          avatar: user.avatar,
          roles: user.roles
        }
      });
    } else {
      res.status(400).json({ messages: ['Invalid or expired token.'] });
    }

  } catch(err) {
    res.status(400).json({ messages: ['User not found.'] })
  }
};

userController.getUserPreferences = async (req, res) => {
  req.check('userId', 'User ID cannot be blank.');

  const errors = req.validationErrors();
  if (errors) return res.status(400).json({ messages: errors.map(e => e.msg) });

  try {
    let preferences = await db.Preferences.findOne({ _user: req.params.userId });

    if (!preferences) {
      preferences = new db.Preferences({
        _user: req.params.userId,
        metrics: ['roas', 'traffic', 'conversions'],
        services: ['seo', 'paid search', 'social']
      });
    }

    res.status({
      success: true,
      data: preferences
    });
  } catch (err) {
    res.status(400).json({ messages: [err.toString()] })
  }
};

export default userController;