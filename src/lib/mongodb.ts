import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI environment variable");
  }

  if (!cached.promise) {
    // Cada instância de função mantém o próprio pool e atende uma requisição
    // por vez, então um pool grande só desperdiça o teto de conexões do
    // cluster. Com 3, o limite de 500 do Atlas M0 comporta ~166 instâncias
    // simultâneas; com o default de 100 do driver, cinco já o estourariam.
    const opts = {
      bufferCommands: false,
      maxPoolSize: 3,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
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
