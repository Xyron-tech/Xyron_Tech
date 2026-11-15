import mongoose from "mongoose";
import {env} from "./env.js";

export async function connectDB(){
  if(mongoose.connection.readyState===1)return;
  mongoose.set("strictQuery",true);
  await mongoose.connect(env.MONGODB_URI,{
    autoIndex:env.NODE_ENV!=="production",
    serverSelectionTimeoutMS:8000
  });
  console.log("MongoDB connected");
}
