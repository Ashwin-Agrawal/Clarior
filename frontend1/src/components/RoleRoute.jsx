import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ children, allowedRoles, requireVerifiedSenior = true }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" />;
  }

  if (requireVerifiedSenior && user.role === "senior" && !user.isVerified) {
    return <Navigate to="/verify" />;
  }

  return children;
}

export default RoleRoute;

