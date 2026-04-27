import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  FaBus,
  FaCamera,
  FaChalkboardTeacher,
  FaClinicMedical,
  FaFutbol,
  FaMusic,
  FaPalette,
  FaShieldAlt,
  FaSwimmer,
  FaVolleyballBall,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import api from "../hooks/useApi";

const HERO_BG =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600";

const aboutImg =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600";

const activityData = [
  {
    category: "Performing Arts",
    name: "Dance",
    students: 180,
    img: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1600",
    desc: "Confidence, rhythm, and stage presence through structured dance programs.",
  },
  {
    category: "Performing Arts",
    name: "Singing",
    students: 140,
    img: "https://images.unsplash.com/photo-1521334726092-b509a19597c1?w=1600",
    desc: "Vocal training, choir, and solo performance coaching for all levels.",
  },
  {
    category: "Performing Arts",
    name: "Stage Practice",
    students: 120,
    img: "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=1600",
    desc: "Drama, speech, and performance craft with guided rehearsals.",
  },
  {
    category: "Sports",
    name: "Cricket",
    students: 210,
    img: "https://images.unsplash.com/photo-1593341646782-22dba43a7538?w=1600",
    desc: "Professional coaching, fitness training, and inter-school leagues.",
  },
  {
    category: "Sports",
    name: "Swimming",
    students: 160,
    img: "https://images.unsplash.com/photo-1560090995-01632a28895b?w=1600",
    desc: "Technique-first training with safety, stamina, and confidence building.",
  },
  {
    category: "Sports",
    name: "Football",
    students: 190,
    img: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600",
    desc: "Team strategy, agility, and skill development with match exposure.",
  },
  {
    category: "Arts",
    name: "Painting",
    students: 175,
    img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600",
    desc: "Color theory, composition, and creativity through guided practice.",
  },
  {
    category: "Arts",
    name: "Art and Craft",
    students: 220,
    img: "https://images.unsplash.com/photo-1456081445129-830eb8d4bfc6?w=1600",
    desc: "Hands-on making, design thinking, and fine motor skills.",
  },
  {
    category: "Arts",
    name: "Photography",
    students: 90,
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600",
    desc: "Storytelling through lenses—composition, lighting, and editing basics.",
  },
  {
    category: "Personality Development",
    name: "Public Speaking",
    students: 200,
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600",
    desc: "Structured speaking practice to build clarity and confidence.",
  },
  {
    category: "Personality Development",
    name: "Group Discussion",
    students: 150,
    img: "https://images.unsplash.com/photo-1522071901873-411886a10004?w=1600",
    desc: "Collaborate, listen, and lead through guided discussions.",
  },
  {
    category: "Personality Development",
    name: "Communication Building",
    students: 260,
    img: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1600",
    desc: "Language, etiquette, and interpersonal skills for a global future.",
  },
  {
    category: "Personality Development",
    name: "Yoga",
    students: 240,
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600",
    desc: "Mindfulness, flexibility, and focus with age-appropriate sessions.",
  },
  {
    category: "Performing Arts",
    name: "Music Instruments",
    students: 110,
    img: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=1600",
    desc: "Keyboard, guitar, percussion—foundation to performance.",
  },
];

const feeCards = [
  { title: "Nursery", fee: 40000 },
  { title: "LKG–UKG", fee: 45000 },
  { title: "Class 1–5", fee: 52000 },
  { title: "Class 6–8", fee: 60000 },
  { title: "Class 9–10", fee: 70000 },
  { title: "PUC", fee: 82000 },
  { title: "Engineering (Integrated)", fee: 98000 },
];

const timings = [
  { grade: "Nursery–UKG", time: "8:30 AM to 12:30 PM" },
  { grade: "Class 1-5", time: "8:00 AM to 2:30 PM" },
  { grade: "Class 6-10", time: "7:45 AM to 3:30 PM" },
  { grade: "PUC & Integrated", time: "7:30 AM to 4:00 PM" },
  { grade: "Saturday (all classes)", time: "8:00 AM to 12:30 PM" },
];

const facilities = [
  { icon: FaChalkboardTeacher, label: "Smart Classrooms" },
  { icon: FaSwimmer, label: "Swimming Pool" },
  { icon: FaVolleyballBall, label: "Cricket Ground" },
  { icon: FaVolleyballBall, label: "Science Labs" },
  { icon: FaCamera, label: "Computer Lab" },
  { icon: FaPalette, label: "Library" },
  { icon: FaMusic, label: "Cafeteria" },
  { icon: FaClinicMedical, label: "Medical Room" },
  { icon: FaBus, label: "Transport" },
  { icon: FaShieldAlt, label: "CCTV Security" },
];

const faculty = [
  {
    name: "Dr. Meera Nair",
    subject: "Principal",
    qualification: "Ph.D. (Education Leadership)",
    exp: "18 years",
  },
  {
    name: "Rahul Verma",
    subject: "Mathematics",
    qualification: "M.Sc., B.Ed.",
    exp: "12 years",
  },
  {
    name: "Ananya Iyer",
    subject: "Science",
    qualification: "M.Sc., B.Ed.",
    exp: "10 years",
  },
  {
    name: "Shreya Kulkarni",
    subject: "English",
    qualification: "M.A., TESOL",
    exp: "9 years",
  },
  {
    name: "Vikram Rao",
    subject: "Physical Education",
    qualification: "M.P.Ed.",
    exp: "11 years",
  },
  {
    name: "Nandita Bose",
    subject: "Arts",
    qualification: "BFA, MFA",
    exp: "8 years",
  },
];

const testimonials = [
  { name: "Parent of Grade 4", stars: 5, text: "A warm environment with strong academics. My child loves going to school every day." },
  { name: "Parent of Grade 9", stars: 5, text: "Great balance of studies and activities. Teachers communicate clearly and proactively." },
  { name: "Alumni, 2018 Batch", stars: 4, text: "The leadership opportunities and clubs prepared me for college life." },
  { name: "Parent of Grade 2", stars: 5, text: "Excellent care in early years. The school builds confidence gently and consistently." },
  { name: "Parent of Grade 11", stars: 4, text: "Strong mentoring for board exams and career guidance. Facilities are top-notch." },
];

const galleryItems = [
  { cat: "Campus", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600" },
  { cat: "Sports", img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1600" },
  { cat: "Arts", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600" },
  { cat: "Labs", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600" },
  { cat: "Events", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600" },
  { cat: "Campus", img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600" },
  { cat: "Sports", img: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600" },
  { cat: "Arts", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600" },
];

function Section({ id, eyebrow, title, desc, children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-80px 0px -80px 0px", once: true });
  return (
    <section id={id} ref={ref} className="scroll-mt-24 py-14">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-6xl px-4"
      >
        {eyebrow && <div className="text-xs font-semibold tracking-widest text-[#f6d06f]/90">{eyebrow}</div>}
        <h2 className="mt-2 font-serif text-3xl text-white md:text-4xl">{title}</h2>
        {desc && <p className="mt-3 max-w-3xl text-slate-300">{desc}</p>}
        <div className="mt-8">{children}</div>
      </motion.div>
    </section>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={["rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur", className].join(" ")}>
      {children}
    </div>
  );
}

function seatColor(seat) {
  const ratio = seat.seats_available / Math.max(1, seat.total_seats);
  if (seat.seats_available <= 5) return { bar: "bg-red-500", text: "text-red-200", label: "Almost full" };
  if (ratio <= 0.25) return { bar: "bg-yellow-500", text: "text-yellow-200", label: "Limited" };
  return { bar: "bg-emerald-500", text: "text-emerald-200", label: "Plenty" };
}

export default function HomePage() {
  const [weather, setWeather] = useState({ loading: true, error: "", data: null });
  const [seats, setSeats] = useState({ loading: true, error: "", data: [] });
  const [filter, setFilter] = useState("All");
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightbox, setLightbox] = useState({ open: false, img: "" });

  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState({ loading: false, ok: "", error: "" });

  const visibleActivities = useMemo(() => {
    if (filter === "All") return activityData;
    return activityData.filter((a) => a.category === filter);
  }, [filter]);

  const visibleGallery = useMemo(() => {
    if (galleryFilter === "All") return galleryItems;
    return galleryItems.filter((g) => g.cat === galleryFilter);
  }, [galleryFilter]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await api.get("/weather");
        if (!alive) return;
        setWeather({ loading: false, error: "", data: res.data });
      } catch {
        if (!alive) return;
        setWeather({ loading: false, error: "Weather is unavailable right now.", data: null });
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const fetchSeats = async () => {
      try {
        const res = await api.get("/seats");
        if (!alive) return;
        setSeats({ loading: false, error: "", data: res.data || [] });
      } catch {
        if (!alive) return;
        setSeats({ loading: false, error: "Could not load seat availability right now.", data: [] });
      }
    };
    fetchSeats();
    const t = setInterval(fetchSeats, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const [testimonialIdx, setTestimonialIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 3500);
    return () => clearInterval(t);
  }, []);

  const submitContact = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: false, ok: "", error: "" });
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) {
      setContactStatus({ loading: false, ok: "", error: "Please fill all fields." });
      return;
    }
    setContactStatus({ loading: true, ok: "", error: "" });
    try {
      await api.post("/contacts", contact);
      setContact({ name: "", email: "", message: "" });
      setContactStatus({ loading: false, ok: "Message sent. We will contact you soon.", error: "" });
    } catch (err) {
      setContactStatus({
        loading: false,
        ok: "",
        error: err.response?.data?.detail || "Could not send message right now.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <Navbar />

      <section id="hero" className="relative min-h-[92vh] scroll-mt-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050914]/70 via-[#050914]/60 to-[#050914]" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 backdrop-blur">
              Bengaluru • Navy & Gold Excellence
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-5 font-serif text-4xl leading-tight md:text-6xl"
            >
              <span className="text-[#f6d06f]">Shaping Future Leaders</span>
              <span className="block text-white">at Greenwood International School</span>
            </motion.h1>
            <p className="mt-5 max-w-2xl text-slate-200/90">
              A modern school experience rooted in values—academics, arts, sports, and personality development to help students thrive.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/apply"
                className="rounded-xl bg-[#f6d06f] px-6 py-3 text-sm font-semibold text-[#0b1630] hover:brightness-110"
              >
                Apply Now
              </Link>
              <button
                type="button"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-4">
            {[
              ["2500+", "Students"],
              ["150+", "Faculty"],
              ["25", "Years Excellence"],
              ["98%", "Results"],
            ].map(([value, label]) => (
              <GlassCard key={label} className="p-5">
                <div className="text-3xl font-semibold text-[#f6d06f]">{value}</div>
                <div className="mt-1 text-sm text-slate-200/80">{label}</div>
              </GlassCard>
            ))}
          </div>

          <div className="mt-6 max-w-md">
            <GlassCard>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-widest text-slate-300">LIVE WEATHER</div>
                  <div className="mt-1 text-sm text-slate-200">Bengaluru</div>
                </div>
                {weather.loading ? (
                  <div className="text-sm text-slate-300">Loading…</div>
                ) : weather.error ? (
                  <div className="text-sm text-red-200">{weather.error}</div>
                ) : (
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-[#f6d06f]">
                      {Math.round(weather.data.temperature_c)}°C
                    </div>
                    <div className="text-xs text-slate-300">{weather.data.description}</div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section
        id="about"
        eyebrow="OUR STORY"
        title="A school built for curiosity, character, and confidence."
        desc="Greenwood International School blends academic excellence with a deeply supportive environment—so every child is seen, challenged, and celebrated."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <div className="grid gap-4 text-slate-200/90">
              <div>
                <div className="text-sm font-semibold text-[#f6d06f]">Story</div>
                <p className="mt-2 text-sm text-slate-300">
                  For 25 years, Greenwood has helped students grow into principled leaders—through strong pedagogy, global exposure, and a nurturing culture.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-semibold">Mission</div>
                  <p className="mt-2 text-sm text-slate-300">Deliver holistic education with values, innovation, and care.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-semibold">Vision</div>
                  <p className="mt-2 text-sm text-slate-300">Empower future-ready learners to thrive in a changing world.</p>
                </div>
              </div>
            </div>
          </GlassCard>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img src={aboutImg} alt="Library and learning" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </Section>

      <Section
        id="curriculum"
        eyebrow="CURRICULUM & ACTIVITIES"
        title="A balanced program across academics, arts, and sports."
        desc="Explore signature clubs and activities. Filter by category and discover what students love most."
      >
        <div className="flex flex-wrap gap-2">
          {["All", "Sports", "Arts", "Performing Arts", "Personality Development"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={[
                "rounded-full px-4 py-2 text-sm transition",
                filter === c ? "bg-[#f6d06f] text-[#0b1630]" : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleActivities.map((a) => (
            <div key={a.name} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={a.img}
                  alt={a.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/30 px-3 py-1 text-xs text-slate-100 backdrop-blur">
                  {a.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-lg font-semibold">{a.name}</div>
                  <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-200">
                    {a.students} enrolled
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-300">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="fees" eyebrow="FEES" title="Clear, transparent fee structure." desc="Choose a payment mode that works for your family.">
        <div className="grid gap-4 md:grid-cols-3">
          {feeCards.map((f) => (
            <GlassCard key={f.title}>
              <div className="text-sm text-slate-300">{f.title}</div>
              <div className="mt-2 text-3xl font-semibold text-[#f6d06f]">₹{f.fee.toLocaleString("en-IN")}</div>
              <div className="mt-1 text-xs text-slate-300">per year</div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {["Annual", "Half-yearly", "Quarterly"].map((m) => (
                  <span key={m} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-slate-200">
                    {m}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section id="timings" eyebrow="SCHOOL TIMINGS" title="Well-structured hours for every grade." desc="Consistent routines with healthy learning blocks and activity time.">
        <div className="grid gap-4 md:grid-cols-3">
          {timings.map((t) => (
            <GlassCard key={t.grade}>
              <div className="text-sm font-semibold text-white">{t.grade}</div>
              <div className="mt-2 text-sm text-slate-300">{t.time}</div>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section
        id="seats"
        eyebrow="AVAILABLE SEATS"
        title="Live seat availability (auto-refresh every 30 seconds)."
        desc="Seats update in real time based on admissions. Urgency appears when a class has fewer than 5 seats."
      >
        {seats.loading ? (
          <p className="text-slate-300">Loading seat availability…</p>
        ) : seats.error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{seats.error}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {seats.data.map((s) => {
              const style = seatColor(s);
              const filled = Math.min(100, Math.round((s.seats_booked / Math.max(1, s.total_seats)) * 100));
              return (
                <GlassCard key={s.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">{s.class_name}</div>
                      <div className="mt-1 text-sm text-slate-300">
                        {s.seats_available} available • {s.seats_booked} booked • {s.total_seats} total
                      </div>
                    </div>
                    <div className={["text-xs font-semibold", style.text].join(" ")}>{style.label}</div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={["h-2 rounded-full", style.bar].join(" ")} style={{ width: `${filled}%` }} />
                  </div>
                  {s.seats_available <= 5 && (
                    <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                      Hurry—only {s.seats_available} seats left for {s.class_name}.
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </Section>

      <Section id="facilities" eyebrow="FACILITIES" title="Everything students need to grow." desc="Modern, safe, and inspiring spaces to learn, play, and explore.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {facilities.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 text-[#f6d06f]">
                  <Icon />
                </div>
                <div className="mt-3 text-sm font-semibold text-white">{f.label}</div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="faculty" eyebrow="FACULTY" title="Experienced educators who care." desc="Six dedicated mentors guiding students with excellence and empathy.">
        <div className="grid gap-4 md:grid-cols-3">
          {faculty.map((t) => (
            <div key={t.name} className="[perspective:1000px]">
              <div className="group relative h-52 w-full transition-transform duration-500 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]">
                <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur [backface-visibility:hidden]">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#f6d06f] to-[#d4a83e]" />
                    <div>
                      <div className="text-base font-semibold">{t.name}</div>
                      <div className="text-sm text-slate-300">{t.subject}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-300">Hover to see details</div>
                </div>
                <div className="absolute inset-0 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="text-sm font-semibold text-white">{t.subject}</div>
                  <div className="mt-2 text-sm text-slate-300">{t.qualification}</div>
                  <div className="mt-2 text-sm text-slate-300">Experience: {t.exp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="testimonials" eyebrow="TESTIMONIALS" title="Families trust Greenwood." desc="Auto-sliding reviews from parents and alumni.">
        <GlassCard>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-300">Now showing</div>
            <div className="text-xs text-slate-300">
              {testimonialIdx + 1} / {testimonials.length}
            </div>
          </div>
          <div className="mt-4 min-h-[110px]">
            <motion.div key={testimonialIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-2 text-[#f6d06f]">
                {Array.from({ length: testimonials[testimonialIdx].stars }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
                {Array.from({ length: 5 - testimonials[testimonialIdx].stars }).map((_, i) => (
                  <span key={`e-${i}`} className="text-white/20">★</span>
                ))}
              </div>
              <p className="mt-3 text-lg text-white">“{testimonials[testimonialIdx].text}”</p>
              <div className="mt-2 text-sm text-slate-300">— {testimonials[testimonialIdx].name}</div>
            </motion.div>
          </div>
        </GlassCard>
      </Section>

      <Section id="gallery" eyebrow="GALLERY" title="Campus life in moments." desc="Masonry grid with lightbox and category filters.">
        <div className="flex flex-wrap gap-2">
          {["All", "Campus", "Sports", "Arts", "Labs", "Events"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setGalleryFilter(c)}
              className={[
                "rounded-full px-4 py-2 text-sm transition",
                galleryFilter === c ? "bg-[#f6d06f] text-[#0b1630]" : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-6 columns-2 gap-4 md:columns-3">
          {visibleGallery.map((g) => (
            <button
              key={g.img}
              type="button"
              className="mb-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur"
              onClick={() => setLightbox({ open: true, img: g.img })}
            >
              <img src={g.img} alt={g.cat} className="h-auto w-full object-cover" loading="lazy" />
              <div className="px-4 py-3 text-sm text-slate-200">{g.cat}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section id="contact" eyebrow="CONTACT" title="Let’s talk admissions." desc="Send a quick message and we’ll reach out.">
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <div className="text-sm text-slate-300">Address</div>
            <div className="mt-2 text-white">Greenwood Campus, Bengaluru</div>
            <div className="mt-5 text-sm text-slate-300">Phone</div>
            <div className="mt-2 text-white">+91 98765 43210</div>
            <div className="mt-5 text-sm text-slate-300">Email</div>
            <div className="mt-2 text-white">admissions@greenwoodschool.edu</div>
            <div className="mt-8">
              <Link to="/apply" className="inline-flex rounded-xl bg-[#f6d06f] px-5 py-3 text-sm font-semibold text-[#0b1630] hover:brightness-110">
                Apply Now
              </Link>
            </div>
          </GlassCard>

          <GlassCard>
            <form onSubmit={submitContact} className="grid gap-3">
              <div className="text-sm font-semibold text-white">Quick Contact Form</div>
              <input
                value={contact.name}
                onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60"
              />
              <input
                value={contact.email}
                onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
                type="email"
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60"
              />
              <textarea
                value={contact.message}
                onChange={(e) => setContact((p) => ({ ...p, message: e.target.value }))}
                placeholder="Message"
                rows={4}
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-[#f6d06f]/60"
              />
              <button
                type="submit"
                disabled={contactStatus.loading}
                className="rounded-xl bg-[#f6d06f] px-5 py-3 text-sm font-semibold text-[#0b1630] hover:brightness-110 disabled:opacity-60"
              >
                {contactStatus.loading ? "Sending…" : "Send Message"}
              </button>
              {contactStatus.ok && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{contactStatus.ok}</div>}
              {contactStatus.error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{contactStatus.error}</div>}
              <div className="text-xs text-slate-400">Your details are used only to contact you about admissions.</div>
            </form>
          </GlassCard>
        </div>
      </Section>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <div className="font-serif text-lg text-[#f6d06f]">Greenwood International School</div>
            <p className="mt-2 text-sm text-slate-300">Nurturing excellence through academics, character, and creativity.</p>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white">Quick Links</div>
            <div className="mt-3 grid gap-2 text-slate-300">
              {["about", "curriculum", "fees", "timings", "seats", "gallery", "contact"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="text-left hover:text-[#f6d06f]"
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white">Social</div>
            <div className="mt-3 flex gap-2 text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Facebook</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Instagram</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">YouTube</span>
            </div>
            <div className="mt-6 text-xs text-slate-400">© {new Date().getFullYear()} Greenwood International School.</div>
          </div>
        </div>
      </footer>

      {lightbox.open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox({ open: false, img: "" })}
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.img} alt="Gallery item" className="h-full w-full object-contain" />
            <div className="flex items-center justify-end p-3">
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                onClick={() => setLightbox({ open: false, img: "" })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
