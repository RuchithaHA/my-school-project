import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../api/client";
import { CLASS_OPTIONS } from "../lib/classes";
import { messageFromAxiosError } from "../lib/errors";

const required = z.string().trim().min(1, "This field is required");

const emailField = z.string().trim().superRefine((val, ctx) => {
  if (!val) {
    ctx.addIssue({ code: "custom", message: "This field is required" });
    return;
  }
  const parsed = z.string().email().safeParse(val);
  if (!parsed.success) {
    ctx.addIssue({ code: "custom", message: "Invalid email" });
  }
});

const phoneField = z.string().superRefine((val, ctx) => {
  const v = (val ?? "").trim();
  if (!v) {
    ctx.addIssue({ code: "custom", message: "This field is required" });
    return;
  }
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10) {
    ctx.addIssue({ code: "custom", message: "Invalid phone" });
  }
});

const pincodeField = z.string().superRefine((val, ctx) => {
  const v = (val ?? "").trim();
  if (!v) {
    ctx.addIssue({ code: "custom", message: "This field is required" });
    return;
  }
  if (!/^\d{6}$/.test(v)) {
    ctx.addIssue({ code: "custom", message: "Invalid pincode" });
  }
});

const admissionSchema = z.object({
  studentName: required,
  dateOfBirth: required,
  gender: required,
  classApplying: required,
  fatherName: required,
  motherName: required,
  parentEmail: emailField,
  parentPhone: phoneField,
  address: required,
  city: required,
  pincode: pincodeField,
  previousSchool: z.string().optional(),
  alternatePhone: z.string().optional(),
  parentOccupation: z.string().optional(),
  medicalConditions: z.string().optional(),
  hearAboutUs: z.string().optional(),
});

type AdmissionForm = z.infer<typeof admissionSchema>;

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function Admission() {
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ applicationNumber: string; welcome: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdmissionForm>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      studentName: "",
      dateOfBirth: "",
      gender: "",
      classApplying: "",
      fatherName: "",
      motherName: "",
      parentEmail: "",
      parentPhone: "",
      address: "",
      city: "",
      pincode: "",
      previousSchool: "",
      alternatePhone: "",
      parentOccupation: "",
      medicalConditions: "",
      hearAboutUs: "",
    },
  });

  const onSubmit = async (values: AdmissionForm) => {
    setSubmitting(true);
    const emptyToUndef = (s: string | undefined) => {
      const t = (s ?? "").trim();
      return t.length ? t : undefined;
    };
    const body = {
      studentName: values.studentName.trim(),
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      classApplying: values.classApplying,
      fatherName: values.fatherName.trim(),
      motherName: values.motherName.trim(),
      parentEmail: values.parentEmail.trim(),
      parentPhone: values.parentPhone.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      pincode: values.pincode.trim(),
      previousSchool: emptyToUndef(values.previousSchool),
      alternatePhone: emptyToUndef(values.alternatePhone),
      parentOccupation: emptyToUndef(values.parentOccupation),
      medicalConditions: emptyToUndef(values.medicalConditions),
      hearAboutUs: emptyToUndef(values.hearAboutUs),
    };
    try {
      const res = await api.post<{ application_number: string; ai_welcome_message: string }>("/api/admissions", body);
      setModal({
        applicationNumber: res.data.application_number,
        welcome: res.data.ai_welcome_message,
      });
      reset();
    } catch (e) {
      toast.error(messageFromAxiosError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Admission application</h1>
      <p className="mt-2 text-slate-600">Complete all required fields. You will receive an application number after submission.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Student name *</label>
            <input {...register("studentName")} className={inputClass} />
            <FieldError message={errors.studentName?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date of birth *</label>
            <input type="date" {...register("dateOfBirth")} className={inputClass} />
            <FieldError message={errors.dateOfBirth?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Gender *</label>
            <select {...register("gender")} className={inputClass}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <FieldError message={errors.gender?.message} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Class applying *</label>
            <select {...register("classApplying")} className={inputClass}>
              <option value="">Select class</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError message={errors.classApplying?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Father name *</label>
            <input {...register("fatherName")} className={inputClass} />
            <FieldError message={errors.fatherName?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mother name *</label>
            <input {...register("motherName")} className={inputClass} />
            <FieldError message={errors.motherName?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Parent email *</label>
            <input type="email" {...register("parentEmail")} className={inputClass} />
            <FieldError message={errors.parentEmail?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Parent phone *</label>
            <input {...register("parentPhone")} className={inputClass} />
            <FieldError message={errors.parentPhone?.message} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Address *</label>
            <textarea rows={3} {...register("address")} className={inputClass} />
            <FieldError message={errors.address?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">City *</label>
            <input {...register("city")} className={inputClass} />
            <FieldError message={errors.city?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Pincode *</label>
            <input {...register("pincode")} className={inputClass} />
            <FieldError message={errors.pincode?.message} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Previous school</label>
            <input {...register("previousSchool")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Alternate phone</label>
            <input {...register("alternatePhone")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Parent occupation</label>
            <input {...register("parentOccupation")} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Medical conditions</label>
            <textarea rows={2} {...register("medicalConditions")} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">How did you hear about us?</label>
            <input {...register("hearAboutUs")} className={inputClass} />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-brand-900 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-brand-900">Application received</h2>
            <p className="mt-2 text-sm text-slate-600">Save your application number for future reference.</p>
            <p className="mt-4 font-mono text-lg font-semibold text-slate-900">{modal.applicationNumber}</p>
            <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
              {modal.welcome}
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-900"
              onClick={() => setModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
