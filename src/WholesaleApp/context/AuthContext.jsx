import {createContext,useContext,useEffect,useState} from "react";
import {api,getApiError} from "../lib/api";
const Ctx=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[authError,setAuthError]=useState("");
 async function refreshUser(){setLoading(true);try{const {data}=await api.get("/auth/me");setUser(data.user);setAuthError("");}catch(error){setAuthError(getApiError(error));throw error;}finally{setLoading(false);}}
 useEffect(()=>{refreshUser().catch(()=>{});},[]);
 async function logout(){try{await api.post("/auth/logout");}finally{setUser(null);}}
 return <Ctx.Provider value={{user,loading,authError,setUser,refreshUser,logout}}>{children}</Ctx.Provider>;
}
export const useAuth=()=>useContext(Ctx);
