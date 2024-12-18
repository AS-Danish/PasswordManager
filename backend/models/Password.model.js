import mongoose from 'mongoose';

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
    encryptedData: {
      type: String,
      required: true
    },
    iv: {
      type: String,
      required: true
    }
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

export const Password = mongoose.model('Password', passwordSchema); 