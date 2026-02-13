import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";

import AppLayout from "./layout/AppLayout";
import CustomerLayout from "./layout/CustomerLayout";
import { GuestMiddleware } from "./middleware/midleware";
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
import Table from "./pages/Tables/Table";
import Admin from "./pages/Admin/Admin";
import GeneralSettingsPage from "./pages/Settings/GeneralSettingsPage";
import TaxSettingsPage from "./pages/Settings/TaxSettingsPage";
import PaymentSettingsPage from "./pages/Settings/PaymentSettingsPage";
import RolesSettingsPage from "./pages/Settings/RolesSettingsPage";
import { Cashier } from "./pages/Cashier/Cashier";
import CustomerPage from "./pages/Customer/CustomerPage";
import NotFound from "./pages/OtherPage/NotFound";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>

        <Route element={<AppLayout />}>

          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/cashier" element={<Cashier />} />

          <Route path="/menu">
            <Route index element={<Menu />} />
            <Route path="create-menu" element={<CreateMenu />} />
            <Route path="edit-menu/:id" element={<EditMenu />} />
            <Route path="show/:id" element={<Show />} />
          </Route>

          <Route path="/category" element={<Category />} />
          <Route path="/banner" element={<Banner />} />
          <Route path="/discount" element={<Discount />} />
          <Route path="/badge" element={<Badge />} />
          <Route path="/table" element={<Table />} />
          <Route path="/staf" element={<Employe />} />
          <Route path="/admin" element={<Admin />} />

          <Route path="/settings">
            <Route path="general" element={<GeneralSettingsPage />} />
            <Route path="tax" element={<TaxSettingsPage />} />
            <Route path="payment" element={<PaymentSettingsPage />} />
            <Route path="roles" element={<RolesSettingsPage />} />
          </Route>
        </Route>


        <Route path="/auth" element={<GuestMiddleware />}>
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>


        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<CustomerPage />} />
        </Route>


        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}
