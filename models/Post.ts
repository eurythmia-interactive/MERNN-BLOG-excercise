import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

// Define an interface for the Post document
export interface IPost extends Document {
  title: string;
  content: string;
  slug: string;
  author: mongoose.Schema.Types.ObjectId;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This creates the relationship to the User model
    required: true,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to generate the slug from the title before saving
postSchema.pre<IPost>('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,      // convert to lower case
      strict: true,     // remove special characters
      remove: /[*+~.()'"!:@]/g // remove characters that slugify doesn't handle
    });
  }
  next();
});

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;
