import mongoose from "mongoose";

const schema=new mongoose.Schema({
  phone:{type:String,required:true,unique:true,trim:true},
  customerName:{type:String,default:"",trim:true,maxlength:100},
  deliveryAddress:{type:String,default:"",trim:true,maxlength:500},
  pincode:{type:String,default:"",match:/^$|^\d{6}$/},
  email:{type:String,lowercase:true,trim:true},
  passwordHash:{type:String,required:true,select:false},
  lastLoginAt:Date
},{timestamps:true});

schema.index({email:1},{unique:true,sparse:true});

export default mongoose.model("Customer",schema);
