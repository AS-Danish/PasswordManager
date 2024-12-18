import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const passwordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'  // Reference to User model using clerkId
  },
  Username: {
    type: String,
    required: true,
    default: 'Nothing'
  },
  siteUrl: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
passwordSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Add method to decrypt password
passwordSchema.methods.decryptPassword = async function() {
  return this.password;
};

export const Password = mongoose.model('Password', passwordSchema); 