import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function HowItWorks() {
  return (
    <>
      <Navbar />
      <div className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight">How Clarior Works</h1>
          <p className="mt-3 text-muted text-lg">
            A simple guided flow for students and seniors, designed for trust and clarity.
          </p>

          <div className="mt-8 grid md:grid-cols-2 gap-5">
            {[
              "Senior sets available time slots",
              "Student explores seniors and books a slot",
              "At session start, student confirms on platform",
              "25-minute timer runs for fair completion",
              "Senior marks completion after valid duration",
              "Student confirms completion and submits review",
            ].map((step, i) => (
              <div key={step} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primaryFg text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="font-semibold">{step}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-surface p-6 shadow-soft">
            <h2 className="text-2xl font-bold">Trust & Quality Policy</h2>
            <p className="text-muted mt-2">
              Seniors are expected to provide honest, unbiased, experience-based guidance. Misleading guidance
              or repeated poor-quality feedback can lead to permanent account removal.
            </p>
            <div className="mt-4">
              <Link to="/mentor-guidelines" className="text-primary font-semibold hover:underline">
                Read full senior guidelines →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default HowItWorks;

