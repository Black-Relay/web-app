import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { NoPage } from "./pages/NoPage";
import { NoAccess } from "./pages/NoAccess";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Layout } from "./layouts/Layout";
import { Dashboard } from "./pages/Dashboard";

export function AppRouter() {
  const UserRoute = () => {
    return /* Logged in user */ true ? <Outlet /> : <NoAccess />;
  };

  const AdminRoute = () => {
    return /* Admin user logged in */ false ? <Outlet /> : <NoAccess />;
  };

  const AnonymousRoute = () => {
    return /* Guest user condition */ false ? (
      <Navigate to="/" replace />
    ) : (
      <Outlet />
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Anyone can access */}
          <Route path="*" element={<NoPage />} />
          {/* Private Routes = Must be authenticated */}
          <Route element={<UserRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route index element={<Dashboard />} />
          </Route>

          {/* Admin Routes = Must be authenticated and admin */}
          <Route element={<AdminRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route index element={<Dashboard />} />
          </Route>

          {/* Anonymous Routes = Must be unathenticated to access */}
          <Route element={<AnonymousRoute />}>
            <Route path="login" element={<Login />} />
            <Route index element={<Login />} />
            <Route path="register" element={<SignUp />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
