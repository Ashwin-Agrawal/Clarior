import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CollegeCard from "../components/CollegeCard";
import AlumniCard from "../components/AlumniCard";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") === "alumni" ? "alumni" : "colleges";

  useSEO(
    activeTab === "alumni"
      ? "Explore Working Alumni Mentors | 1:1 Career Guidance"
      : "Explore Top Colleges & Compare Branches | Senior Mentorship",
    activeTab === "alumni"
      ? "Book 1:1 sessions with verified industry professionals and corporate alumni mentors from top tech, product, and consulting companies."
      : "Explore top engineering, management, and private colleges in India. Connect with verified seniors for 1:1 admission, branch selection, and placement guidance."
  );

  // College States
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(18);

  // Alumni States
  const [alumniList, setAlumniList] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [alumniError, setAlumniError] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("All");

  const handleTabChange = (tabName) => {
    if (tabName === "alumni") {
      setSearchParams({ tab: "alumni" });
    } else {
      setSearchParams({});
    }
    setSearch("");
  };

  // Fetch Colleges
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

  // Fetch Alumni
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setAlumniLoading(true);
        setAlumniError(false);
        const res = await api.get("/alumni");
        setAlumniList(res.data.alumni || []);
      } catch (err) {
        console.error("Failed to fetch alumni", err);
        setAlumniError(true);
      } finally {
        setAlumniLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  // Dynamically extract unique states list for Colleges
  const statesList = useMemo(() => {
    const s = new Set(colleges.map((c) => c.state).filter(Boolean));
    const list = Array.from(s).sort();
    const hasNcr = colleges.some(c => c.common === "DELHI-NCR" || c.common === "DELHI_NCR");
    if (hasNcr) {
      list.push("Delhi NCR");
    }
    return ["All", ...list.sort()];
  }, [colleges]);

  // College Filtering
  const filteredColleges = useMemo(() => {
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

  // Dynamic Company filter pills for Alumni
  const companyPills = useMemo(() => {
    const set = new Set();
    alumniList.forEach((a) => {
      if (a.currentCompany) set.add(a.currentCompany.trim());
    });
    return ["All", ...Array.from(set).slice(0, 10)];
  }, [alumniList]);

  // Alumni Filtering
  const filteredAlumni = useMemo(() => {
    return alumniList.filter((a) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        [
          a.user?.name,
          a.currentCompany,
          a.currentJobTitle,
          a.college,
          a.specialization,
          a.degree,
          a.bio,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchCompany =
        companyFilter === "All" ||
        (a.currentCompany && a.currentCompany.toLowerCase() === companyFilter.toLowerCase());

      return matchSearch && matchCompany;
    });
  }, [alumniList, search, companyFilter]);

  // Reset displayLimit on search/filter change
  useEffect(() => {
    setDisplayLimit(18);
  }, [search, stateFilter, typeFilter, companyFilter, activeTab]);

  const visibleColleges = useMemo(() => {
    return filteredColleges.slice(0, displayLimit);
  }, [filteredColleges, displayLimit]);

  const hasCollegeFilters = search.trim() || stateFilter !== "All" || typeFilter !== "All";
  const hasAlumniFilters = search.trim() || companyFilter !== "All";

  const clearCollegeFilters = () => {
    setSearch("");
    setStateFilter("All");
    setTypeFilter("All");
    setDisplayLimit(18);
  };

  const clearAlumniFilters = () => {
    setSearch("");
    setCompanyFilter("All");
  };

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* Premium Header Hero */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-50" style={{ background: "var(--hero-gradient)" }} />
          <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-float-slow pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

          <SiteContainer className="relative">
            {/* Top Primary Tab Switcher */}
            <div className="flex justify-center mb-8 animate-fade-up">
              <div className="inline-flex p-1.5 rounded-full bg-surface2/80 border border-border/80 shadow-soft backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => handleTabChange("colleges")}
                  className={`px-6 sm:px-8 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    activeTab === "colleges"
                      ? "bg-primary text-primary-fg shadow-sm scale-[1.02]"
                      : "text-muted hover:text-fg hover:bg-surface/60"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333M4.5 21V10.333" />
                  </svg>
                  <span>Colleges & Seniors</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("alumni")}
                  className={`px-6 sm:px-8 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    activeTab === "alumni"
                      ? "bg-primary text-primary-fg shadow-sm scale-[1.02]"
                      : "text-muted hover:text-fg hover:bg-surface/60"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.694m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  <span>Working Alumni</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-accent text-white">
                    New
                  </span>
                </button>
              </div>
            </div>

            {/* Dynamic Headline */}
            <div className="max-w-4xl mx-auto text-center animate-fade-up">
              {activeTab === "colleges" ? (
                <>
                  <h1 className="heading-display text-4xl md:text-7xl font-black text-fg tracking-tight leading-[1.1]">
                    Explore <span className="gradient-text">Colleges.</span>
                  </h1>
                  <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed font-semibold max-w-2xl mx-auto">
                    Discover your dream college and talk to verified seniors. No bias, just experience.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="heading-display text-4xl md:text-7xl font-black text-fg tracking-tight leading-[1.1]">
                    Working <span className="gradient-text">Alumni Mentors.</span>
                  </h1>
                  <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed font-semibold max-w-2xl mx-auto">
                    Connect 1-on-1 with verified corporate professionals for resume reviews, off-campus referrals, and honest tech career guidance.
                  </p>
                </>
              )}
            </div>

            {/* Premium Text Search Bar */}
            <div className="mt-10 max-w-2xl mx-auto animate-fade-up delay-100">
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <SearchIcon className="h-6 w-6" />
                </span>
                <input
                  type="text"
                  placeholder={
                    activeTab === "colleges"
                      ? "Search by college name or city..."
                      : "Search alumni by company (e.g. Google), job title, or name..."
                  }
                  className="w-full h-16 pl-14 pr-6 rounded-3xl border border-border/80 bg-surface outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base sm:text-lg font-black text-fg shadow-card hover:border-primary/25"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Dynamic Filter Hub */}
            {activeTab === "colleges" ? (
              <div className="mt-10 max-w-4xl mx-auto space-y-6 animate-fade-up delay-200">
                {/* College Type Pills */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">College Type</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-6 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer uppercase ${
                          typeFilter === type
                            ? "bg-primary text-primary-fg border border-primary/20 shadow-xs font-bold"
                            : "bg-surface border border-border text-muted hover:border-primary/40 hover:text-fg font-semibold"
                        }`}
                      >
                        {type === "All" ? "All Types" : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State Pills */}
                <div className="flex flex-col items-center gap-3 w-full">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Filter by State</span>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full py-2.5 px-4 justify-start w-full">
                    {statesList.map((state) => (
                      <button
                        key={state}
                        onClick={() => setStateFilter(state)}
                        className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer flex-shrink-0 uppercase ${
                          stateFilter === state
                            ? "bg-primary text-primary-fg border border-primary/20 shadow-xs font-bold"
                            : "bg-surface border border-border text-muted hover:border-primary/40 hover:text-fg font-semibold"
                        }`}
                      >
                        {state === "All" ? "All States" : state}
                      </button>
                    ))}
                  </div>
                </div>

                {hasCollegeFilters && (
                  <div className="text-center pt-2">
                    <button
                      onClick={clearCollegeFilters}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-danger/20 bg-danger/5 hover:bg-danger/10 text-danger text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-10 max-w-4xl mx-auto space-y-5 animate-fade-up delay-200">
                {/* Alumni Company Pills */}
                <div className="flex flex-col items-center gap-3 w-full">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Filter by Company</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {companyPills.map((comp) => (
                      <button
                        key={comp}
                        onClick={() => setCompanyFilter(comp)}
                        className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer uppercase ${
                          companyFilter === comp
                            ? "bg-primary text-primary-fg border border-primary/20 shadow-xs font-bold"
                            : "bg-surface border border-border text-muted hover:border-primary/40 hover:text-fg font-semibold"
                        }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                {hasAlumniFilters && (
                  <div className="text-center pt-1">
                    <button
                      onClick={clearAlumniFilters}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-danger/20 bg-danger/5 hover:bg-danger/10 text-danger text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Clear Alumni Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </SiteContainer>
        </section>

        {/* Results Directory */}
        <SiteContainer className="pb-32">
          {activeTab === "colleges" ? (
            /* ================= COLLEGES DIRECTORY ================= */
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8 animate-fade-in">
                <h2 className="text-sm font-black text-muted uppercase tracking-[0.2em]">
                  {loading ? "Loading colleges…" : `Showing ${filteredColleges.length} college${filteredColleges.length !== 1 ? "s" : ""}`}
                </h2>
                {hasCollegeFilters && !loading && (
                  <p className="text-sm text-muted">
                    Filtered by{" "}
                    {typeFilter !== "All" && <span className="font-semibold text-fg">{typeFilter}</span>}
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
              ) : filteredColleges.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                    {visibleColleges.map((college, idx) => (
                      <CollegeCard key={college._id} college={college} index={idx} />
                    ))}
                  </div>
                  {filteredColleges.length > displayLimit && (
                    <div className="mt-14 text-center animate-fade-in">
                      <Button
                        variant="secondary"
                        className="rounded-full px-10 py-3.5 text-sm font-black tracking-wide border-border/80 hover:border-primary/40 shadow-xs cursor-pointer"
                        onClick={() => setDisplayLimit((prev) => prev + 18)}
                      >
                        Load More Colleges ({filteredColleges.length - displayLimit} more)
                      </Button>
                    </div>
                  )}
                </>
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
                    <Button variant="primary" className="rounded-full px-10" onClick={clearCollegeFilters}>
                      See All Colleges
                    </Button>
                    <Button variant="secondary" className="rounded-full px-10" onClick={() => setIsModalOpen(true)}>
                      Request to Add College
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ================= ALUMNI DIRECTORY ================= */
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8 animate-fade-in">
                <h2 className="text-sm font-black text-muted uppercase tracking-[0.2em]">
                  {alumniLoading
                    ? "Loading alumni mentors…"
                    : `Showing ${filteredAlumni.length} alumni mentor${filteredAlumni.length !== 1 ? "s" : ""}`}
                </h2>
                {hasAlumniFilters && !alumniLoading && (
                  <p className="text-sm text-muted">
                    Filtered by{" "}
                    {companyFilter !== "All" && <span className="font-semibold text-fg">{companyFilter}</span>}
                    {search.trim() && (
                      <>
                        {companyFilter !== "All" ? " matching " : ""}
                        <span className="font-semibold text-fg">"{search.trim()}"</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {alumniError && (
                <div className="text-center py-12 mb-8 bg-danger/5 rounded-2xl border border-danger/10">
                  <p className="text-danger font-bold">Failed to load alumni mentors. Please refresh the page.</p>
                </div>
              )}

              {alumniLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[280px] rounded-[28px] bg-surface2 animate-pulse" />
                  ))}
                </div>
              ) : filteredAlumni.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                  {filteredAlumni.map((alumniItem, idx) => (
                    <AlumniCard key={alumniItem._id} alumni={alumniItem} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center animate-fade-in">
                  <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-3xl bg-accent/10 animate-pulse" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-surface border border-border shadow-soft text-accent">
                      <SearchIcon className="h-10 w-10" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-fg">No alumni mentors found</h3>
                  <p className="text-muted mt-3 max-w-md mx-auto leading-relaxed text-sm">
                    {hasAlumniFilters
                      ? "Try adjusting your search query or company filter to find industry mentors."
                      : "We are currently vetting applications for working alumni mentors. Are you working in tech or industry? Apply to become a mentor."}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {hasAlumniFilters && (
                      <Button variant="primary" className="rounded-full px-8" onClick={clearAlumniFilters}>
                        Clear Filters
                      </Button>
                    )}
                    <Button variant="secondary" className="rounded-full px-8" onClick={() => navigate("/become-mentor")}>
                      Apply as Alumni Mentor
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SiteContainer>
        <RequestCollegeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
      <Footer />
    </>
  );
}

export default Explore;
