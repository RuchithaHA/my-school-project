import { useEffect, useState } from "react";
import { api } from "../api/client";

type Weather = {
  temperature_c: number;
  description: string;
  fetched_at: string;
};

export function WeatherWidget() {
  const [data, setData] = useState<Weather | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<Weather>("/api/weather");
        if (!cancelled) {
          setData(res.data);
          setErr(null);
        }
      } catch {
        if (!cancelled) {
          setErr("Weather is temporarily unavailable.");
          setData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {err}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Loading Bengaluru weather…
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Bengaluru weather</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{Math.round(data.temperature_c)}°C</p>
      <p className="mt-1 text-sm text-slate-600">{data.description}</p>
    </div>
  );
}
