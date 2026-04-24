import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = useMemo(
    () => [
      { id: "about", label: "About" },
      { id: "curriculum", label: "Curriculum" },
      { id: "fees", label: "Fees" },
      { id: "timings", label: "Timings" },
      { id: "seats", label: "Seats" },
      { id: "facilities", label: "Facilities" },
      { id: "faculty", label: "Faculty" },
      { id: "testimonials", label: "Testimonials" },
      { id: "gallery", label: "Gallery" },
      { id: "contact", label: "Contact" },
    ],
    []
  );

  const goToAnchor = (id) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050914]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-sm text-white">
        <button type="button" onClick={() => goToAnchor("hero")} className="flex items-center gap-2 text-left">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f6d06f] to-[#d4a83e] font-bold text-[#0b1630]">
            GIS
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-base text-[#f6d06f]">Greenwood</span>
            <span className="block text-xs text-slate-300">International School</span>
          </span>
        </button>

        <div className="hidden items-center gap-5 md:flex">
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => goToAnchor(l.id)}
              className="text-slate-200 transition hover:text-[#f6d06f]"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/apply"
            className="hidden rounded-lg bg-[#f6d06f] px-4 py-2 text-sm font-semibold text-[#0b1630] hover:brightness-110 md:inline-flex"
          >
            Apply Now
          </Link>
          <Link
            to="/admin"
            className="hidden rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 md:inline-flex"
          >
            Admin
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-[#050914]/90 px-4 py-4 backdrop-blur md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              to="/apply"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[#f6d06f] px-4 py-2 text-center text-sm font-semibold text-[#0b1630]"
            >
              Apply Now
            </Link>
            {links.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => goToAnchor(l.id)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
              >
                {l.label}
              </button>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-slate-200 hover:bg-white/10"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
