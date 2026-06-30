import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const { hash } = location;
    if (hash) {
      const id = hash.replace("#", "");
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // 100ms delay to allow DOM element to render
      return () => clearTimeout(t);
    } else {
      // Global Scroll Restoration: Reset scroll position to top when navigating to any new page
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

export default ScrollToHash;

