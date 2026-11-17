import {useEffect,useState} from "react";
import {api,getApiError,waitForApi} from "../lib/api";
import {AuthContext} from "./authContext";
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[authError,setAuthError]=useState(""),[apiConnectionMessage,setApiConnectionMessage]=useState("");
 async function refreshUser(){setLoading(true);try{await waitForApi(setApiConnectionMessage);const {data}=await api.get("/auth/me",{timeout:30000});setUser(data.user);setAuthError("");}catch(error){setAuthError(getApiError(error));throw error;}finally{setApiConnectionMessage("");setLoading(false);}}
 useEffect(()=>{
  let active=true;
  async function loadSession(){
   try{
    await waitForApi(message=>{if(active)setApiConnectionMessage(message);});
    if(!active)return;
    const {data}=await api.get("/auth/me",{timeout:30000});
    if(active){setUser(data.user);setAuthError("");}
   }catch(error){if(active)setAuthError(getApiError(error));}
   finally{if(active){setApiConnectionMessage("");setLoading(false);}}
  }
  loadSession();
  return ()=>{active=false;};
 },[]);
 async function logout(){try{await api.post("/auth/logout");}finally{setUser(null);}}
 return <AuthContext.Provider value={{user,loading,authError,apiConnectionMessage,setUser,refreshUser,logout}}>{children}</AuthContext.Provider>;
}
