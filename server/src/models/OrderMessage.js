import mongoose from "mongoose";

const schema=new mongoose.Schema({
  businessId:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
  orderId:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true,index:true},
  senderRole:{type:String,enum:["BUSINESS_OWNER","CUSTOMER"],required:true},
  senderName:{type:String,required:true,trim:true,maxlength:100},
  body:{type:String,required:true,trim:true,maxlength:2000},
  eventKey:{type:String,enum:["ORDER_ACCEPTED"],default:null},
  kind:{type:String,enum:["TEXT","VOICE"],default:"TEXT"},
  voicePublicId:{type:String,default:"",select:false},
  voiceFormat:{type:String,default:"",select:false},
  durationSeconds:{type:Number,default:0,min:0,max:120}
},{timestamps:true});

schema.index({businessId:1,orderId:1,createdAt:1});
schema.index({orderId:1,eventKey:1},{unique:true,partialFilterExpression:{eventKey:"ORDER_ACCEPTED"}});
export default mongoose.model("OrderMessage",schema);
