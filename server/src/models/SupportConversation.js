import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
  senderId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  senderRole:{type:String,enum:["BUSINESS_OWNER","SUPER_ADMIN"],required:true},
  body:{type:String,required:true,trim:true,maxlength:2000},
  important:{type:Boolean,default:false},
  createdAt:{type:Date,default:Date.now}
},{_id:true});

const schema=new mongoose.Schema({
  businessId:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
  subject:{type:String,required:true,trim:true,minlength:3,maxlength:120},
  category:{type:String,enum:["SUBSCRIPTION","PAYMENT","STORE","TECHNICAL","OTHER"],required:true,index:true},
  requestedPlan:{type:String,enum:["STARTER","GROWTH","PRO"],default:null},
  status:{type:String,enum:["OPEN","IN_PROGRESS","RESOLVED"],default:"OPEN",index:true},
  broadcastId:{type:String,default:"",index:true},
  messages:{type:[messageSchema],default:[]},
  lastMessageAt:{type:Date,default:Date.now,index:true},
  unreadForBusiness:{type:Boolean,default:false,index:true},
  unreadForSuperAdmin:{type:Boolean,default:false,index:true}
},{timestamps:true});

schema.index({businessId:1,lastMessageAt:-1});
schema.index({status:1,lastMessageAt:-1});

export default mongoose.model("SupportConversation",schema);
