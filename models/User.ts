import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
email: {
  type: String,
  required: [true, 'Email is required'],
  unique: true,
  lowercase: true,
  trim: true,
  // Change this line to the more robust regex:
  match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
},
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Do not return password by default
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Mongoose pre-save middleware to hash the password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) { // Removed ': any'. 'error' is now 'unknown' or 'any' (implicitly)
    // Handle the error type safely:
    // If 'error' is 'unknown' (recommended tsconfig setting),
    // ensure it's an Error instance before passing to next().
    if (error instanceof Error) {
      next(error);
    } else {
      // If it's not an Error object, convert it to one.
      next(new Error(String(error)));
    }
  }
});

// This is a common pattern to prevent Mongoose from redefining the model
// during hot-reloads in development.
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;