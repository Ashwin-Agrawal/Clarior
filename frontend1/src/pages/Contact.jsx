import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import useSEO from "../hooks/useSEO";
import RequestCollegeModal from "../components/RequestCollegeModal";

function Contact() {
  useSEO({
    title: "Contact Support",
    description: "Get help with booking, payments, or account verification from the Clarior team."
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSubmitted(false);

      await api.post("/support", {
        name: name.trim(),
        email: email.trim(),
        category,
        message: message.trim()
      });

      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      setCategory("General Inquiry");
    } catch (err) {
      console.error("Support submission failed:", err);
      setError(err?.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-[85vh] bg-bg px-6 py-16 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider">
              Get in touch
            </div>
            <h1 className="heading-display text-4xl md:text-6xl font-black text-fg leading-none">
              Contact <span className="gradient-text-animated">Support.</span>
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-md">
              Have questions about booking sessions, pending payouts, account verification, or general questions? Drop us a message, and our team will get back to you within 24 hours.
            </p>
            
            <div className="rounded-3xl border border-border/80 bg-surface/60 backdrop-blur-md p-6 shadow-card hover:border-primary/20 transition-all max-w-md">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Support Email</div>
              <a href="mailto:support.clarior@gmail.com" className="text-lg font-black text-primary hover:text-accent transition-colors">
                support.clarior@gmail.com
              </a>
            </div>

            {/* College Request CTA */}
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface max-w-md shadow-card hover:shadow-lift hover:border-primary/25 transition-all duration-300 group">
              {/* Subtle gradient tint */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04] pointer-events-none" />
              {/* Glowing orb */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/20 blur-2xl pointer-events-none group-hover:bg-accent/35 transition-all duration-500" />

              <div className="relative z-10 p-5 flex items-start gap-4">
                {/* Icon */}
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  🏫
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Missing Your College?</div>
                  <div className="text-sm font-bold text-fg leading-relaxed mb-4">
                    Can't find your college on Clarior? Submit a request and we'll add it to the platform.
                  </div>

                  {/* Proper Button with same styling as Become Mentor */}
                  <Button
                    onClick={() => setIsCollegeModalOpen(true)}
                    size="sm"
                    className="rounded-full px-5 relative overflow-hidden"
                    iconRight={
                      <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
                    }
                  >
                    <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] translate-x-[-180%] group-hover:translate-x-[180%] transition-transform duration-700" />
                    Request College Addition
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-6 md:p-8 rounded-[32px] border border-border bg-surface/75 backdrop-blur-xl shadow-lift">
            <h2 className="text-xl font-bold text-fg">Send a message</h2>
            <p className="text-xs text-muted mt-1 mb-6">We'll review your ticket and email you back.</p>
            
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl text-xs font-bold bg-danger/5 border border-danger/25 text-danger animate-scale-in">
                  {error}
                </div>
              )}
              {submitted && (
                <div className="p-4 rounded-xl text-xs font-bold bg-success/5 border border-success/25 text-success animate-scale-in">
                  🎉 Message sent! We will review your support ticket and email you back soon.
                </div>
              )}

              <Input 
                label="Name" 
                placeholder="Your full name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={loading}
              />
              
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="your.email@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={loading}
              />

              <label className="block">
                <div className="text-sm font-semibold text-fg">How can we help? (Category)</div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="mt-2 w-full h-11 px-4 rounded-xl border border-border bg-surface text-sm font-semibold text-fg outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Booking Problem">Booking Problem</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-fg">Message</div>
                <textarea
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                />
              </label>

              <Button type="submit" className="w-full h-12 rounded-xl mt-2 font-black" loading={loading}>
                Submit Support Ticket
              </Button>
            </form>
          </Card>
        </div>
      </div>
      <Footer />

      <RequestCollegeModal isOpen={isCollegeModalOpen} onClose={() => setIsCollegeModalOpen(false)} />
    </>
  );
}

export default Contact;
