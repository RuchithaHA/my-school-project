import { Link, NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-brand-700 text-white" : "text-slate-700 hover:bg-brand-50"}`;

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-brand-900">
          Greenwood International School
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/admission" className={linkClass}>
            Admission
          </NavLink>
          <NavLink to="/status" className={linkClass}>
            Application status
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
