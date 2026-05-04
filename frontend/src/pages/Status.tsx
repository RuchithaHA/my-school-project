import { useState } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";

type Admission = {
  application_number: string;
  student_name: string;
  class_applying: string;
  status: string;
  created_at: string | null;
  parent_email: string;
};

export function Status() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<Admission | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRow(null);
    const trimmed = number.trim();
    if (!trimmed) {
      setError("Enter your application number.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<Admission>(`/api/admissions/lookup/${encodeURIComponent(trimmed)}`);
      setRow(res.data);
    } catch {
      setError("No application found for that number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Application status</h1>
      <p className="mt-2 text-slate-600">Enter the application number shown on your confirmation.</p>
      <form onSubmit={lookup} className="mt-8 flex gap-2">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="e.g. GIS-2026-00001"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-60"
        >
          {loading ? "…" : "Check"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {row && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-sm text-slate-500">{row.application_number}</p>
            <StatusBadge status={row.status} />
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{row.student_name}</h2>
          <p className="mt-1 text-sm text-slate-600">Class applying: {row.class_applying}</p>
          <p className="mt-1 text-sm text-slate-600">Parent email: {row.parent_email}</p>
          {row.created_at && (
            <p className="mt-4 text-xs text-slate-500">Submitted: {new Date(row.created_at).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
