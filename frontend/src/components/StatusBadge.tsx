type Status = "pending" | "approved" | "rejected" | "waitlist";

const styles: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-900 ring-amber-300",
  approved: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  rejected: "bg-red-100 text-red-900 ring-red-300",
  waitlist: "bg-sky-100 text-sky-900 ring-sky-300",
};

const labels: Record<Status, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  waitlist: "Waitlisted",
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status as Status) in styles ? (status as Status) : "pending";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[s]}`}>
      {labels[s] ?? status}
    </span>
  );
}
