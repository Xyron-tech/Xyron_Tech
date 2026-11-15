import axios from "axios";
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||"/api",timeout:15000,withCredentials:true,headers:{"Content-Type":"application/json"}});
export const getApiError=e=>{
 const response=e?.response,data=response?.data;
 if(!response||([500,502,503,504].includes(response.status)&&!data?.message))return "Cannot reach the API. Check that the backend is running and configured.";
 return data?.message||"Something went wrong. Please try again.";
};
