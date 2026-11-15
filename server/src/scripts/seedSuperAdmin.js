import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {env} from "../config/env.js";
import User from "../models/User.js";

if(!env.SUPER_ADMIN_EMAIL||!env.SUPER_ADMIN_PASSWORD){
 console.error("Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in the repository root .env");
 process.exit(1);
}

await mongoose.connect(env.MONGODB_URI);

try{
 const email=env.SUPER_ADMIN_EMAIL.toLowerCase();
 const existing=await User.findOne({email}).select("+passwordHash");

 if(existing){
  if(existing.role!=="SUPER_ADMIN"){
   throw new Error("SUPER_ADMIN_EMAIL belongs to a non-admin account; refusing to change its role.");
  }

  let changed=false;
  if(existing.name!==env.SUPER_ADMIN_NAME){
   existing.name=env.SUPER_ADMIN_NAME;
   changed=true;
  }
  if(!(await bcrypt.compare(env.SUPER_ADMIN_PASSWORD,existing.passwordHash))){
   existing.passwordHash=await bcrypt.hash(env.SUPER_ADMIN_PASSWORD,12);
   changed=true;
  }

  if(changed){
   await existing.save();
   console.log("Super Admin credentials synchronized from .env.");
  }else{
   console.log("Super Admin credentials already match .env.");
  }
 }else{
  const passwordHash=await bcrypt.hash(env.SUPER_ADMIN_PASSWORD,12);
  await User.create({name:env.SUPER_ADMIN_NAME,email,phone:"0000000000",passwordHash,role:"SUPER_ADMIN",accountStatus:"ACTIVE"});
  console.log("Super Admin created from .env.");
 }
}finally{
 await mongoose.disconnect();
}
