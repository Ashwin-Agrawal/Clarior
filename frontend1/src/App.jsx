import { Routes, Route } from "react-router-dom";
import ScrollToHash from "./components/ScrollToHash";
import { ToastContainer } from "./components/Toast";


import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import BuyCredits from "./pages/BuyCredits";
import Login from "./pages/Login";
import Register from "./pages/Register";

// 🔥 NEW IMPORTS
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/Verify";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import MyBookings from "./pages/MyBookings";
import Session from "./pages/Session";
import SeniorSlots from "./pages/SeniorSlots";
import MentorGuidelines from "./pages/MentorGuidelines";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import BecomeMentor from "./pages/BecomeMentor";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <ScrollToHash />
      <ToastContainer />
      <Routes>

        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/buy-credits" element={<BuyCredits />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mentor-guidelines" element={<MentorGuidelines />} />
        <Route path="/become-mentor" element={<BecomeMentor />} />
        <Route path="/become-senior" element={<BecomeMentor />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />

        {/* 🔐 PROTECTED ROUTE */}
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
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]} requireVerifiedSenior={false}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        {/* 🧾 VERIFY PAGE */}
        <Route path="/verify" element={<Verify />} />

      </Routes>
    </>
  );
}

export default App;