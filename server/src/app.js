import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import {rateLimit} from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import {notFound,errorHandler} from "./middleware/errors.js";
import {env} from "./config/env.js";

const allowedOrigins=new Set([env.CLIENT_ORIGIN]);
if(env.NODE_ENV!=="production"){
  const configuredOrigin=new URL(env.CLIENT_ORIGIN);
  if(["localhost","127.0.0.1"].includes(configuredOrigin.hostname)){
    for(const hostname of ["localhost","127.0.0.1"]){
      allowedOrigins.add(`${configuredOrigin.protocol}//${hostname}${configuredOrigin.port?`:${configuredOrigin.port}`:""}`);
    }
  }
}

const app=express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin,callback){return callback(null,!origin||allowedOrigins.has(origin));},
  credentials:true,
  methods:["GET","POST","PATCH","DELETE"],
  allowedHeaders:["Content-Type","X-Order-Access-Token"]
}));
app.use(express.json({limit:"1mb"}));
app.use(cookieParser());
app.get("/api/health",(req,res)=>res.json({status:"ok",service:"xyron-wholesale-api"}));
app.use("/api/auth",rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:"draft-7",legacyHeaders:false}),authRoutes);
app.use("/api/super-admin",superAdminRoutes);
app.use("/api/testimonials",testimonialRoutes);
app.use("/api",storeRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
