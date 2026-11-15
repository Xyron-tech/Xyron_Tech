import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {z} from "zod";
import Business from "../models/Business.js";
import Customer from "../models/Customer.js";
import CustomerRecoveryRequest from "../models/CustomerRecoveryRequest.js";
import Order from "../models/Order.js";
import {env} from "../config/env.js";
import {normalizePhone} from "../utils/phone.js";

const phoneSchema=z.string().trim().min(8).max(20).transform(normalizePhone).pipe(z.string().regex(/^\d{10,15}$/));
const pincodeSchema=z.string().trim().regex(/^[1-9]\d{5}$/,"Enter a valid 6-digit pincode.");
const registerSchema=z.object({
  customerName:z.string().trim().min(2).max(100),
  email:z.string().trim().email().max(160).transform(value=>value.toLowerCase()),
  phone:phoneSchema,
  pincode:pincodeSchema,
  deliveryAddress:z.string().trim().min(8).max(500),
  password:z.string().min(10).max(100),
  confirmPassword:z.string().min(10).max(100)
}).refine(value=>value.password===value.confirmPassword,{path:["confirmPassword"],message:"Passwords do not match."});
const loginSchema=z.object({identifier:z.string().trim().min(1).max(160),password:z.string().min(1).max(100)});
const recoverySchema=z.object({email:z.string().trim().email().max(160).transform(value=>value.toLowerCase()),phone:phoneSchema});
const profileSchema=z.object({
  customerName:z.string().trim().min(2).max(100),
  email:z.string().trim().email().max(160).transform(value=>value.toLowerCase()),
  phone:phoneSchema,
  pincode:pincodeSchema,
  deliveryAddress:z.string().trim().min(8).max(500),
  currentPassword:z.string().min(1).max(100),
  newPassword:z.string().max(100).optional().default(""),
  confirmNewPassword:z.string().max(100).optional().default("")
}).refine(value=>!value.newPassword||value.newPassword.length>=10,{path:["newPassword"],message:"A new password must be at least 10 characters."})
  .refine(value=>value.newPassword===value.confirmNewPassword,{path:["confirmNewPassword"],message:"New passwords do not match."});

function setCustomerSession(res,id){
  const token=jwt.sign({sub:id.toString(),kind:"customer"},env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN});
  res.cookie("xyron_customer_session",token,{
    httpOnly:true,
    secure:env.NODE_ENV==="production",
    sameSite:"lax",
    maxAge:8*60*60*1000,
    path:"/"
  });
}

const customerView=customer=>({id:customer._id,customerName:customer.customerName||"",deliveryAddress:customer.deliveryAddress||"",phone:customer.phone,pincode:customer.pincode||"",email:customer.email||""});
async function activeStore(req,res){
  const business=await Business.findOne({slug:req.params.slug,status:"ACTIVE"}).select("_id");
  if(!business)res.status(404).json({message:"This store is not available."});
  return business;
}

export async function registerCustomer(req,res){
  const business=await activeStore(req,res);
  if(!business)return;
  const parsed=registerSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:parsed.error.issues[0]?.message||"Enter valid account details."});
  if(await Customer.exists({$or:[{phone:parsed.data.phone},{email:parsed.data.email}]}))return res.status(409).json({message:"An account with this email or mobile number already exists. Sign in instead."});
  const passwordHash=await bcrypt.hash(parsed.data.password,12);
  const customer=await Customer.create({customerName:parsed.data.customerName,deliveryAddress:parsed.data.deliveryAddress,phone:parsed.data.phone,email:parsed.data.email,pincode:parsed.data.pincode,passwordHash});
  customer.lastLoginAt=new Date();
  await customer.save();
  setCustomerSession(res,customer._id);
  res.status(201).json({customer:customerView(customer)});
}

export async function loginCustomer(req,res){
  const business=await activeStore(req,res);
  if(!business)return;
  const parsed=loginSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:"Enter your email/mobile number and password."});
  const identifier=parsed.data.identifier;
  const normalizedEmail=identifier.toLowerCase();
  const phone=normalizePhone(identifier);
  const lookup=identifier.includes("@")?{email:normalizedEmail}:{phone};
  if(!identifier.includes("@")&&(phone.length<10||phone.length>15))return res.status(400).json({message:"Enter a valid email or mobile number."});
  const customer=await Customer.findOne(lookup).select("+passwordHash");
  if(!customer||!(await bcrypt.compare(parsed.data.password,customer.passwordHash)))return res.status(401).json({message:"Email/mobile number or password is incorrect."});
  customer.lastLoginAt=new Date();
  await customer.save();
  setCustomerSession(res,customer._id);
  res.json({customer:customerView(customer)});
}

export async function getCustomerSession(req,res){
  const business=await activeStore(req,res);
  if(!business)return;
  res.json({customer:req.customer?customerView(req.customer):null});
}

export async function updateCustomerProfile(req,res){
  const business=await activeStore(req,res);
  if(!business)return;
  const parsed=profileSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:parsed.error.issues[0]?.message||"Enter valid profile details."});
  const customer=await Customer.findById(req.customer._id).select("+passwordHash");
  if(!customer)return res.status(401).json({message:"Your customer account is no longer available. Please sign in again."});
  if(!(await bcrypt.compare(parsed.data.currentPassword,customer.passwordHash)))return res.status(401).json({message:"Your current password is incorrect."});
  const conflict=await Customer.exists({_id:{$ne:customer._id},$or:[{phone:parsed.data.phone},{email:parsed.data.email}]});
  if(conflict)return res.status(409).json({message:"That email or mobile number is already connected to another account."});
  customer.customerName=parsed.data.customerName;
  customer.deliveryAddress=parsed.data.deliveryAddress;
  customer.email=parsed.data.email;
  customer.phone=parsed.data.phone;
  customer.pincode=parsed.data.pincode;
  if(parsed.data.newPassword)customer.passwordHash=await bcrypt.hash(parsed.data.newPassword,12);
  await customer.save();
  setCustomerSession(res,customer._id);
  res.json({customer:customerView(customer),message:"Your profile was updated."});
}

export async function deleteCustomerProfile(req,res){
  const business=await activeStore(req,res);
  if(!business)return;
  const parsed=z.object({currentPassword:z.string().min(1).max(100)}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:"Enter your current password to delete the profile."});
  const customer=await Customer.findById(req.customer._id).select("+passwordHash");
  if(!customer)return res.status(401).json({message:"Your customer account is no longer available. Please sign in again."});
  if(!(await bcrypt.compare(parsed.data.currentPassword,customer.passwordHash)))return res.status(401).json({message:"Your current password is incorrect."});
  await Promise.all([
    Order.updateMany({customerId:customer._id},{$set:{customerId:null}}),
    CustomerRecoveryRequest.updateMany({customerId:customer._id},{$set:{customerId:null}})
  ]);
  await Customer.deleteOne({_id:customer._id});
  res.clearCookie("xyron_customer_session",{httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax",path:"/"});
  res.json({message:"Your login profile was deleted. Stores will retain existing order and chat records."});
}

export async function logoutCustomer(req,res){
  res.clearCookie("xyron_customer_session",{httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax",path:"/"});
  res.json({message:"Signed out."});
}

export async function createCustomerRecoveryRequest(req,res){
  const business=await activeStore(req,res);
  if(!business)return;
  const parsed=recoverySchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:"Enter the email and mobile number on your customer account."});
  const customer=await Customer.findOne({email:parsed.data.email,phone:parsed.data.phone}).select("_id");
  await CustomerRecoveryRequest.create({
    businessId:business._id,
    customerId:customer?._id||null,
    email:parsed.data.email,
    phone:parsed.data.phone
  });
  res.status(201).json({message:"Your help request was sent for manual review. We will verify your account details before assisting."});
}
