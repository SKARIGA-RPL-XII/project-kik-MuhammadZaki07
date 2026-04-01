import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router";
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
import BookingPage from "./pages/bookings/BookingPage";
import BookingFormPage from "./pages/bookings/BookingFormPage";
import TransactionPage from "./pages/transactions/TransactionPage";
import TransactionDetail from "./pages/transactions/TransactionDetailPage";
import LogIndex from "./pages/Logs/LogIndex";
import LogDetailPage from "./pages/Logs/LogDetail";
import TopSellingPage from "./pages/reports/TopSellingPage";
import SalesReportPage from "./pages/reports/SalesReportPage";
import ReportExplorerPage from "./pages/reports/ReportExplorerPage";
import AttendancePage from "./pages/Attendance/AttendancePage";
import SchedulePage from "./pages/Schedule/SchedulePage";
import LeavePage from "./pages/Leave/LeavePage";
import LeaveApprovalPage from "./pages/Leave/LeaveApprovalPage";
import NavbarDesktop from "./components/ui/NavbarDesktop";
import { isDesktop } from "./utils/platform";

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
const InvoiceCashPage = lazy(
  () => import("./components/resto/InvoiceCashPage"),
);
const CustomerProfilePage = lazy(() => import("./pages/Customer/ProfilePage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="loader"></div>
  </div>
);

const RootLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <ScrollToTop />
      <NavbarDesktop />
      <main
        className={`flex-1 ${isDesktop() && "mt-2"} min-h-0 overflow-auto custom-scrollbar`}
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        element: (
          <StaffMiddleware>
            <AppLayout />
          </StaffMiddleware>
        ),
        children: [
          { path: "dashboard", element: <Home /> },
          { path: "profile", element: <UserProfiles /> },
          { path: "calendar", element: <Calendar /> },
          {
            path: "cashier",
            element: (
              <PermissionMiddleware module="cashier">
                <CashierPage />
              </PermissionMiddleware>
            ),
          },
          {
            path: "menu",
            children: [
              {
                index: true,
                element: (
                  <PermissionMiddleware module="menu">
                    <Menu />
                  </PermissionMiddleware>
                ),
              },
              {
                path: "create-menu",
                element: (
                  <PermissionMiddleware module="menu" action="write">
                    <CreateMenu />
                  </PermissionMiddleware>
                ),
              },
              {
                path: "edit-menu/:id",
                element: (
                  <PermissionMiddleware module="menu" action="write">
                    <EditMenu />
                  </PermissionMiddleware>
                ),
              },
              { path: "show/:id", element: <Show /> },
            ],
          },
          {
            path: "category",
            element: (
              <PermissionMiddleware module="category">
                <Category />
              </PermissionMiddleware>
            ),
          },
          {
            path: "banner",
            element: (
              <PermissionMiddleware module="banner">
                <Banner />
              </PermissionMiddleware>
            ),
          },
          {
            path: "discount",
            element: (
              <PermissionMiddleware module="discount">
                <Discount />
              </PermissionMiddleware>
            ),
          },
          {
            path: "badge",
            element: (
              <PermissionMiddleware module="badge">
                <Badge />
              </PermissionMiddleware>
            ),
          },
          {
            path: "table",
            element: (
              <PermissionMiddleware module="table & room">
                <RestaurantLayoutPage />
              </PermissionMiddleware>
            ),
          },
          {
            path: "inventory",
            children: [
              { path: "stock", element: <StockPage /> },
              { path: "adjustment", element: <AdjustmentPage /> },
              { path: "suppliers", element: <SupplierPage /> },
            ],
          },
          { path: "operations/orders", element: <OrderQueuePage /> },
          { path: "tables", element: <TablePage /> },
          { path: "payment", element: <PaymentPage /> },
          {
            path: "staf",
            element: (
              <PermissionMiddleware module="staff">
                <Employe />
              </PermissionMiddleware>
            ),
          },
          {
            path: "admin",
            element: (
              <PermissionMiddleware module="admin">
                <Admin />
              </PermissionMiddleware>
            ),
          },
          {
            path: "notifications",
            children: [
              { index: true, element: <NotificationPage /> },
              { path: ":id", element: <NotificationShow /> },
            ],
          },
          {
            path: "settings",
            children: [
              {
                path: "general",
                element: (
                  <PermissionMiddleware module="general">
                    <GeneralSettingsPage />
                  </PermissionMiddleware>
                ),
              },
              {
                path: "tax",
                element: (
                  <PermissionMiddleware module="tax & service">
                    <TaxSettingsPage />
                  </PermissionMiddleware>
                ),
              },
              {
                path: "payment",
                element: (
                  <PermissionMiddleware module="payment methods">
                    <PaymentSettingsPage />
                  </PermissionMiddleware>
                ),
              },
              {
                path: "roles",
                element: (
                  <PermissionMiddleware module="roles & permissions">
                    <RolesPermissionsPage />
                  </PermissionMiddleware>
                ),
              },
              {
                path: "system",
                element: (
                  <PermissionMiddleware module="system config">
                    <SystemConfigPage />
                  </PermissionMiddleware>
                ),
              },
            ],
          },
          { path: "operations/reservation", element: <BookingPage /> },
          {
            path: "operations/reservation/create",
            element: <BookingFormPage />,
          },
          {
            path: "operations/reservation/edit/:id",
            element: <BookingFormPage />,
          },
          { path: "reports/transactions", element: <TransactionPage /> },
          { path: "reports/transactions/:id", element: <TransactionDetail /> },
          { path: "system/logs", element: <LogIndex /> },
          { path: "system/logs/:id", element: <LogDetailPage /> },
          { path: "reports/top-menu", element: <TopSellingPage /> },
          { path: "reports/sales", element: <SalesReportPage /> },
          { path: "reports/report-exploler", element: <ReportExplorerPage /> },
          { path: "attendance", element: <AttendancePage /> },
          { path: "schedule", element: <SchedulePage /> },
          { path: "leaves", element: <LeavePage /> },
          { path: "leaves-approval", element: <LeaveApprovalPage /> },
        ],
      },
      {
        path: "auth",
        element: <GuestMiddleware />,
        children: [
          { path: "sign-in", element: <SignIn /> },
          { path: "sign-up", element: <SignUp /> },
        ],
      },
      {
        path: "",
        element: <CustomerLayout />,
        children: [
          { index: true, element: <CustomerPage /> },
          { path: "menu/:id", element: <MenuDetailPage /> },
          {
            path: "profile-customer",
            element: (
              <AuthMiddleware>
                <CustomerProfilePage />
              </AuthMiddleware>
            ),
          },
          {
            path: "booking",
            element: (
              <AuthMiddleware>
                <BookingLayout />
              </AuthMiddleware>
            ),
          },
        ],
      },
      {
        path: "payment-customer",
        element: (
          <AuthMiddleware>
            <PaymentPage />
          </AuthMiddleware>
        ),
      },
      {
        path: "tables-customer",
        element: (
          <AuthMiddleware>
            <TablePage />
          </AuthMiddleware>
        ),
      },
      { path: "invoice/:id", element: <InvoicePage /> },
      { path: "order-success", element: <InvoiceCashPage /> },
      { path: "404", element: <NotFound /> },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
