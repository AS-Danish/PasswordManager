import mongoose from 'mongoose';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY; // Must be 32 chars

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

// Encrypt password before saving
passwordSchema.pre('save', async function(next) {
  if (!this.isModified('password.encryptedData')) {
    return next();
  }
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(this.password.encryptedData);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    this.password.encryptedData = encrypted.toString('hex');
    this.password.iv = iv.toString('hex');
    next();
  } catch (error) {
    next(error);
  }
});

// Method to decrypt password
passwordSchema.methods.getDecryptedPassword = function() {
  try {
    const iv = Buffer.from(this.password.iv, 'hex');
    const encryptedText = Buffer.from(this.password.encryptedData, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export const Password = mongoose.model('Password', passwordSchema); 