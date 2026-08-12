import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToHash from "./components/ScrollToHash";
import { ToastContainer } from "./components/Toast";
import MobileBottomNav from "./components/MobileBottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// Home is the LCP page — loaded eagerly for instant first render
import Home from "./pages/Home";

// All other pages are lazy-loaded to minimize initial bundle size
const Explore = lazy(() => import("./pages/Explore"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Lazy-loaded secondary & protected routes for optimal code-splitting
const UserProfile = lazy(() => import("./pages/UserProfile"));
const BuyCredits = lazy(() => import("./pages/BuyCredits"));
const CollegeProfile = lazy(() => import("./pages/CollegeProfile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Verify = lazy(() => import("./pages/Verify"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Session = lazy(() => import("./pages/Session"));
const SeniorSlots = lazy(() => import("./pages/SeniorSlots"));
const MentorGuidelines = lazy(() => import("./pages/MentorGuidelines"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Contact = lazy(() => import("./pages/Contact"));
const BecomeMentor = lazy(() => import("./pages/BecomeMentor"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

function RouteLoader() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToHash />
      <ToastContainer />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/college/:id" element={<CollegeProfile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/buy-credits" element={<BuyCredits />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentor-guidelines" element={<MentorGuidelines />} />
          <Route
            path="/become-mentor"
            element={
              <ProtectedRoute>
                <BecomeMentor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/become-senior"
            element={
              <ProtectedRoute>
                <BecomeMentor />
              </ProtectedRoute>
            }
          />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <RoleRoute allowedRoles={["student", "senior"]}>
                <MyBookings />
              </RoleRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <RoleRoute allowedRoles={["student", "senior"]}>
                <MyBookings />
              </RoleRoute>
            }
          />

          <Route
            path="/session/:bookingId"
            element={
              <RoleRoute allowedRoles={["student", "senior"]}>
                <Session />
              </RoleRoute>
            }
          />

          <Route
            path="/availability"
            element={
              <RoleRoute allowedRoles={["senior"]}>
                <SeniorSlots />
              </RoleRoute>
            }
          />
          <Route
            path="/senior-slots"
            element={
              <RoleRoute allowedRoles={["senior"]}>
                <SeniorSlots />
              </RoleRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["admin"]} requireVerifiedSenior={false}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

          {/* VERIFY PAGE */}
          <Route
            path="/verify"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["senior"]}>
                  <Verify />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <MobileBottomNav />
    </>
  );
}

export default App;