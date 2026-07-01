import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CollegeCard from "../components/CollegeCard";
import Skeleton from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";
import RequestCollegeModal from "../components/RequestCollegeModal";

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7.5" />
      <path strokeLinecap="round" d="m20 20-3.8-3.8" />
    </svg>
  );
}

const TYPES = ["All", "Government", "Private", "New-Gen"];

function Explore() {
  useSEO(
    "Explore Colleges",
    "Browse top colleges worldwide and connect with verified seniors studying there. Get clear guidance on admissions, branches, and career paths."
  );

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get("/colleges");
        setColleges(res.data.colleges || []);
      } catch (err) {
        console.error("Failed to fetch colleges", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  // Dynamically extract unique states list
  const statesList = useMemo(() => {
    const s = new Set(colleges.map((c) => c.state).filter(Boolean));
    const list = Array.from(s).sort();
    const hasNcr = colleges.some(c => c.common === "DELHI-NCR" || c.common === "DELHI_NCR");
    if (hasNcr) {
      list.push("Delhi NCR");
    }
    return ["All", ...list.sort()];
  }, [colleges]);

  // Filtering
  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      const matchSearch =
        !search.trim() ||
        [c.name, c.city]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase());
      const matchState =
        stateFilter === "All" ||
        c.state === stateFilter ||
        (stateFilter === "Delhi NCR" && (c.common === "DELHI-NCR" || c.common === "DELHI_NCR"));
      const matchType =
        typeFilter === "All" ||
        c.type === typeFilter ||
        (typeFilter === "New-Gen" && c.type === "New Gen") ||
        (typeFilter === "New Gen" && c.type === "New-Gen");
      return matchSearch && matchState && matchType;
    });
  }, [colleges, search, stateFilter, typeFilter]);

  const hasFilters = search.trim() || stateFilter !== "All" || typeFilter !== "All";

  const clearFilters = () => {
    setSearch("");
    setStateFilter("All");
    setTypeFilter("All");
  };

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* Premium Header Hero */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none opacity-50" style={{ background: "var(--hero-gradient)" }} />
          <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-float-slow pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

          <SiteContainer className="relative">
            <div className="max-w-4xl mx-auto text-center animate-fade-up">
              <h1 className="heading-display text-4xl md:text-7xl font-black text-fg tracking-tight leading-[1.1]">
                Explore <span className="gradient-text">Colleges.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed font-semibold max-w-2xl mx-auto">
                Discover your dream college and talk to verified seniors. No bias, just experience.
              </p>
            </div>

            {/* Premium Text Search Bar */}
            <div className="mt-12 max-w-2xl mx-auto animate-fade-up delay-100">
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <SearchIcon className="h-6 w-6" />
                </span>
                <input
                  type="text"
                  placeholder="Search by college name or city..."
                  className="w-full h-16 pl-14 pr-6 rounded-3xl border border-border/80 bg-surface/50 backdrop-blur-md outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base sm:text-lg font-black text-fg shadow-card hover:border-primary/25"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Premium Interactive Filters Hub (Pills Only, No Dropdowns) */}
            <div className="mt-10 max-w-4xl mx-auto space-y-6 animate-fade-up delay-200">
              
              {/* Filter 1: College Type Pills */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">College Type</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-6 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer uppercase ${
                        typeFilter === type
                          ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/20 scale-[1.03]"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:bg-surface/50 dark:border-border/75 dark:text-muted dark:hover:text-primary"
                      }`}
                    >
                      {type === "All" ? "All Types" : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: State Pills (Horizontal Scrollable) */}
              <div className="flex flex-col items-center gap-3 w-full">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Filter by State</span>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full py-2.5 px-4 justify-start w-full">
                  {statesList.map((state) => (
                    <button
                      key={state}
                      onClick={() => setStateFilter(state)}
                      className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer flex-shrink-0 uppercase ${
                        stateFilter === state
                          ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/20 scale-[1.03]"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:bg-surface/50 dark:border-border/75 dark:text-muted dark:hover:text-primary"
                      }`}
                    >
                      {state === "All" ? "All States" : state}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Floating Trigger */}
              {hasFilters && (
                <div className="text-center pt-2">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-danger/20 bg-danger/5 hover:bg-danger/10 text-danger text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </SiteContainer>
        </section>

        {/* Results Directory */}
        <SiteContainer className="pb-32">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8 animate-fade-in">
            <h2 className="text-sm font-black text-muted uppercase tracking-[0.2em]">
              {loading ? "Loading colleges…" : `Showing ${filtered.length} college${filtered.length !== 1 ? "s" : ""}`}
            </h2>
            {hasFilters && !loading && (
              <p className="text-sm text-muted">
                Filtered by{" "}
                {typeFilter !== "All" && (
                  <>
                    <span className="font-semibold text-fg">{typeFilter}</span>
                  </>
                )}
                {stateFilter !== "All" && (
                  <>
                    {typeFilter !== "All" ? " in " : ""}
                    <span className="font-semibold text-fg">{stateFilter}</span>
                  </>
                )}
                {search.trim() && (
                  <>
                    {typeFilter !== "All" || stateFilter !== "All" ? " matching " : ""}
                    <span className="font-semibold text-fg">"{search.trim()}"</span>
                  </>
                )}
              </p>
            )}
          </div>

          {error && (
            <div className="text-center py-12 mb-8 bg-danger/5 rounded-2xl border border-danger/10">
              <p className="text-danger font-bold">Failed to load colleges. Please refresh the page.</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[380px] rounded-[28px] bg-surface2 animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {filtered.map((college, idx) => (
                <CollegeCard key={college._id} college={college} index={idx} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center animate-fade-in">
              <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-3xl bg-primary/10 animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-surface border border-border shadow-soft text-primary">
                  <SearchIcon className="h-10 w-10" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-fg">No colleges found</h3>
              <p className="text-muted mt-3 max-w-sm mx-auto leading-relaxed">
                Try adjusting your search or location filters — or request to add your college if it is missing.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="primary" className="rounded-full px-10" onClick={clearFilters}>
                  See All Colleges
                </Button>
                <Button variant="secondary" className="rounded-full px-10" onClick={() => setIsModalOpen(true)}>
                  Request to Add College
                </Button>
              </div>
            </div>
          )}
        </SiteContainer>
        <RequestCollegeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
      <Footer />
    </>
  );
}

export default Explore;

