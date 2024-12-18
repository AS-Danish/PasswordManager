import mongoose from 'mongoose';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long!';

// Move encryption functions outside schema
const encryptPassword = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
};

const decryptPassword = (encryptedData, iv) => {
  try {
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedText = Buffer.from(encryptedData, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), ivBuffer);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

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

// Update the decrypt method
passwordSchema.methods.getDecryptedPassword = function() {
  return decryptPassword(this.password.encryptedData, this.password.iv);
};

export const Password = mongoose.model('Password', passwordSchema); 
export { encryptPassword, decryptPassword }; 