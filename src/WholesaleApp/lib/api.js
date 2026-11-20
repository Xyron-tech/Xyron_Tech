import axios from "axios";
import {resolveApiBaseUrl} from "./apiBaseUrl";
const configuredApiUrl=(import.meta.env.VITE_API_URL||"").trim();
const sameOriginApiUrl=typeof window==="undefined"?"/api":new URL("/api",window.location.origin).toString();
const apiBaseUrl=resolveApiBaseUrl(configuredApiUrl,import.meta.env.PROD,sameOriginApiUrl);
export const api=axios.create({baseURL:apiBaseUrl,timeout:15000,withCredentials:true,headers:{"Content-Type":"application/json"}});
const API_READY_TIMEOUT_MS=120000;
const API_HEALTH_TIMEOUT_MS=20000;
const API_RETRY_DELAY_MS=2500;
const API_READY_CACHE_MS=30000;
const readinessListeners=new Set();
let readinessPromise=null;
let apiReadyUntil=0;

class ApiUnavailableError extends Error{
 constructor(message){
  super(message);
  this.name="ApiUnavailableError";
  this.code="API_NOT_READY";
 }
}

function notifyReadinessListeners(message){
 for(const listener of readinessListeners)listener(message);
}

function delay(milliseconds){
 return new Promise(resolve=>setTimeout(resolve,milliseconds));
}

async function checkApiReadiness(){
 const deadline=Date.now()+API_READY_TIMEOUT_MS;
 notifyReadinessListeners("Connecting to the server. Please wait...");
 while(Date.now()<deadline){
  const remaining=deadline-Date.now();
  try{
   const {data}=await api.get("/health",{timeout:Math.min(API_HEALTH_TIMEOUT_MS,remaining)});
   if(data?.status!=="ok")throw new Error("The health endpoint did not confirm readiness.");
   apiReadyUntil=Date.now()+API_READY_CACHE_MS;
   notifyReadinessListeners("");
   return;
  }catch(error){
   if(error?.response&&error.response.status<500){
    throw new ApiUnavailableError("The server health check could not be completed. Please try again in a moment.");
   }
   const waitTime=deadline-Date.now();
   if(waitTime<=0)break;
   notifyReadinessListeners("The server is waking up after being idle. It can take up to 1–2 minutes; please keep this page open.");
   await delay(Math.min(API_RETRY_DELAY_MS,waitTime));
  }
 }
 throw new ApiUnavailableError("The server is taking longer than usual to start. Your request was not sent. Please wait a little and try again.");
}

export function waitForApi(onStatus){
 if(onStatus){
  readinessListeners.add(onStatus);
  onStatus("Connecting to the server. Please wait...");
 }
 if(Date.now()<apiReadyUntil){
  if(onStatus){
   readinessListeners.delete(onStatus);
   onStatus("");
  }
  return Promise.resolve();
 }
 if(!readinessPromise){
  readinessPromise=checkApiReadiness().finally(()=>{readinessPromise=null;});
 }
 const currentReadiness=readinessPromise;
 return currentReadiness.finally(()=>{if(onStatus)readinessListeners.delete(onStatus);});
}

export const getApiError=e=>{
 if(e?.code==="API_NOT_READY")return e.message;
 const response=e?.response,data=response?.data;
 if(!response){
  if(["ECONNABORTED","ETIMEDOUT"].includes(e?.code))return "The server did not respond in time. Refresh and check whether your action completed before trying again.";
  if(e?.code==="ERR_NETWORK")return "The connection to the server was interrupted. Check your internet connection and try again.";
  return "Could not complete the request. Please try again. If it continues, contact support.";
 }
 if(data?.message)return data.requestId?`${data.message} Reference: ${data.requestId}.`:data.message;
 return `The server returned an unexpected response (HTTP ${response.status}). Please try again${data?.requestId?` and share reference ${data.requestId} with support`:""} if it continues.`;
};
