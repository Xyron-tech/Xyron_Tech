import axios from "axios";
const configuredApiUrl=(import.meta.env.VITE_API_URL||"").trim();
const sameOriginApiUrl=typeof window==="undefined"?"/api":new URL("/api",window.location.origin).toString();
const localApiUrl=/^(?:https?:\/\/)?(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[?::1\]?)(?::\d+)?(?:\/|$)/i.test(configuredApiUrl);
const defaultApiUrl=import.meta.env.PROD?"https://xyron-wholesale.onrender.com/api":sameOriginApiUrl;
const apiBaseUrl=(configuredApiUrl&&!(import.meta.env.PROD&&localApiUrl)?configuredApiUrl:defaultApiUrl).replace(/\/+$/,"");
export const api=axios.create({baseURL:apiBaseUrl,timeout:15000,withCredentials:true,headers:{"Content-Type":"application/json"}});
export const getApiError=e=>{
 const response=e?.response,data=response?.data;
 if(!response||([500,502,503,504].includes(response.status)&&!data?.message))return "Cannot reach the API. Check that the backend is running and configured.";
 return data?.message||"Something went wrong. Please try again.";
};
