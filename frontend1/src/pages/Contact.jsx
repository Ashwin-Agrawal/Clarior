import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <div className="px-6 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
            <p className="mt-3 text-muted text-lg">
              Need help with booking, payments, senior onboarding, or anything else?
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <div className="font-semibold">Support Email</div>
              <a href="mailto:support@clarior.app" className="text-primary hover:underline">
                support@clarior.app
              </a>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold">Send a message</h2>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="block">
                <div className="text-sm font-medium text-fg">Message</div>
                <textarea
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/15"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
              <Button type="submit" className="w-full">Submit</Button>
              {submitted && (
                <div className="text-sm text-success">Thanks! We will get back to you soon.</div>
              )}
            </form>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Contact;

