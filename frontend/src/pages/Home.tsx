import { Link } from "react-router-dom";
import { WeatherWidget } from "../components/WeatherWidget";

export function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-emerald-800 px-4 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">Admissions open</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">Greenwood International School</h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              A caring community focused on academic excellence, character, and holistic growth for every learner.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admission"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-900 shadow hover:bg-emerald-50"
              >
                Start application
              </Link>
              <Link
                to="/status"
                className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Check application status
              </Link>
            </div>
          </div>
          <div className="w-full max-w-sm text-slate-900 lg:shrink-0">
            <WeatherWidget />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Why families choose Greenwood</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Experienced faculty",
              body: "Dedicated educators who mentor students through structured academics and co-curricular growth.",
            },
            {
              title: "Safe, modern campus",
              body: "Spacious classrooms, labs, and activity zones designed for collaborative and focused learning.",
            },
            {
              title: "Transparent admissions",
              body: "Simple online application, clear status updates, and responsive admissions support.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
