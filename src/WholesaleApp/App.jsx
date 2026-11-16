import {Navigate,Route,Routes} from "react-router-dom";
import {useAuth} from "./context/useAuth";
import Shell from "./components/Shell";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterBusiness from "./pages/RegisterBusiness";
import Pending from "./pages/Pending";
import SuperAdmin from "./pages/SuperAdmin";
import Storefront from "./pages/Storefront";
import StoreAdmin from "./pages/StoreAdmin";
import OrdersAdmin from "./pages/OrdersAdmin";
import CustomerOrder from "./pages/CustomerOrder";
import CustomerAccount from "./pages/CustomerAccount";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerRecoveryRequests from "./components/CustomerRecoveryRequests";
import BusinessSupport from "./pages/BusinessSupport";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import BusinessUpgrade from "./pages/BusinessUpgrade";
import SuperAdminSupport from "./pages/SuperAdminSupport";
import SuperAdminTestimonials from "./pages/SuperAdminTestimonials";
import SuperAdminUpgrades from "./pages/SuperAdminUpgrades";
import AccountProfile from "./pages/AccountProfile";
import BrandLoader from "../Components/BrandLoader";
function Protected({children,roles}){const {user,loading}=useAuth();if(loading)return <BrandLoader/>;if(!user)return <Navigate to="/login"/>;if(roles&&!roles.includes(user.role))return <Navigate to="/pending"/>;if(user.role==="BUSINESS_OWNER"&&user.accountStatus!=="ACTIVE")return <Navigate to="/pending"/>;return children;}
function HomeRoute(){const {user}=useAuth();if(user)return <Navigate to={user.role==="SUPER_ADMIN"?"/super-admin/applications":user.accountStatus==="ACTIVE"?"/dashboard":"/pending"}/>;return <Home/>;}
function SuperAdminDashboard(){return <><SuperAdmin/><CustomerRecoveryRequests/></>;}
export default function App(){return <Routes><Route element={<Shell/>}><Route path="/" element={<HomeRoute/>}/><Route path="/account" element={<Protected roles={["BUSINESS_OWNER","SUPER_ADMIN"]}><AccountProfile/></Protected>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<RegisterBusiness/>}/><Route path="/pending" element={<Protected><Pending/></Protected>}/><Route path="/dashboard" element={<Protected roles={["BUSINESS_OWNER"]}><StoreAdmin/></Protected>}/><Route path="/dashboard/products" element={<Protected roles={["BUSINESS_OWNER"]}><StoreAdmin/></Protected>}/><Route path="/dashboard/profile" element={<Protected roles={["BUSINESS_OWNER"]}><StoreAdmin/></Protected>}/><Route path="/dashboard/storefront" element={<Protected roles={["BUSINESS_OWNER"]}><StoreAdmin/></Protected>}/><Route path="/dashboard/payments" element={<Protected roles={["BUSINESS_OWNER"]}><StoreAdmin/></Protected>}/><Route path="/dashboard/shipping" element={<Protected roles={["BUSINESS_OWNER"]}><StoreAdmin/></Protected>}/><Route path="/dashboard/orders" element={<Protected roles={["BUSINESS_OWNER"]}><OrdersAdmin/></Protected>}/><Route path="/dashboard/analytics" element={<Protected roles={["BUSINESS_OWNER"]}><BusinessAnalytics/></Protected>}/><Route path="/dashboard/upgrade" element={<Protected roles={["BUSINESS_OWNER"]}><BusinessUpgrade/></Protected>}/><Route path="/dashboard/support" element={<Protected roles={["BUSINESS_OWNER"]}><BusinessSupport/></Protected>}/><Route path="/store/:slug" element={<Storefront/>}/><Route path="/store/:slug/account" element={<CustomerAccount/>}/><Route path="/store/:slug/orders" element={<CustomerOrders/>}/><Route path="/store/:slug/orders/:orderNumber" element={<CustomerOrder/>}/><Route path="/super-admin/applications" element={<Protected roles={["SUPER_ADMIN"]}><SuperAdminDashboard/></Protected>}/><Route path="/super-admin/upgrades" element={<Protected roles={["SUPER_ADMIN"]}><SuperAdminUpgrades/></Protected>}/><Route path="/super-admin/support" element={<Protected roles={["SUPER_ADMIN"]}><SuperAdminSupport/></Protected>}/><Route path="/super-admin/testimonials" element={<Protected roles={["SUPER_ADMIN"]}><SuperAdminTestimonials/></Protected>}/><Route path="*" element={<Navigate to="/"/>}/></Route></Routes>;}
