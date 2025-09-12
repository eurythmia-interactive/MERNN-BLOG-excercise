import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null; // The Mongoose connection instance
  promise: Promise<typeof mongoose> | null; // A promise that resolves to the Mongoose connection instance
}

// 1. Extend the global object's type, declaring 'mongoose' as MongooseCache.
// We remove ' | undefined' here because we will ensure it's always initialized below.
declare global {
  var mongoose: MongooseCache;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */

// 2. Initialize global.mongoose if it doesn't exist.
// This ensures that `global.mongoose` is always a `MongooseCache` object
// before `cached` is even assigned. This satisfies the `declare global` assertion at runtime.
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

// 3. Now, `cached` can be confidently assigned from `global.mongoose`,
// and TypeScript will know its type is `MongooseCache`.
// Using `const` is also better here as `cached` itself is not reassigned after this point.
const cached = global.mongoose;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;