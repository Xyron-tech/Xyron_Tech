import jwt from "jsonwebtoken";import User from "../models/User.js";import Customer from "../models/Customer.js";import {env} from "../config/env.js";
export async function requireAuth(req,res,next){try{const token=req.cookies?.xyron_session;if(!token)return res.status(401).json({message:"Please sign in to continue."});const payload=jwt.verify(token,env.JWT_SECRET);const user=await User.findById(payload.sub);if(!user||["SUSPENDED","REJECTED"].includes(user.accountStatus))return res.status(401).json({message:"Your account is not available."});req.user=user;next();}catch{return res.status(401).json({message:"Your session is invalid or has expired."});}}
export async function optionalAuth(req,res,next){
 const token=req.cookies?.xyron_session;
 if(!token){req.user=null;return next();}
 let payload;
 try{payload=jwt.verify(token,env.JWT_SECRET);}
 catch{
  res.clearCookie("xyron_session",{httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax",path:"/"});
  req.user=null;
  return next();
 }
 try{
  const user=await User.findById(payload.sub);
  if(!user||["SUSPENDED","REJECTED"].includes(user.accountStatus)){
   res.clearCookie("xyron_session",{httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax",path:"/"});
   req.user=null;
   return next();
  }
  req.user=user;
  return next();
 }catch(error){return next(error);}
}
export async function optionalCustomerAuth(req,res,next){
 const token=req.cookies?.xyron_customer_session;
 if(!token){req.customer=null;return next();}
 let payload;
 try{payload=jwt.verify(token,env.JWT_SECRET);}
 catch{
  res.clearCookie("xyron_customer_session",{httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax",path:"/"});
  req.customer=null;
  return next();
 }
 if(payload.kind!=="customer"){
  res.clearCookie("xyron_customer_session",{httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax",path:"/"});
  req.customer=null;
  return next();
 }
 try{
  const customer=await Customer.findById(payload.sub);
  if(!customer){
   res.clearCookie("xyron_customer_session",{httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax",path:"/"});
   req.customer=null;
   return next();
  }
  req.customer=customer;
  return next();
 }catch(error){return next(error);}
}
export async function requireCustomerAuth(req,res,next){
 return optionalCustomerAuth(req,res,()=>{
  if(!req.customer)return res.status(401).json({message:"Sign in to your customer account to continue."});
  return next();
 });
}
export function requireRole(...roles){return(req,res,next)=>{if(!req.user||!roles.includes(req.user.role))return res.status(403).json({message:"You do not have permission."});next();};}
export function requireActiveBusiness(req,res,next){if(req.user?.role!=="BUSINESS_OWNER"||req.user.accountStatus!=="ACTIVE"||!req.user.businessId)return res.status(403).json({message:"Business approval is required."});req.tenantId=req.user.businessId.toString();next();}
