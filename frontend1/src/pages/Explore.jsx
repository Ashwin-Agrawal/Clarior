import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import MentorCard from "../components/MentorCard";
import Footer from "../components/Footer";

function Explore() {
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [domain, setDomain] = useState("All");
  const [branch, setBranch] = useState("");

  useEffect(() => {
    const fetchSeniors = async () => {
      try {
        setError("");
        setLoading(true);
        const college = activeTag === "All" ? "" : activeTag;
        const res = await api.get("/users/seniors", {
          params: {
            q: query.trim() || undefined,
            college: college || undefined,
            domain: domain === "All" ? undefined : domain,
            branch: branch.trim() || undefined,
          },
        });
        setSeniors(res.data.seniors);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load seniors");
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchSeniors, 250);
    return () => clearTimeout(t);
  }, [query, activeTag, domain, branch]);

  const tags = ["All", "NST", "SST", "Vedam", "NIAT", "Polaris", "100x"];
  const domains = ["All", "Engineering", "Medical", "Commerce", "Arts", "Law", "Other"];

  return (
    <>
      <Navbar />

      <div className="px-6 pt-10 pb-14 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-9">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore seniors</h2>
          <p className="text-muted mt-3 text-lg">
            Discover verified seniors, compare profiles, and book a session in minutes.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted">
            <span className="font-semibold text-fg">{seniors.length}</span> seniors currently available
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1">
              <div className="text-sm font-semibold text-fg">Search by college</div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by college name"
                className="mt-2 w-full h-12 border border-border rounded-xl px-4 bg-surface2 text-fg placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:w-[520px]">
              <div className="text-sm font-semibold text-fg">Filter by college</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => {
                  const active = t === activeTag;
                  return (
                    <button
                      key={t}
                      onClick={() => setActiveTag(t)}
                      className={
                        active
                          ? "px-3 py-1.5 rounded-full text-sm font-semibold bg-primary text-primaryFg"
                          : "px-3 py-1.5 rounded-full text-sm font-semibold border border-border bg-surface hover:bg-surface2 text-fg"
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm font-semibold text-fg">Domain</div>
                  <select
                    className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  >
                    {domains.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-fg">Branch</div>
                  <input
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="CSE, ECE, MBBS…"
                    className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {loading && <div className="text-muted">Loading…</div>}
        {!loading && error && (
          <div className="text-sm text-danger bg-surface2 border border-danger rounded-xl p-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="text-sm text-muted mb-4">
              Showing <span className="font-semibold text-fg">{seniors.length}</span> seniors
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seniors.map((mentor) => (
                <MentorCard key={mentor._id} mentor={mentor} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Explore;