import mongoose from "mongoose";

const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:100},
  company:{type:String,default:"",trim:true,maxlength:120},
  role:{type:String,default:"",trim:true,maxlength:100},
  location:{type:String,default:"",trim:true,maxlength:120},
  service:{type:String,default:"",trim:true,maxlength:80},
  duration:{type:String,default:"",trim:true,maxlength:80},
  website:{type:String,default:"",trim:true,maxlength:300},
  instagram:{type:String,default:"",trim:true,maxlength:300},
  message:{type:String,required:true,trim:true,maxlength:2000},
  photo:{type:String,default:""},
  voice:{type:String,default:""},
  verified:{type:Boolean,default:false},
  consent:{type:Boolean,required:true,validate:{validator:(value)=>value===true,message:"Consent is required to publish a testimonial."}},
  status:{type:String,enum:["PENDING","PUBLISHED","REJECTED"],default:"PENDING",index:true}
},{timestamps:true});

schema.index({status:1,createdAt:-1});

export default mongoose.model("Testimonial",schema);
