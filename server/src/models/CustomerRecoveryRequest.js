import mongoose from "mongoose";

const schema=new mongoose.Schema({
  businessId:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
  customerId:{type:mongoose.Schema.Types.ObjectId,ref:"Customer",default:null},
  email:{type:String,required:true,lowercase:true,trim:true,maxlength:160},
  phone:{type:String,required:true,trim:true,maxlength:15},
  status:{type:String,enum:["OPEN","IN_REVIEW","RESOLVED"],default:"OPEN",index:true},
  reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
  reviewedAt:Date
},{timestamps:true});

schema.index({status:1,createdAt:-1});

export default mongoose.model("CustomerRecoveryRequest",schema);
