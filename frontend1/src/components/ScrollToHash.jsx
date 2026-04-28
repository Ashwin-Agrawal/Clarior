import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const { hash } = location;
    if (!hash) return;

    // Allow layout to render before scrolling
    const id = hash.replace("#", "");
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);

    return () => clearTimeout(t);
  }, [location]);

  return null;
}

export default ScrollToHash;

