import mongoose from "mongoose";

// Define a User schema with extended fields
const UserSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    profileAvatar: { type: String }, // URL for profile avatar
    password: { type: String }, // Encrypted password if needed
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

export default User;