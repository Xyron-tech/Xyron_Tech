import {useEffect,useState} from "react";
import {api,getApiError} from "../lib/api";
import {AuthContext} from "./authContext";
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[authError,setAuthError]=useState("");
 async function refreshUser(){setLoading(true);try{const {data}=await api.get("/auth/me");setUser(data.user);setAuthError("");}catch(error){setAuthError(getApiError(error));throw error;}finally{setLoading(false);}}
 useEffect(()=>{
  let active=true;
  api.get("/auth/me").then(({data})=>{if(active){setUser(data.user);setAuthError("");}}).catch(error=>{if(active)setAuthError(getApiError(error));}).finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[]);
 async function logout(){try{await api.post("/auth/logout");}finally{setUser(null);}}
 return <AuthContext.Provider value={{user,loading,authError,setUser,refreshUser,logout}}>{children}</AuthContext.Provider>;
}
