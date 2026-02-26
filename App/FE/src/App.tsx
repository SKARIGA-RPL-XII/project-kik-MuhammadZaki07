import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";

import AppLayout from "./layout/AppLayout";
import CustomerLayout from "./layout/CustomerLayout";
import { AuthMiddleware, GuestMiddleware } from "./middleware/midleware";
import { PermissionMiddleware } from "./middleware/PermissionMiddleware";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Menu from "./pages/Menu/Menu";
import CreateMenu from "./pages/Menu/CreateMenu";
import EditMenu from "./pages/Menu/EditMenu";
import Show from "./pages/Menu/Show";
import Category from "./pages/Category/Category";
import Banner from "./pages/Banner/Banner";
import Discount from "./pages/Discount/Discount";
import Badge from "./pages/Badge/Badge";
import Employe from "./pages/Employe/Employe";
import Admin from "./pages/Admin/Admin";
import GeneralSettingsPage from "./pages/Settings/GeneralSettingsPage";
import TaxSettingsPage from "./pages/Settings/TaxSettingsPage";
import PaymentSettingsPage from "./pages/Settings/PaymentSettingsPage";
import CustomerPage from "./pages/Customer/CustomerPage";
import NotFound from "./pages/OtherPage/NotFound";
import RestaurantLayoutPage from "./pages/Restaurant-layout/Index";
import NotificationPage from "./pages/Notifications/Index";
import NotificationShow from "./pages/Notifications/NotificationShow";
import RolesPermissionsPage from "./pages/Settings/RolesSettingsPage";
import SystemConfigPage from "./pages/Settings/SystemConfigPage";
import StockPage from "./pages/Stock/StockPage";
import AdjustmentPage from "./pages/Stock/AdjustmentPage";
import SupplierPage from "./pages/Stock/SupplierPage";
import MenuDetailPage from "./components/resto/MenuDetailPage";
import OrderQueuePage from "./pages/Operations/OrderQueue";
import CashierPage from "./pages/Cashier/Cashier";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<AuthMiddleware><AppLayout /></AuthMiddleware>}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/cashier" element={<PermissionMiddleware module="cashier"><CashierPage /></PermissionMiddleware>} />
          
          <Route path="/menu">
            <Route index element={<PermissionMiddleware module="menu"><Menu /></PermissionMiddleware>} />
            <Route path="create-menu" element={<PermissionMiddleware module="menu" action="write"><CreateMenu /></PermissionMiddleware>} />
            <Route path="edit-menu/:id" element={<PermissionMiddleware module="menu" action="write"><EditMenu /></PermissionMiddleware>} />
            <Route path="show/:id" element={<Show />} />
          </Route>

          <Route path="/category" element={<PermissionMiddleware module="category"><Category /></PermissionMiddleware>} />
          <Route path="/banner" element={<PermissionMiddleware module="banner"><Banner /></PermissionMiddleware>} />
          <Route path="/discount" element={<PermissionMiddleware module="discount"><Discount /></PermissionMiddleware>} />
          <Route path="/badge" element={<PermissionMiddleware module="badge"><Badge /></PermissionMiddleware>} />
          <Route path="/table" element={<PermissionMiddleware module="table & room"><RestaurantLayoutPage /></PermissionMiddleware>} />

          <Route path="/inventory">
            <Route path="stock" element={<StockPage />} />
            <Route path="adjustment" element={<AdjustmentPage />} />
            <Route path="suppliers" element={<SupplierPage />} />
          </Route>

          <Route path="/operations">
            <Route path="orders" element={<OrderQueuePage />} />
          </Route>

          <Route path="/staf" element={<PermissionMiddleware module="staff"><Employe /></PermissionMiddleware>} />
          <Route path="/admin" element={<PermissionMiddleware module="admin"><Admin /></PermissionMiddleware>} />

          <Route path="/notifications">
            <Route index element={<NotificationPage />} />
            <Route path=":id" element={<NotificationShow />} />
          </Route>

          <Route path="/settings">
            <Route path="general" element={<PermissionMiddleware module="general"><GeneralSettingsPage /></PermissionMiddleware>} />
            <Route path="tax" element={<PermissionMiddleware module="tax & service"><TaxSettingsPage /></PermissionMiddleware>} />
            <Route path="payment" element={<PermissionMiddleware module="payment methods"><PaymentSettingsPage /></PermissionMiddleware>} />
            <Route path="roles" element={<PermissionMiddleware module="roles & permissions"><RolesPermissionsPage /></PermissionMiddleware>} />
            <Route path="system" element={<PermissionMiddleware module="system config"><SystemConfigPage /></PermissionMiddleware>} />
          </Route>
        </Route>

        <Route path="/auth" element={<GuestMiddleware />}>
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>

        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<CustomerPage />} />
          <Route path="menu-detail-customer/:id" element={<MenuDetailPage />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}