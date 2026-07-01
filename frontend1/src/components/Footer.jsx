import { Link } from "react-router-dom";
import { Logo } from "./layout/icons";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
              <Logo size="footer" />
              <span className="brand-text font-extrabold text-2xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                Clarior
              </span>
            </Link>
            <p className="mt-6 text-sm text-muted leading-relaxed max-w-xs">
              Talk to verified seniors from top colleges worldwide. Get real clarity, honest advice, and personalized guidance for your academic journey.
            </p>
            {/* Social Links */}
            <div className="mt-8 flex gap-3">
              <a
                href="https://x.com/clarior_in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted hover:border-primary/40 hover:text-primary transition-all hover:-translate-y-1"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.639L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
              </a>
              <a
                href="https://www.linkedin.com/company/clarior-in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted hover:border-primary/40 hover:text-primary transition-all hover:-translate-y-1"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href="https://instagram.com/clarior.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted hover:border-primary/40 hover:text-primary transition-all hover:-translate-y-1"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
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
            © {currentYear} Clarior Mentorship. Built by students with ❤️ for students.
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-bold text-fg tracking-wide uppercase">
              One conversation worth a Coffee ☕️ for Saving Lakhs.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
