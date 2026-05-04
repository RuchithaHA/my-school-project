import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../api/client";

const schema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().min(1, "This field is required").email("Invalid email"),
  message: z.string().min(5, "Please enter a longer message."),
});

type FormValues = z.infer<typeof schema>;

export function Contact() {
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSending(true);
    try {
      await api.post("/api/contacts", values);
      toast.success("Thank you — we have received your message.");
      reset();
    } catch {
      toast.error("Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
      <p className="mt-2 text-slate-600">Reach the admissions desk — we typically respond within two working days.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            {...register("name")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Message</label>
          <textarea
            rows={5}
            {...register("message")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-brand-900 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
