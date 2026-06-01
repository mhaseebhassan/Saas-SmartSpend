import dns from "node:dns";
import mongoose from "mongoose";

const MONGODB_DNS_SERVERS = process.env.MONGODB_DNS_SERVERS;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Add it to your deployment environment variables.");
  }

  return uri;
}

function configureDns(uri: string) {
  if (MONGODB_DNS_SERVERS && uri.startsWith("mongodb+srv://")) {
    dns.setServers(MONGODB_DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean));
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getMongoUri();
    configureDns(uri);

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB Connected Successfully");
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
