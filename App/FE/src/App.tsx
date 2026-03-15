import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";

import {
  AuthMiddleware,
  GuestMiddleware,
  StaffMiddleware,
} from "./middleware/midleware";
import { PermissionMiddleware } from "./middleware/PermissionMiddleware";

import AppLayout from "./layout/AppLayout";
import CustomerLayout from "./layout/CustomerLayout";
import BookingLayout from "./pages/Booked/BookingLayout";

const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const Home = lazy(() => import("./pages/Dashboard/Home"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Menu = lazy(() => import("./pages/Menu/Menu"));
const CreateMenu = lazy(() => import("./pages/Menu/CreateMenu"));
const EditMenu = lazy(() => import("./pages/Menu/EditMenu"));
const Show = lazy(() => import("./pages/Menu/Show"));
const Category = lazy(() => import("./pages/Category/Category"));
const Banner = lazy(() => import("./pages/Banner/Banner"));
const Discount = lazy(() => import("./pages/Discount/Discount"));
const Badge = lazy(() => import("./pages/Badge/Badge"));
const Employe = lazy(() => import("./pages/Employe/Employe"));
const Admin = lazy(() => import("./pages/Admin/Admin"));
const GeneralSettingsPage = lazy(
  () => import("./pages/Settings/GeneralSettingsPage"),
);
const TaxSettingsPage = lazy(() => import("./pages/Settings/TaxSettingsPage"));
const PaymentSettingsPage = lazy(
  () => import("./pages/Settings/PaymentSettingsPage"),
);
const CustomerPage = lazy(() => import("./pages/Customer/CustomerPage"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const RestaurantLayoutPage = lazy(
  () => import("./pages/Restaurant-layout/Index"),
);
const NotificationPage = lazy(() => import("./pages/Notifications/Index"));
const NotificationShow = lazy(
  () => import("./pages/Notifications/NotificationShow"),
);
const RolesPermissionsPage = lazy(
  () => import("./pages/Settings/RolesSettingsPage"),
);
const SystemConfigPage = lazy(
  () => import("./pages/Settings/SystemConfigPage"),
);
const StockPage = lazy(() => import("./pages/Stock/StockPage"));
const AdjustmentPage = lazy(() => import("./pages/Stock/AdjustmentPage"));
const SupplierPage = lazy(() => import("./pages/Stock/SupplierPage"));
const MenuDetailPage = lazy(() => import("./components/resto/MenuDetailPage"));
const OrderQueuePage = lazy(() => import("./pages/Operations/OrderQueue"));
const CashierPage = lazy(() => import("./pages/Cashier/Cashier"));
const TablePage = lazy(() => import("./pages/Cashier/TablePage"));
const PaymentPage = lazy(() => import("./pages/Cashier/PaymentPage"));
const InvoicePage = lazy(() => import("./pages/Cashier/InvoicePage"));
const InvoiceCashPage = lazy(() => import("./components/resto/InvoicePage"));
const CustomerProfilePage = lazy(() => import("./pages/Customer/ProfilePage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="loader"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            element={
              <StaffMiddleware>
                <AppLayout />
              </StaffMiddleware>
            }
          >
            <Route path="/dashboard" element={<Home />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route
              path="/cashier"
              element={
                <PermissionMiddleware module="cashier">
                  <CashierPage />
                </PermissionMiddleware>
              }
            />

            <Route path="/menu">
              <Route
                index
                element={
                  <PermissionMiddleware module="menu">
                    <Menu />
                  </PermissionMiddleware>
                }
              />
              <Route
                path="create-menu"
                element={
                  <PermissionMiddleware module="menu" action="write">
                    <CreateMenu />
                  </PermissionMiddleware>
                }
              />
              <Route
                path="edit-menu/:id"
                element={
                  <PermissionMiddleware module="menu" action="write">
                    <EditMenu />
                  </PermissionMiddleware>
                }
              />
              <Route path="show/:id" element={<Show />} />
            </Route>

            <Route
              path="/category"
              element={
                <PermissionMiddleware module="category">
                  <Category />
                </PermissionMiddleware>
              }
            />
            <Route
              path="/banner"
              element={
                <PermissionMiddleware module="banner">
                  <Banner />
                </PermissionMiddleware>
              }
            />
            <Route
              path="/discount"
              element={
                <PermissionMiddleware module="discount">
                  <Discount />
                </PermissionMiddleware>
              }
            />
            <Route
              path="/badge"
              element={
                <PermissionMiddleware module="badge">
                  <Badge />
                </PermissionMiddleware>
              }
            />
            <Route
              path="/table"
              element={
                <PermissionMiddleware module="table & room">
                  <RestaurantLayoutPage />
                </PermissionMiddleware>
              }
            />

            <Route path="/inventory">
              <Route path="stock" element={<StockPage />} />
              <Route path="adjustment" element={<AdjustmentPage />} />
              <Route path="suppliers" element={<SupplierPage />} />
            </Route>

            <Route path="/operations">
              <Route path="orders" element={<OrderQueuePage />} />
            </Route>

            <Route path="/tables" element={<TablePage />} />
            <Route path="/payment" element={<PaymentPage />} />

            <Route
              path="/staf"
              element={
                <PermissionMiddleware module="staff">
                  <Employe />
                </PermissionMiddleware>
              }
            />
            <Route
              path="/admin"
              element={
                <PermissionMiddleware module="admin">
                  <Admin />
                </PermissionMiddleware>
              }
            />

            <Route path="/notifications">
              <Route index element={<NotificationPage />} />
              <Route path=":id" element={<NotificationShow />} />
            </Route>

            <Route path="/settings">
              <Route
                path="general"
                element={
                  <PermissionMiddleware module="general">
                    <GeneralSettingsPage />
                  </PermissionMiddleware>
                }
              />
              <Route
                path="tax"
                element={
                  <PermissionMiddleware module="tax & service">
                    <TaxSettingsPage />
                  </PermissionMiddleware>
                }
              />
              <Route
                path="payment"
                element={
                  <PermissionMiddleware module="payment methods">
                    <PaymentSettingsPage />
                  </PermissionMiddleware>
                }
              />
              <Route
                path="roles"
                element={
                  <PermissionMiddleware module="roles & permissions">
                    <RolesPermissionsPage />
                  </PermissionMiddleware>
                }
              />
              <Route
                path="system"
                element={
                  <PermissionMiddleware module="system config">
                    <SystemConfigPage />
                  </PermissionMiddleware>
                }
              />
            </Route>
          </Route>

          <Route path="/auth" element={<GuestMiddleware />}>
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />
          </Route>

          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<CustomerPage />} />
            <Route path="menu/:id" element={<MenuDetailPage />} />
            <Route
              path="profile-customer"
              element={
                <AuthMiddleware>
                  <CustomerProfilePage />
                </AuthMiddleware>
              }
            />
            <Route
              path="profile-customer"
              element={
                <AuthMiddleware>
                  <CustomerProfilePage />
                </AuthMiddleware>
              }
            />

            <Route
              path="booking"
              element={
                <AuthMiddleware>
                  <BookingLayout />
                </AuthMiddleware>
              }
            />

            <Route
              path="/tables-customer"
              element={
                <AuthMiddleware>
                  <TablePage />
                </AuthMiddleware>
              }
            />

            <Route
              path="/payment-customer"
              element={
                <AuthMiddleware>
                  <PaymentPage />
                </AuthMiddleware>
              }
            />
          </Route>

          <Route path="/invoice/:id" element={<InvoicePage />} />
          <Route path="/order-success" element={<InvoiceCashPage />} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
