import {randomUUID} from "node:crypto";
import mongoose from "mongoose";
import {z} from "zod";
import Business from "../models/Business.js";
import Order from "../models/Order.js";
import SupportConversation from "../models/SupportConversation.js";

const categorySchema=z.enum(["SUBSCRIPTION","PAYMENT","STORE","TECHNICAL","OTHER"]);
const messageSchema=z.object({body:z.string().trim().min(2).max(2000),important:z.boolean().optional().default(false)});
const newConversationSchema=z.object({
  subject:z.string().trim().min(3).max(120),
  category:categorySchema,
  body:z.string().trim().min(2).max(2000),
  requestedPlan:z.enum(["STARTER","GROWTH","PRO"]).optional()
}).superRefine((value,ctx)=>{
  if(value.requestedPlan&&value.category!=="SUBSCRIPTION")ctx.addIssue({code:"custom",message:"A requested plan must use the subscription topic.",path:["category"]});
});
const broadcastSchema=z.object({
  scope:z.enum(["ALL","SELECTED"]),
  businessIds:z.array(z.string().refine(mongoose.isValidObjectId)).max(100).default([]),
  subject:z.string().trim().min(3).max(120),
  category:categorySchema,
  body:z.string().trim().min(2).max(2000),
  important:z.boolean().optional().default(false)
}).superRefine((value,ctx)=>{
  if(value.scope==="SELECTED"&&!value.businessIds.length){
    ctx.addIssue({code:"custom",message:"Select at least one business for this message.",path:["businessIds"]});
  }
});

function firstIssue(error){
  return error.issues?.[0]?.message||"Please check the message details.";
}

export async function getBusinessInboxCounts(req,res){
  const [pendingOrders,unreadConversations,unreadOrders]=await Promise.all([
    Order.countDocuments({businessId:req.tenantId,businessArchivedAt:null,status:"PLACED"}),
    SupportConversation.countDocuments({businessId:req.tenantId,unreadForBusiness:true}),
    Order.find({businessId:req.tenantId,businessArchivedAt:null,unreadBusinessMessages:{$gt:0}}).select("unreadBusinessMessages").lean()
  ]);
  const unreadOrderMessages=unreadOrders.reduce((total,order)=>total+(order.unreadBusinessMessages||0),0);
  res.json({pendingOrders,unreadConversations,unreadOrderMessages});
}

export async function getCustomerInboxCounts(req,res){
  const business=await Business.findOne({slug:req.params.slug,status:"ACTIVE"}).select("_id");
  if(!business)return res.status(404).json({message:"This store is not available."});
  const unreadOrders=await Order.find({businessId:business._id,customerId:req.customer._id,customerArchivedAt:null,unreadCustomerMessages:{$gt:0}}).select("unreadCustomerMessages").lean();
  const unreadOrderMessages=unreadOrders.reduce((total,order)=>total+(order.unreadCustomerMessages||0),0);
  res.json({unreadOrderMessages});
}

export async function getSuperAdminInboxCounts(req,res){
  const unreadConversations=await SupportConversation.countDocuments({unreadForSuperAdmin:true});
  res.json({unreadConversations});
}

export async function listBusinessSupport(req,res){
  const [conversations,latestBroadcast]=await Promise.all([
    SupportConversation.find({businessId:req.tenantId}).sort({lastMessageAt:-1}).limit(100).lean(),
    SupportConversation.findOne({businessId:req.tenantId,broadcastId:{$ne:""}}).sort({lastMessageAt:-1}).lean()
  ]);
  res.json({conversations,latestBroadcast});
}

export async function createBusinessSupport(req,res){
  const parsed=newConversationSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:firstIssue(parsed.error)});
  const conversation=await SupportConversation.create({
    businessId:req.tenantId,
    subject:parsed.data.subject,
    category:parsed.data.category,
    requestedPlan:parsed.data.requestedPlan||null,
    messages:[{senderId:req.user._id,senderRole:"BUSINESS_OWNER",body:parsed.data.body}],
    lastMessageAt:new Date(),
    unreadForSuperAdmin:true
  });
  res.status(201).json({conversation,message:"Your message was sent to Xyron Super Admin."});
}

export async function getBusinessSupport(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid support conversation ID."});
  const conversation=await SupportConversation.findOne({_id:req.params.id,businessId:req.tenantId});
  if(!conversation)return res.status(404).json({message:"Support conversation not found."});
  if(conversation.unreadForBusiness){conversation.unreadForBusiness=false;await conversation.save();}
  res.json({conversation});
}

export async function replyBusinessSupport(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid support conversation ID."});
  const parsed=messageSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:firstIssue(parsed.error)});
  const conversation=await SupportConversation.findOne({_id:req.params.id,businessId:req.tenantId});
  if(!conversation)return res.status(404).json({message:"Support conversation not found."});
  conversation.messages.push({senderId:req.user._id,senderRole:"BUSINESS_OWNER",body:parsed.data.body});
  conversation.status="OPEN";
  conversation.lastMessageAt=new Date();
  conversation.unreadForSuperAdmin=true;
  conversation.unreadForBusiness=false;
  await conversation.save();
  res.status(201).json({conversation,message:"Your reply was sent."});
}

export async function listSupportBusinesses(req,res){
  const businesses=await Business.find({status:"ACTIVE"}).select("_id name slug").sort({name:1}).lean();
  res.json({businesses});
}

export async function listSuperAdminSupport(req,res){
  const status=["OPEN","IN_PROGRESS","RESOLVED"].includes(req.query.status)?req.query.status:null;
  const filter={...(status?{status}:{}),...(req.query.unread==="true"?{unreadForSuperAdmin:true}:{})};
  const conversations=await SupportConversation.find(filter).populate("businessId","name slug").sort({lastMessageAt:-1}).limit(200);
  res.json({conversations});
}

export async function getSuperAdminSupport(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid support conversation ID."});
  const conversation=await SupportConversation.findById(req.params.id).populate("businessId","name slug");
  if(!conversation)return res.status(404).json({message:"Support conversation not found."});
  if(conversation.unreadForSuperAdmin){conversation.unreadForSuperAdmin=false;await conversation.save();}
  res.json({conversation});
}

export async function replySuperAdminSupport(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid support conversation ID."});
  const parsed=messageSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:firstIssue(parsed.error)});
  const conversation=await SupportConversation.findById(req.params.id);
  if(!conversation)return res.status(404).json({message:"Support conversation not found."});
  conversation.messages.push({senderId:req.user._id,senderRole:"SUPER_ADMIN",body:parsed.data.body,important:parsed.data.important});
  if(conversation.status==="OPEN")conversation.status="IN_PROGRESS";
  conversation.lastMessageAt=new Date();
  conversation.unreadForBusiness=true;
  conversation.unreadForSuperAdmin=false;
  await conversation.save();
  await conversation.populate("businessId","name slug");
  res.status(201).json({conversation,message:"Your reply was sent to the business."});
}

export async function updateSupportStatus(req,res){
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:"Invalid support conversation ID."});
  const parsed=z.object({status:z.enum(["OPEN","IN_PROGRESS","RESOLVED"])}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:"Choose a valid support status."});
  const conversation=await SupportConversation.findByIdAndUpdate(req.params.id,{$set:{status:parsed.data.status}},{new:true}).populate("businessId","name slug");
  if(!conversation)return res.status(404).json({message:"Support conversation not found."});
  res.json({conversation});
}

export async function broadcastToBusinesses(req,res){
  const parsed=broadcastSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:firstIssue(parsed.error)});
  const businessFilter=parsed.data.scope==="ALL"
    ?{status:"ACTIVE"}
    :{_id:{$in:[...new Set(parsed.data.businessIds)]},status:"ACTIVE"};
  const businesses=await Business.find(businessFilter).select("_id").lean();
  if(!businesses.length)return res.status(404).json({message:"No active businesses matched this message."});
  if(parsed.data.scope==="SELECTED"&&businesses.length!==new Set(parsed.data.businessIds).size){
    return res.status(400).json({message:"One or more selected businesses are not active."});
  }
  const broadcastId=randomUUID();
  const now=new Date();
  const conversations=businesses.map(({_id})=>({
    businessId:_id,
    subject:parsed.data.subject,
    category:parsed.data.category,
    status:"OPEN",
    broadcastId,
    messages:[{senderId:req.user._id,senderRole:"SUPER_ADMIN",body:parsed.data.body,important:parsed.data.important,createdAt:now}],
    lastMessageAt:now,
    unreadForBusiness:true,
    unreadForSuperAdmin:false
  }));
  await SupportConversation.insertMany(conversations);
  res.status(201).json({message:`Message delivered to ${businesses.length} business${businesses.length===1?"":"es"}.`,recipientCount:businesses.length,broadcastId});
}
