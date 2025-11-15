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
import { Events } from "./pages/Events";
import { Sensors } from "./pages/Sensors";
import { useUserContext } from "./providers/UserProvider";

export function AppRouter() {
  const {user, isLoading} = useUserContext();

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  const UserRoute = () => {
    return /* Logged in user */ user.role == "user" ? <Outlet /> : <NoAccess />;
  };

  const AdminRoute = () => {
    return /* Admin user logged in */ user.role == "admin" ? <Outlet /> : <NoAccess />;
  };

  const AnonymousRoute = () => {
    return /* Guest user condition */ user.role == "" ? (
      <Outlet />
    ) : (
      <Navigate to="/" replace />
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Anyone can access */}
          <Route path="*" element={<NoPage />} />
          {/* Private Routes = Must be authenticated */}
          <Route path="app" element={<UserRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route index element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="sensors" element={<Sensors />} />
          </Route>

          {/* Admin Routes = Must be authenticated and admin */}
          <Route path="admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route index element={<Dashboard />} />
          </Route>

          {/* Anonymous Routes = Must be unathenticated to access */}
          <Route element={<AnonymousRoute />}>
            <Route path="login" element={<Login />} />
            {/* <Route index element={<Login />} /> */}
            <Route path="register" element={<SignUp />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
