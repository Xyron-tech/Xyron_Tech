import mongoose from "mongoose";

const schema=new mongoose.Schema({
  businessId:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
  name:{type:String,required:true,trim:true,maxlength:120},
  description:{type:String,default:"",trim:true,maxlength:1200},
  category:{type:String,required:true,trim:true,maxlength:80},
  weightCalculationMethod:{type:String,enum:["BUNDLE","PIECE"],default:"BUNDLE"},
  piecesPerBundle:{type:Number,min:1},
  bundleWeightGrams:{type:Number,min:0.000001},
  piecesPerKg:{type:Number,min:1},
  piecesPerPacket:{type:Number,min:1},
  packetWeightGrams:{type:Number,min:0.000001},
  packetPrice:{type:Number,required:true,min:0.01},
  stockPackets:{type:Number,required:true,min:0},
  imageUrl:{type:String,default:""},
  imagePublicId:{type:String,default:""},
  status:{type:String,enum:["ACTIVE","INACTIVE"],default:"ACTIVE",index:true}
},{timestamps:true});

schema.index({businessId:1,status:1,category:1});
schema.index({businessId:1,name:1},{unique:true});

export default mongoose.model("Product",schema);
