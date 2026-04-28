import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SiteContainer from "./layout/SiteContainer";
import { Logo } from "./layout/icons";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function NavItem({ to, label, icon, active }) {
  return (
    <Link
      to={to}
      className={cx(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-[rgba(59,91,219,0.12)] text-primary"
          : "text-muted hover:bg-surface2 hover:text-fg"
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-base">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function AppShell({ title, subtitle, children }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const nav = useMemo(() => {
    const items = [
      { to: "/dashboard", label: "Dashboard", icon: "⌁" },
      { to: "/bookings", label: "Sessions", icon: "⏱" },
    ];

    if (user?.role === "student") {
      items.push({ to: "/explore", label: "Seniors", icon: "🔎" });
      items.push({ to: "/buy-credits", label: "Credits", icon: "💳" });
    }

    if (user?.role === "senior") {
      items.push({ to: "/availability", label: "Availability", icon: "🗓" });
    }

    return items;
  }, [user?.role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-65 lg:flex-col lg:border-r lg:border-border/70 lg:bg-surface/95 lg:backdrop-blur-xl">
        <div className="flex h-full flex-col justify-between px-5 py-6">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 text-left"
            >
              <Logo size="sidebar" />
            </button>

            <div className="mt-10 space-y-2">
              {nav.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={location.pathname === item.to}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-surface2/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-bold uppercase tracking-wide text-white">
                {user?.name?.trim()?.[0] || "C"}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-fg">{user?.name}</div>
                <div className="mt-1 text-xs capitalize text-muted">{user?.role}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-surface2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-65">
        <div className="min-h-screen bg-bg pt-6 lg:pt-8">
          <SiteContainer className="py-6 lg:py-8">
            {(title || subtitle) && (
              <div className="mb-10 rounded-4xl border border-border/70 bg-surface/80 p-6 shadow-soft backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    {title && <h1 className="text-3xl font-extrabold tracking-tight text-fg">{title}</h1>}
                    {subtitle && <p className="mt-2 max-w-3xl text-sm text-muted">{subtitle}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to="/"
                      className="inline-flex rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-surface2"
                    >
                      Home
                    </Link>
                    <Link
                      to="/mentor-guidelines"
                      className="inline-flex rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-surface2"
                    >
                      Guidelines
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {children}
          </SiteContainer>
        </div>
      </main>
    </div>
  );
}

export default AppShell;
