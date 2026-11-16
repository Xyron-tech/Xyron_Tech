import {BrowserRouter} from "react-router-dom";
import WholesaleApp from "./WholesaleApp/App.jsx";
import {AuthProvider} from "./WholesaleApp/context/AuthContext.jsx";
import "./WholesaleApp/styles.css";

export default function WholesaleExperience(){
  return <BrowserRouter basename="/wholesale">
    <AuthProvider>
      <WholesaleApp/>
    </AuthProvider>
  </BrowserRouter>;
}
