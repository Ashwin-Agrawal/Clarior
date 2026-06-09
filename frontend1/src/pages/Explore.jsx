import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MentorCard from "../components/MentorCard";
import Skeleton from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

const DOMAINS = ["All", "Engineering", "Medical", "Commerce", "Arts", "Law", "Other"];

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7.5" />
      <path strokeLinecap="round" d="m20 20-3.8-3.8" />
    </svg>
  );
}

function Explore() {
  useSEO({ title: 'Explore Seniors', description: 'Browse and book verified seniors from top Indian colleges for ₹69. Get clarity on college, branch, and career decisions.' });

  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [branch, setBranch] = useState("All");

  useEffect(() => {
    const fetchSeniors = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get("/users/seniors");
        setSeniors(res.data.seniors || []);
      } catch (err) {
        console.error("Failed to fetch seniors", err);
        setError(true);
      } finally { setLoading(false); }
    };
    fetchSeniors();
  }, []);

  const branches = useMemo(() => {
    const b = new Set(seniors.map(s => s.branch).filter(Boolean));
    return ["All", ...Array.from(b).sort()];
  }, [seniors]);

  const filtered = useMemo(() => {
    return seniors.filter((s) => {
      const matchSearch = !search.trim() || [s.name, s.college, s.branch, s.domain].filter(Boolean).join(" ").toLowerCase().includes(search.trim().toLowerCase());
      const matchCourse = course === "All" || s.domain === course;
      const matchBranch = branch === "All" || s.branch === branch;
      return matchSearch && matchCourse && matchBranch;
    });
  }, [seniors, search, course, branch]);

  const hasFilters = search.trim() || course !== "All" || branch !== "All";
  const clearFilters = () => {
    setSearch("");
    setCourse("All");
    setBranch("All");
  };

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* Header Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "var(--hero-gradient)" }} />
          <SiteContainer className="relative">
            <div className="max-w-4xl mx-auto text-center animate-fade-up">
              <h1 className="heading-display text-4xl md:text-7xl font-black text-fg tracking-tight leading-[1.1]">
                Find your <span className="gradient-text">perfect mentor.</span>
              </h1>
              <p className="mt-8 text-xl text-muted leading-relaxed font-medium max-w-2xl mx-auto">
                Talk to seniors who've actually cleared the exams and colleges you're aiming for. No bias, just experience.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="mt-12 max-w-5xl mx-auto space-y-4 animate-fade-up delay-100">
              <div className="rounded-[32px] border border-border bg-surface p-3 shadow-card ">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative flex-1 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                      <SearchIcon className="h-6 w-6" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by name or college..."
                      className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-surface outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base font-bold"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative min-w-[160px]">
                      <select
                        className="w-full h-14 px-4 rounded-2xl border border-border bg-surface outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold appearance-none cursor-pointer"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                      >
                        {DOMAINS.map(d => <option key={d} value={d}>{d === "All" ? "All Courses" : d}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>

                    <div className="relative min-w-[160px]">
                      <select
                        className="w-full h-14 px-4 rounded-2xl border border-border bg-surface outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold appearance-none cursor-pointer"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                      >
                        {branches.map(b => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
                      disabled={!hasFilters}
                      onClick={clearFilters}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Chips (Course) */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 animate-fade-up delay-200">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => setCourse(d)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
                    course === d 
                      ? "bg-primary text-white shadow-hero" 
                      : "bg-surface border border-border text-muted hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </SiteContainer>
        </section>

        {/* Grid Section */}
        <SiteContainer className="pb-32">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8 animate-fade-in">
            <h2 className="text-sm font-black text-muted uppercase tracking-[0.2em]">
              {loading ? 'Loading seniors…' : `Showing ${filtered.length} senior${filtered.length !== 1 ? 's' : ''}`}
            </h2>
            {hasFilters && !loading && (
              <p className="text-sm text-muted">
                Filtered by <span className="font-semibold text-fg">{course}</span>{branch !== "All" ? <> · <span className="font-semibold text-fg">{branch}</span></> : null}{search.trim() ? <> · <span className="font-semibold text-fg">"{search.trim()}"</span></> : null}
              </p>
            )}
          </div>

          {error && (
            <div className="text-center py-12 mb-8 bg-danger/5 rounded-2xl border border-danger/10">
              <p className="text-danger font-bold">Failed to load mentors. Please refresh the page.</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((mentor, idx) => (
                <MentorCard key={mentor._id} mentor={mentor} index={idx} />
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
              <h3 className="text-2xl font-black text-fg">No seniors found</h3>
              <p className="text-muted mt-3 max-w-sm mx-auto leading-relaxed">Try adjusting your search or filters — or browse all seniors below.</p>
              <Button variant="primary" className="mt-8 rounded-full px-10" onClick={clearFilters}>
                See All Seniors
              </Button>
            </div>
          )}
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

export default Explore;
