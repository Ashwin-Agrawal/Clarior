import { Link } from "react-router-dom";
import { Logo } from "./layout/icons";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Logo size="footer" />
              <span className="brand-text font-extrabold text-2xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                Clarior
              </span>
            </div>
            <p className="mt-6 text-sm text-muted leading-relaxed max-w-xs">
              Talk to verified seniors from top Indian colleges. Get real clarity, honest advice, and personalized guidance for your academic journey.
            </p>
            {/* Social Links */}
            <div className="mt-8 flex gap-4">
              {[
                { icon: "X", link: "https://x.com/clarior_in" },
                { icon: "LinkedIn", link: "https://linkedin.com/company/clarior" },
                { icon: "Instagram", link: "https://instagram.com/clarior.in" },
              ].map((s) => (
                <a
                  key={s.icon}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-xs font-bold text-muted hover:border-primary/40 hover:text-primary transition-all hover:-translate-y-1"
                >
                  {s.icon[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className="text-sm font-bold text-fg uppercase tracking-widest">Platform</h4>
            <ul className="mt-6 space-y-4">
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/explore">Seniors</Link></li>
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/how-it-works">How it works</Link></li>
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/#pricing">Pricing</Link></li>
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/become-senior">Join as Senior</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-sm font-bold text-fg uppercase tracking-widest">Company</h4>
            <ul className="mt-6 space-y-4">
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/mentor-guidelines">Senior Guidelines</Link></li>
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/contact">Contact Support</Link></li>
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/about">Our Mission</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-sm font-bold text-fg uppercase tracking-widest">Legal</h4>
            <ul className="mt-6 space-y-4">
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/privacy">Privacy Policy</Link></li>
              <li><Link className="text-sm text-muted hover:text-primary transition" to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs font-medium text-muted">
            © {currentYear} Clarior Mentorship. Built with ❤️ for students.
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-bold text-fg tracking-wide uppercase">
              Experience the value of clarity for ₹69
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
