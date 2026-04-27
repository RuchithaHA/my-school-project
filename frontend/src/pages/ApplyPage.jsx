import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../hooks/useApi";
import Navbar from "../components/Navbar";

const steps = ["Student", "Parents", "Address & Medical", "Review"];

const initial = {
  student_name: "",
  date_of_birth: "",
  gender: "",
  class_applying: "",
  previous_school: "",

  father_name: "",
  mother_name: "",
  parent_email: "",
  parent_phone: "",
  alternate_phone: "",
  parent_occupation: "",

  address: "",
  city: "",
  pincode: "",
  medical_conditions: "",
  hear_about_us: "",
};

function requiredForStep(stepIdx) {
  if (stepIdx === 0) return ["student_name", "date_of_birth", "gender", "class_applying"];
  if (stepIdx === 1) return ["parent_email", "parent_phone"];
  if (stepIdx === 2) return ["address", "city", "pincode"];
  return [];
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-200">
      <span className="text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export default function ApplyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ loading: false, error: "" });

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  const set = (name) => (e) => setForm((p) => ({ ...p, [name]: e.target.value }));

  const validateCurrent = () => {
    const required = requiredForStep(step);
    for (const k of required) {
      if (!String(form[k] ?? "").trim()) return "Please fill all required fields in this step.";
    }
    return "";
  };

  const next = () => {
    const msg = validateCurrent();
    if (msg) {
      setStatus({ loading: false, error: msg });
      return;
    }
    setStatus({ loading: false, error: "" });
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const prev = () => {
    setStatus({ loading: false, error: "" });
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    const msg = validateCurrent();
    if (msg) {
      setStatus({ loading: false, error: msg });
      return;
    }
    setStatus({ loading: true, error: "" });
    try {
      const res = await api.post("/admissions", form);
      navigate("/thank-you", { state: { ...res.data, student_name: form.student_name } });
    } catch (e) {
      const detail = e.response?.data?.detail;
      setStatus({
        loading: false,
        error:
          (Array.isArray(detail) ? detail.map((d) => d?.msg).filter(Boolean).join(" • ") : detail) ||
          e.response?.data?.message ||
          "Submission failed. Please try again.",
      });
      return;
    }
    setStatus({ loading: false, error: "" });
  };

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl text-[#f6d06f] md:text-4xl">Admission Form</h1>
              <p className="mt-2 text-sm text-slate-300">Complete the steps to apply to Greenwood International School.</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span>
                  Step {step + 1} / {steps.length}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-[#f6d06f] to-[#d4a83e]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {steps.map((s, idx) => (
              <span
                key={s}
                className={[
                  "rounded-full px-3 py-1 text-xs",
                  idx === step ? "bg-[#f6d06f] text-[#0b1630]" : "bg-white/10 text-slate-200",
                ].join(" ")}
              >
                {s}
              </span>
            ))}
          </div>

          {status.error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{status.error}</p>}

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            {step === 0 && (
              <>
                <Field label="Student Name *">
                  <input
                    name="student_name"
                    value={form.student_name}
                    onChange={set("student_name")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Date of Birth *">
                  <input
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={set("date_of_birth")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Gender *">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={set("gender")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  >
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Class Applying *">
                  <select
                    name="class_applying"
                    value={form.class_applying}
                    onChange={set("class_applying")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  >
                    <option value="">Select</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    {Array.from({ length: 10 }).map((_, i) => {
                      const cls = `Class ${i + 1}`;
                      return (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      );
                    })}
                    <option value="PUC">PUC</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </Field>
                <Field label="Previous School">
                  <input
                    name="previous_school"
                    value={form.previous_school}
                    onChange={set("previous_school")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Father Name">
                  <input
                    name="father_name"
                    value={form.father_name}
                    onChange={set("father_name")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Mother Name">
                  <input
                    name="mother_name"
                    value={form.mother_name}
                    onChange={set("mother_name")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Email *">
                  <input
                    name="parent_email"
                    type="email"
                    value={form.parent_email}
                    onChange={set("parent_email")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Phone *">
                  <input
                    name="parent_phone"
                    value={form.parent_phone}
                    onChange={set("parent_phone")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Alternate Phone">
                  <input
                    name="alternate_phone"
                    value={form.alternate_phone}
                    onChange={set("alternate_phone")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Occupation">
                  <input
                    name="parent_occupation"
                    value={form.parent_occupation}
                    onChange={set("parent_occupation")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Address *">
                  <textarea
                    name="address"
                    rows={3}
                    value={form.address}
                    onChange={set("address")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60 md:col-span-2"
                  />
                </Field>
                <Field label="City *">
                  <input
                    name="city"
                    value={form.city}
                    onChange={set("city")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Pincode *">
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={set("pincode")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
                <Field label="Medical Conditions">
                  <textarea
                    name="medical_conditions"
                    rows={3}
                    value={form.medical_conditions}
                    onChange={set("medical_conditions")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60 md:col-span-2"
                  />
                </Field>
                <Field label="How did you hear about us?">
                  <input
                    name="hear_about_us"
                    value={form.hear_about_us}
                    onChange={set("hear_about_us")}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 outline-none focus:border-[#f6d06f]/60"
                  />
                </Field>
              </>
            )}

            {step === 3 && (
              <div className="md:col-span-2">
                <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                  {Object.entries(form)
                    .filter(([, v]) => String(v || "").trim())
                    .map(([k, v]) => (
                      <div key={k} className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                        <span className="text-slate-300">{k.replaceAll("_", " ")}</span>
                        <span className="max-w-[520px] text-right">{String(v)}</span>
                      </div>
                    ))}
                </div>
                <p className="mt-3 text-xs text-slate-300">
                  By submitting, you confirm the details are accurate. You’ll receive an application number on the next page.
                </p>
              </div>
            )}
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={prev}
              disabled={step === 0 || status.loading}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50"
            >
              Back
            </button>
            <div className="flex gap-2">
              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  disabled={status.loading}
                  className="rounded-lg bg-[#f6d06f] px-5 py-2 text-sm font-semibold text-[#0b1630] hover:brightness-110 disabled:opacity-60"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={status.loading}
                  className="rounded-lg bg-[#f6d06f] px-5 py-2 text-sm font-semibold text-[#0b1630] hover:brightness-110 disabled:opacity-60"
                >
                  {status.loading ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

