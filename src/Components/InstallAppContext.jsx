import {createContext,useContext,useEffect,useState} from "react";
import {Download,X} from "lucide-react";

const InstallAppContext=createContext(null);

function isStandalone(){
  return typeof window!=="undefined"&&(
    window.matchMedia?.("(display-mode: standalone)")?.matches||
    window.navigator.standalone===true
  );
}

export function InstallAppProvider({children}){
  const [deferredPrompt,setDeferredPrompt]=useState(null);
  const [isInstalled,setIsInstalled]=useState(isStandalone);

  useEffect(()=>{
    const handleBeforeInstallPrompt=event=>{
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const handleAppInstalled=()=>{
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt",handleBeforeInstallPrompt);
    window.addEventListener("appinstalled",handleAppInstalled);
    return ()=>{
      window.removeEventListener("beforeinstallprompt",handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled",handleAppInstalled);
    };
  },[]);

  async function installApp(){
    if(!deferredPrompt)return "unavailable";
    const prompt=deferredPrompt;
    await prompt.prompt();
    const {outcome}=await prompt.userChoice;
    setDeferredPrompt(null);
    if(outcome==="accepted")setIsInstalled(true);
    return outcome;
  }

  return <InstallAppContext.Provider value={{canPrompt:Boolean(deferredPrompt),installApp,isInstalled}}>
    {children}
  </InstallAppContext.Provider>;
}

function useInstallApp(){
  const context=useContext(InstallAppContext);
  if(!context)throw new Error("useInstallApp must be used within InstallAppProvider.");
  return context;
}

export function InstallAppButton({
  containerClassName="profile-install",
  buttonClassName="profile-install-button",
  helpClassName="profile-install-help",
  label="Install Xyron app"
}){
  const {canPrompt,installApp,isInstalled}=useInstallApp();
  const [message,setMessage]=useState("");
  const instructions=/iPhone|iPad|iPod/.test(window.navigator.userAgent)
    ?"Tap Share in Safari, then choose Add to Home Screen."
    :"Open your browser menu and choose Install app or Add to Home screen.";

  async function handleInstall(){
    setMessage("");
    if(!canPrompt){
      setMessage(instructions);
      return;
    }
    try{
      const outcome=await installApp();
      if(outcome!=="accepted")setMessage("Installation was canceled. You can try again from your browser menu.");
    }catch(error){
      console.error("Could not open the app installation prompt:",error);
      setMessage("The install prompt could not be opened. Use your browser menu to install the app.");
    }
  }

  if(isInstalled)return null;
  return <div className={containerClassName}>
    <button className={buttonClassName} type="button" onClick={handleInstall}><Download size={16}/>{label}</button>
    {message&&<div className={helpClassName} role="status"><span>{message}</span><button type="button" aria-label="Dismiss install instructions" onClick={()=>setMessage("")}><X size={14}/></button></div>}
  </div>;
}
