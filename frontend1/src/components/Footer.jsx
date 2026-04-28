import { Link } from "react-router-dom";
import { Logo } from "./layout/icons";

function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Logo size="footer" />
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Talk to real seniors. Get real clarity. Built on trust, quality, and accountability.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-fg">Platform</div>
            <div className="mt-3 space-y-2 text-sm">
              <Link className="block text-muted hover:text-fg" to="/explore">
                Seniors
              </Link>
              <Link className="block text-muted hover:text-fg" to="/how-it-works">
                How it works
              </Link>
              <Link className="block text-muted hover:text-fg" to="/#pricing">
                Pricing
              </Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-fg">Company</div>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                className="block text-muted hover:text-fg"
                to="/mentor-guidelines"
              >
                Senior Guidelines
              </Link>
              <Link
                className="block text-muted hover:text-fg"
                to="/contact"
              >
                Contact
              </Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-fg">Legal</div>
            <div className="mt-3 space-y-2 text-sm text-muted">
              <div>Privacy Policy (coming soon)</div>
              <div>Terms (coming soon)</div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <div>© {new Date().getFullYear()} Clarior. All rights reserved.</div>
          <div>Experince the 10-20 Lakhs value worth 69!</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

