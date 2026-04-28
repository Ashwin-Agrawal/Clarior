import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import SiteContainer from "./layout/SiteContainer";
import { Logo } from "./layout/icons";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const navItems = [
  { to: "/#pricing", label: "Pricing", match: "/" },
  { to: "/how-it-works", label: "How It Works", match: "/how-it-works" },
  { to: "/explore", label: "Seniors", match: "/explore" },
  { to: "/bookings", label: "Sessions", match: "/bookings" },
];

function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/70 bg-surface/90 backdrop-blur-xl">
      <SiteContainer className="py-4">
        <div className="mx-auto flex w-full max-w-[900px] items-center gap-4 rounded-full border border-border bg-surface/95 px-4 py-3 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 rounded-full hover:bg-slate-50"
          >
            <Logo size="navbar" />
          </button>
          <div className="brand-text font-extrabold text-[20px] tracking-wide">Clarior</div>

          <div className="hidden flex-1 justify-center md:flex">
            <nav className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              {navItems
                .filter((item) => item.to !== "/bookings" || user)
                .map((item) => {
                  const isActive =
                    item.to === "/#pricing"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.match);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cx(
                        "rounded-full px-4 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-[rgba(59,91,219,0.12)] text-primary"
                          : "text-muted hover:bg-slate-50 hover:text-fg"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-900/15"
                title="Open dashboard"
                aria-label="Open dashboard"
              >
                {user.name?.trim()?.[0] || "C"}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-slate-50 hover:text-fg md:inline-flex"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primaryFg shadow-soft transition hover:-translate-y-0.5 hover:opacity-95"
                >
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </SiteContainer>
    </div>
  );
}

export default Navbar;
