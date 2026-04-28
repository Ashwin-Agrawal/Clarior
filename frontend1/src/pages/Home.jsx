import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SiteContainer from "../components/layout/SiteContainer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { BrandMark } from "../components/layout/icons";

const colleges = [
  {
    name: "Rishihood University",
    avatar: "R",
    avatarBg: "bg-[rgba(99,102,241,0.12)] text-indigo-600",
    location: "Sonipat, Haryana",
    badge: "🎓 Liberal Arts",
    description: "A purpose-driven university focused on creativity, entrepreneurship, and holistic learning.",
  },
  {
    name: "AIIMS Delhi",
    avatar: "A",
    avatarBg: "bg-[rgba(244,63,94,0.12)] text-rose-600",
    location: "New Delhi",
    badge: "🏥 Medical",
    description: "India's premier medical institution. Talk to seniors about MBBS life, PG prep, and hospital rotations.",
  },
  {
    name: "BITS Pilani",
    avatar: "B",
    avatarBg: "bg-[rgba(20,184,166,0.12)] text-teal-600",
    location: "Pilani, Rajasthan",
    badge: "💻 Engineering",
    description: "One of India's top engineering colleges. Get insights on PS, thesis, dual degrees, and placements.",
  },
];

function Home() {
  return (
    <>
      <Navbar />

      <div className="relative overflow-hidden bg-bg">
        {/* Hero gradient background - subtle and theme-aware */}
        <div 
          className="absolute inset-x-0 top-0 h-155 pointer-events-none"
          style={{ background: "var(--hero-gradient)" }}
        />

        {/* Decorative blur elements - theme-aware */}
        <div 
          className="absolute left-0 top-28 h-72 w-72 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: "var(--hero-blur-left)" }}
        />
        <div 
          className="absolute right-0 top-52 h-64 w-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: "var(--hero-blur-right)" }}
        />

        <SiteContainer className="relative py-24 sm:py-28 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)] lg:gap-20">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface/90 px-4 py-2 text-xs font-semibold shadow-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-primary" style={{ backgroundColor: "var(--badge-primary)" }}>
                  <BrandMark className="h-4 w-4" />
                </span>
                <span className="text-muted">25-minute sessions</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span className="text-muted">Verified student seniors</span>
              </div>

              <div className="max-w-3xl space-y-6">
                <h1 className="text-5xl font-extrabold tracking-[-0.04em] text-fg sm:text-6xl lg:text-7xl">
                  Real guidance from seniors who have been there.
                </h1>
                <p className="text-lg leading-8 text-muted lg:text-xl">
                  Talk to verified seniors before making your biggest academic decision. Get honest answers about campus life, placements, and everything in between.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/explore">
                  <Button variant="primary" size="lg">
                    Explore seniors
                  </Button>
                </Link>
                <Link to="/become-senior">
                  <Button variant="secondary" size="lg">
                    Become a Senior
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl text-primary text-xl font-bold" style={{ backgroundColor: "var(--badge-primary)" }}>
                    ₹
                  </div>
                  <div className="mt-5 text-3xl font-extrabold text-fg">₹52</div>
                  <div className="mt-2 text-sm text-muted">Typical senior earning per session</div>
                </Card>
                <Card className="p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl text-sky-600 text-xl font-bold" style={{ backgroundColor: "var(--badge-accent)" }}>
                    ⏱
                  </div>
                  <div className="mt-5 text-3xl font-extrabold text-fg">25:00</div>
                  <div className="mt-2 text-sm text-muted">Structured session timer built in</div>
                </Card>
                <Card className="p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl text-amber-500 text-xl font-bold" style={{ backgroundColor: "var(--badge-warning)" }}>
                    ★
                  </div>
                  <div className="mt-5 text-3xl font-extrabold text-fg">4.9/5</div>
                  <div className="mt-2 text-sm text-muted">Reviewed after every guided call</div>
                </Card>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-10 top-0 h-36 w-36 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: "var(--badge-primary)" }} />
              <Card className="relative overflow-hidden p-8 sm:p-10" style={{ boxShadow: "var(--shadow-hero)" }}>
                <div className="absolute right-4 top-4 h-28 w-28 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: "var(--badge-accent)" }} />
                <div className="relative space-y-4">
                  <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Built for trust
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
                    Guided, transparent, and session-first.
                  </h2>
                  <p className="text-base leading-7 text-muted">
                    Students get clarity before big academic decisions, and seniors get a clean, reliable space to help.
                  </p>

                  <div className="space-y-4">
                    {[
                      "Choose a senior based on real student experience.",
                      "Join a guided 25-minute call with session tracking.",
                      "Leave ratings and reviews that keep quality visible.",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[22px] border border-border bg-surface2/80 px-4 py-4">
                        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-3xl bg-primary text-white">
                          ✓
                        </span>
                        <p className="text-sm leading-6 text-fg">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/how-it-works">
                      <Button variant="primary" size="md">
                        See how it works
                      </Button>
                    </Link>
                    <Link to="/contact">
                      <Button variant="secondary" size="md">
                        Contact us
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </SiteContainer>
      </div>

      <div className="bg-surface">
        <SiteContainer className="py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-fg">Featured Colleges</h2>
              <p className="mt-3 text-muted leading-7">
                Explore top colleges and connect with seniors who are living the experience right now.
              </p>
            </div>
            <Link to="/explore">
              <Button variant="primary" size="md">
                Explore seniors
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {colleges.map((college) => (
              <Card key={college.name} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-bold ${college.avatarBg}`}>
                      {college.avatar}
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-fg">{college.name}</div>
                      <div className="text-muted mt-1 flex items-center gap-2 text-sm">
                        <span>📍</span>
                        <span>{college.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {college.badge}
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-muted">{college.description}</p>
                <div className="mt-6">
                  <Link to="/explore">
                    <Button variant="primary" size="md" className="w-full rounded-full">
                      Book a slot
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </SiteContainer>
      </div>

      <div id="pricing" className="bg-surface">
        <SiteContainer className="py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Affordable & transparent</h2>
              <p className="text-muted mt-2">Get clarity for less than a movie ticket.</p>
            </div>
            <Link to="/buy-credits">
              <Button variant="primary" size="md">
                Buy credits
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-3 bg-surface rounded-4xl p-6 border border-border">
            <Card className="p-6">
              <div className="text-sm text-muted">Quick chat</div>
              <div className="text-3xl font-extrabold mt-2">₹69</div>
              <div className="text-muted mt-2">25 min video call</div>
              <ul className="mt-4 space-y-2 text-sm text-muted pl-5 list-disc">
                <li>Ask quick doubts</li>
                <li>Get honest answers</li>
                <li>Rating after session</li>
              </ul>
              <div className="mt-6">
                <Link to="/buy-credits">
                  <Button variant="primary" size="md" className="w-full">
                    Choose Quick Chat
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6 ring-1 ring-primary/15">
              <div className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primaryFg">
                Most booked
              </div>
              <div className="text-sm text-muted mt-3">Deep dive</div>
              <div className="text-3xl font-extrabold mt-2">₹189</div>
              <div className="text-muted mt-2">3 sessions bundle</div>
              <ul className="mt-4 space-y-2 text-sm text-muted pl-5 list-disc">
                <li>Detailed college insights</li>
                <li>Admission guidance</li>
                <li>Multiple seniors</li>
              </ul>
              <div className="mt-6">
                <Link to="/buy-credits">
                  <Button variant="primary" size="md" className="w-full">
                    Choose Deep Dive
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted">Group session</div>
              <div className="text-3xl font-extrabold mt-2">Coming soon</div>
              <div className="text-muted mt-2">Q&A with current students</div>
              <ul className="mt-4 space-y-2 text-sm text-muted pl-5 list-disc">
                <li>Learn from others' questions</li>
                <li>Recording available</li>
                <li>Affordable pricing</li>
              </ul>
              <div className="mt-6">
                <Button variant="secondary" size="md" className="w-full" disabled>
                  Coming soon
                </Button>
              </div>
            </Card>
          </div>
        </SiteContainer>
      </div>

      <Footer />
    </>
  );
}

export default Home;
