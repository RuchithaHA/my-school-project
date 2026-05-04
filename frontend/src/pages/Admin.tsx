import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { messageFromAxiosError } from "../lib/errors";

const ADMIN_PASSWORD = "admin123";
const AUTH_KEY = "greenwood_admin_auth";

type AdmissionRow = {
  id: string;
  application_number: string;
  student_name: string;
  class_applying: string;
  parent_email: string;
  parent_phone: string;
  city: string;
  status: string;
  created_at: string | null;
};

type SeatRow = {
  id: string;
  class_name: string;
  total_seats: number;
  seats_booked: number;
  seats_available: number;
};

type ContactRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlist", label: "Waitlisted" },
] as const;

export function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<"admissions" | "contacts">("admissions");
  const [admissions, setAdmissions] = useState<AdmissionRow[]>([]);
  const [seats, setSeats] = useState<SeatRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [seatDrafts, setSeatDrafts] = useState<Record<string, number>>({});

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [a, s, c] = await Promise.all([
        api.get<AdmissionRow[]>("/api/admissions"),
        api.get<SeatRow[]>("/api/seats"),
        api.get<ContactRow[]>("/api/contacts"),
      ]);
      setAdmissions(a.data);
      setSeats(s.data);
      setContacts(c.data);
      const drafts: Record<string, number> = {};
      for (const row of s.data) {
        drafts[row.class_name] = row.total_seats;
      }
      setSeatDrafts(drafts);
    } catch (e) {
      toast.error(messageFromAxiosError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      void loadAll();
    }
  }, [authed, loadAll]);

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setLoginError(null);
      setPassword("");
    } else {
      setLoginError("Incorrect password.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  const counts = useMemo(() => {
    const base = { total: admissions.length, pending: 0, approved: 0, rejected: 0, waitlist: 0 };
    for (const r of admissions) {
      if (r.status === "pending") {
        base.pending += 1;
      } else if (r.status === "approved") {
        base.approved += 1;
      } else if (r.status === "rejected") {
        base.rejected += 1;
      } else if (r.status === "waitlist") {
        base.waitlist += 1;
      }
    }
    return base;
  }, [admissions]);

  const filteredAdmissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admissions.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        r.student_name.toLowerCase().includes(q) || r.application_number.toLowerCase().includes(q)
      );
    });
  }, [admissions, search, statusFilter]);

  const changeStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/admissions/${id}/status`, { status });
      setAdmissions((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success("Status updated.");
    } catch (e) {
      toast.error(messageFromAxiosError(e));
    }
  };

  const removeAdmission = async (id: string) => {
    if (!window.confirm("Delete this application? This cannot be undone.")) {
      return;
    }
    try {
      await api.delete(`/api/admissions/${id}`);
      setAdmissions((prev) => prev.filter((r) => r.id !== id));
      await loadAll();
      toast.success("Application deleted.");
    } catch (e) {
      toast.error(messageFromAxiosError(e));
    }
  };

  const saveSeatTotal = async (className: string) => {
    const total = seatDrafts[className];
    if (typeof total !== "number" || Number.isNaN(total) || total < 0) {
      toast.error("Enter a valid total seats value.");
      return;
    }
    try {
      await api.put(`/api/seats/${encodeURIComponent(className)}`, { total_seats: total });
      await loadAll();
      toast.success("Seats updated.");
    } catch (e) {
      toast.error(messageFromAxiosError(e));
    }
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">Admin login</h1>
        <form onSubmit={tryLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            {loginError && <p className="mt-1 text-sm text-red-600">{loginError}</p>}
          </div>
          <button type="submit" className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-900">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadAll()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900"
          >
            Log out
          </button>
        </div>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-500">Loading…</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: counts.total, bg: "bg-slate-100" },
          { label: "Pending", value: counts.pending, bg: "bg-amber-50" },
          { label: "Approved", value: counts.approved, bg: "bg-emerald-50" },
          { label: "Rejected", value: counts.rejected, bg: "bg-red-50" },
          { label: "Waitlisted", value: counts.waitlist, bg: "bg-sky-50" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl border border-slate-200 p-4 shadow-sm ${c.bg}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Seats by class</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Booked</th>
                <th className="py-2 pr-4">Available</th>
                <th className="py-2">Update total</th>
              </tr>
            </thead>
            <tbody>
              {seats.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium">{s.class_name}</td>
                  <td className="py-2 pr-4">{s.total_seats}</td>
                  <td className="py-2 pr-4">{s.seats_booked}</td>
                  <td className="py-2 pr-4">{s.seats_available}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        className="w-24 rounded border border-slate-300 px-2 py-1"
                        value={seatDrafts[s.class_name] ?? s.total_seats}
                        onChange={(e) =>
                          setSeatDrafts((d) => ({ ...d, [s.class_name]: Number(e.target.value) }))
                        }
                      />
                      <button
                        type="button"
                        className="rounded bg-brand-700 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-900"
                        onClick={() => void saveSeatTotal(s.class_name)}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            tab === "admissions" ? "border-brand-700 text-brand-900" : "border-transparent text-slate-600"
          }`}
          onClick={() => setTab("admissions")}
        >
          Admissions
        </button>
        <button
          type="button"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            tab === "contacts" ? "border-brand-700 text-brand-900" : "border-transparent text-slate-600"
          }`}
          onClick={() => setTab("contacts")}
        >
          Contacts
        </button>
      </div>

      {tab === "admissions" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              placeholder="Search name or application number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-3 py-2">App no</th>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{r.application_number}</td>
                    <td className="px-3 py-2">{r.student_name}</td>
                    <td className="px-3 py-2">{r.class_applying}</td>
                    <td className="px-3 py-2">{r.parent_email}</td>
                    <td className="px-3 py-2">{r.parent_phone}</td>
                    <td className="px-3 py-2">{r.city}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <select
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                          value={r.status}
                          onChange={(e) => void changeStatus(r.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          onClick={() => void removeAdmission(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "contacts" && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2">{c.email}</td>
                  <td className="px-3 py-2 whitespace-pre-wrap">{c.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
