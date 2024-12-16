import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: false
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: false
    }
}, {timestamps: true});

const User = mongoose.model('User', UserSchema);

export default User;