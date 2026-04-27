import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../hooks/useApi";

const ADMIN_PASSWORD = "admin123";
const AUTH_KEY = "gis_admin_authed";

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur">
      <div className="text-xs font-semibold tracking-widest text-slate-300">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-[#f6d06f]">{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "true");
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [records, setRecords] = useState([]);
  const [seats, setSeats] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const login = (e) => {
    e.preventDefault();
    setPwError("");
    if (pw !== ADMIN_PASSWORD) {
      setPwError("Wrong password.");
      return;
    }
    sessionStorage.setItem(AUTH_KEY, "true");
    setAuthed(true);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  const fetchAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [a, s, c] = await Promise.all([
        api.get("/admissions"),
        api.get("/seats"),
        api.get("/contacts"),
      ]);
      setRecords(a.data || []);
      setSeats(s.data || []);
      setContacts(c.data || []);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load admin data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    fetchAll();
  }, [authed]);

  const classes = useMemo(() => {
    const set = new Set(records.map((r) => r.class_applying).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);

    return records.filter((r) => {
      const statusOk = statusFilter === "all" || r.status === statusFilter;
      const classOk = classFilter === "all" || r.class_applying === classFilter;
      const qOk =
        !q ||
        String(r.student_name || "").toLowerCase().includes(q) ||
        String(r.parent_email || "").toLowerCase().includes(q);
      const created = r.created_at ? new Date(r.created_at) : null;
      const fromOk = !from || (created && created >= from);
      const toOk = !to || (created && created <= to);
      return statusOk && classOk && qOk && fromOk && toOk;
    });
  }, [records, statusFilter, classFilter, search, fromDate, toDate]);

  const summary = useMemo(() => {
    const total = records.length;
    const by = (s) => records.filter((r) => r.status === s).length;
    return {
      total,
      pending: by("pending"),
      approved: by("approved"),
      rejected: by("rejected"),
      waitlist: by("waitlist"),
    };
  }, [records]);

  const updateStatus = async (id, status) => {
    setError("");
    try {
      const res = await api.put(`/admissions/${id}/status`, { status });
      setRecords((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch (e) {
      setError(e.response?.data?.detail || "Status update failed.");
    }
  };

  const deleteRecord = async (id) => {
    setError("");
    const ok = window.confirm("Delete this application? This cannot be undone.");
    if (!ok) return;
    try {
      await api.delete(`/admissions/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e.response?.data?.detail || "Delete action failed.");
    }
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "Application Number",
      "Student Name",
      "DOB",
      "Gender",
      "Class Applying",
      "Previous School",
      "Father Name",
      "Mother Name",
      "Parent Email",
      "Parent Phone",
      "Alternate Phone",
      "Occupation",
      "Address",
      "City",
      "Pincode",
      "Medical Conditions",
      "Hear About Us",
      "Status",
      "AI Welcome Message",
      "Created At",
      "Updated At",
    ];
    const rows = filtered.map((r) => [
      r.id,
      r.application_number,
      r.student_name,
      r.date_of_birth,
      r.gender,
      r.class_applying,
      r.previous_school,
      r.father_name,
      r.mother_name,
      r.parent_email,
      r.parent_phone,
      r.alternate_phone,
      r.parent_occupation,
      r.address,
      r.city,
      r.pincode,
      r.medical_conditions,
      r.hear_about_us,
      r.status,
      r.ai_welcome_message,
      r.created_at,
      r.updated_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((col) => `"${String(col ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "greenwood_admissions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateSeatTotal = async (className, totalSeats) => {
    setError("");
    try {
      const res = await api.put(`/seats/${encodeURIComponent(className)}`, { total_seats: Number(totalSeats) });
      setSeats((prev) => prev.map((s) => (s.id === res.data.id ? res.data : s)));
    } catch (e) {
      setError(e.response?.data?.detail || "Seat update failed.");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050914] px-4 py-14 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur">
            <h1 className="font-serif text-3xl text-[#f6d06f]">Admin Login</h1>
            <p className="mt-2 text-sm text-slate-300">Enter the admin password to access the dashboard.</p>
            <form onSubmit={login} className="mt-6 grid gap-3">
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
                placeholder="Password"
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60"
              />
              <button className="rounded-xl bg-[#f6d06f] px-5 py-3 text-sm font-semibold text-[#0b1630] hover:brightness-110" type="submit">
                Login
              </button>
              {pwError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{pwError}</div>}
              <Link to="/" className="text-center text-sm text-slate-300 hover:text-[#f6d06f]">
                Back to website
              </Link>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-[#f6d06f] md:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">Real-time admissions, seats, and contact messages.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={fetchAll} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
              Refresh
            </button>
            <Link to="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
              Website
            </Link>
            <button onClick={logout} className="rounded-xl bg-[#f6d06f] px-4 py-2 text-sm font-semibold text-[#0b1630] hover:brightness-110">
              Logout
            </button>
          </div>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <SummaryCard label="TOTAL" value={summary.total} />
          <SummaryCard label="PENDING" value={summary.pending} />
          <SummaryCard label="APPROVED" value={summary.approved} />
          <SummaryCard label="REJECTED" value={summary.rejected} />
          <SummaryCard label="WAITLIST" value={summary.waitlist} />
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold">Applications</div>
            <button onClick={exportCsv} className="rounded-xl bg-[#f6d06f] px-4 py-2 text-sm font-semibold text-[#0b1630] hover:brightness-110">
              Export CSV
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60 md:col-span-2"
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60">
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlist">Waitlist</option>
            </select>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60">
              {classes.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All classes" : c}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3 md:col-span-5 md:grid-cols-4">
              <div className="text-xs text-slate-300">
                From
                <input value={fromDate} onChange={(e) => setFromDate(e.target.value)} type="date" className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60" />
              </div>
              <div className="text-xs text-slate-300">
                To
                <input value={toDate} onChange={(e) => setToDate(e.target.value)} type="date" className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setClassFilter("all");
                  setFromDate("");
                  setToDate("");
                }}
                className="h-[54px] rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 hover:bg-white/10"
              >
                Clear filters
              </button>
              <div className="h-[54px] rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
                Showing <span className="text-white">{filtered.length}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-slate-300">Loading…</div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-[1200px] w-full bg-black/20 text-left text-sm">
                <thead className="bg-white/5 text-xs text-slate-300">
                  <tr>
                    <th className="p-3">Application</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Parent Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-white/10">
                      <td className="p-3">
                        <div className="font-semibold text-white">{r.application_number}</div>
                        <div className="text-xs text-slate-400">ID {r.id}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{r.student_name}</div>
                        <div className="text-xs text-slate-400">{r.gender} • DOB {r.date_of_birth}</div>
                      </td>
                      <td className="p-3">{r.class_applying}</td>
                      <td className="p-3">{r.parent_email}</td>
                      <td className="p-3">{r.parent_phone}</td>
                      <td className="p-3 capitalize">{r.status}</td>
                      <td className="p-3 text-slate-300">{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateStatus(r.id, "approved")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold">
                            Approve
                          </button>
                          <button onClick={() => updateStatus(r.id, "rejected")} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold">
                            Reject
                          </button>
                          <button onClick={() => updateStatus(r.id, "waitlist")} className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold">
                            Waitlist
                          </button>
                          <button onClick={() => deleteRecord(r.id)} className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td className="p-5 text-slate-400" colSpan={8}>
                        No records found for current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm font-semibold">Seats management</div>
            <p className="mt-2 text-sm text-slate-300">Update total seats per class. Available seats recalculates automatically.</p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-[680px] w-full bg-black/20 text-sm">
                <thead className="bg-white/5 text-xs text-slate-300">
                  <tr>
                    <th className="p-3 text-left">Class</th>
                    <th className="p-3 text-left">Total</th>
                    <th className="p-3 text-left">Booked</th>
                    <th className="p-3 text-left">Available</th>
                    <th className="p-3 text-left">Update total</th>
                  </tr>
                </thead>
                <tbody>
                  {seats.map((s) => (
                    <SeatRow key={s.id} seat={s} onUpdate={updateSeatTotal} />
                  ))}
                  {!seats.length && (
                    <tr>
                      <td className="p-4 text-slate-400" colSpan={5}>No seats data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm font-semibold">Contact messages</div>
            <p className="mt-2 text-sm text-slate-300">Messages submitted from the website contact form.</p>
            <div className="mt-4 grid gap-3">
              {contacts.slice(0, 25).map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>
                    </div>
                    <div className="text-xs text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</div>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{c.message}</div>
                </motion.div>
              ))}
              {!contacts.length && <div className="text-sm text-slate-400">No messages yet.</div>}
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-slate-400">
          Tip: If your frontend is deployed, set `VITE_API_URL` to your public backend URL. Locally, it defaults to `http://localhost:8000`.
        </div>
      </div>
    </div>
  );
}

function SeatRow({ seat, onUpdate }) {
  const [value, setValue] = useState(seat.total_seats);
  useEffect(() => setValue(seat.total_seats), [seat.total_seats]);

  return (
    <tr className="border-t border-white/10">
      <td className="p-3">{seat.class_name}</td>
      <td className="p-3">{seat.total_seats}</td>
      <td className="p-3">{seat.seats_booked}</td>
      <td className="p-3">{seat.seats_available}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-24 rounded-lg border border-white/10 bg-black/20 p-2 text-sm outline-none focus:border-[#f6d06f]/60"
          />
          <button
            type="button"
            onClick={() => onUpdate(seat.class_name, value)}
            className="rounded-lg bg-[#f6d06f] px-3 py-2 text-xs font-semibold text-[#0b1630] hover:brightness-110"
          >
            Save
          </button>
        </div>
      </td>
    </tr>
  );
}
