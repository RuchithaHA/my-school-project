import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function ThankYouPage() {
  const location = useLocation();
  const data = location.state || {};

  const applicationNumber = data.application_number || data.applicationNumber;
  const message = data.ai_welcome_message || data.aiWelcomeMessage;

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
        >
          <h1 className="font-serif text-3xl text-[#f6d06f] md:text-4xl">Thank you for applying!</h1>
          <p className="mt-3 text-slate-300">
            Your application has been received. Please save your application number for future reference.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="text-sm text-slate-300">Application Number</div>
            <div className="mt-2 text-2xl font-semibold tracking-wide">{applicationNumber || "—"}</div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-slate-200">Welcome message</div>
            <p className="mt-2 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-5 text-slate-200">
              {message || "We’ll share a personalized welcome message once the system is connected."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              Back to website
            </Link>
            <Link
              to="/apply"
              className="rounded-lg bg-[#f6d06f] px-5 py-2 text-sm font-semibold text-[#0b1630] hover:brightness-110"
            >
              Submit another application
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

