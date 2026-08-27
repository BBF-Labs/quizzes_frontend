"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, PartyPopper, XCircle, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/common";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import {
  LOGO_SRC,
  QUBI_WAVE_SRC,
  QUBI_STUDY_SRC,
  QUBI_RUN_SRC,
  FEATURE_PILLS,
  INSTITUTION_OPTIONS,
} from "@/lib/constants";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl") || null;

  // Onboarding Step State (1, 2, 3)
  const [step, setStep] = useState(1);

  // Step 1: User credentials
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Step 2: Study background
  const [institutionType, setInstitutionType] = useState("university");
  const [institution, setInstitution] = useState("University of Ghana");
  const [program, setProgram] = useState("BSc Computer Science");
  const [yearSemester, setYearSemester] = useState("Year 2 · Semester 1");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([
    "DCIT 201 Data Structures",
    "DCIT 205 Algorithms",
  ]);

  // Step 3: Goals
  const [mainGoal, setMainGoal] = useState("ace_exams");
  const [dailyTime, setDailyTime] = useState("1 hour — steady");
  const [examReminders, setExamReminders] = useState(true);

  // Flow State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referrerDisplayName, setReferrerDisplayName] = useState("");

  // Check ?ref= / ?referral= code
  useEffect(() => {
    const code = searchParams.get("ref") || searchParams.get("referral");
    if (!code) return;
    setReferralCode(code);
    api
      .get(`/subscriptions/referral/public-lookup/${code}`)
      .then((res) => {
        setReferrerDisplayName(res.data?.data?.displayName || "");
      })
      .catch(() => {
        setReferralCode("");
        setReferrerDisplayName("");
      });
  }, [searchParams]);

  // Realtime Email Check
  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 500);
  const isEmailCheckable = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);

  const { data: emailExists, isFetching: isEmailChecking } = useQuery({
    queryKey: ["checkEmailSignup", debouncedEmail],
    queryFn: async () => {
      const res = await api.post("/users/check", { email: debouncedEmail });
      return res.data?.data?.email?.exists ?? false;
    },
    enabled: isEmailCheckable,
    staleTime: 1000 * 60,
  });

  const emailStatus: AvailabilityStatus = !isEmailCheckable
    ? "idle"
    : isEmailChecking
      ? "checking"
      : emailExists === true
        ? "taken"
        : "available";

  const onboardingRedirect = useMemo(
    () =>
      redirectUrl
        ? `/onboarding?redirectUrl=${encodeURIComponent(redirectUrl)}`
        : "/onboarding",
    [redirectUrl],
  );

  const deriveUsername = (rawEmail: string): string => {
    const local = rawEmail
      .trim()
      .toLowerCase()
      .split("@")[0]
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24);
    return local.length > 0 ? local : "qz";
  };

  const signupMutation = useMutation({
    mutationFn: async () => {
      const name = `${firstName} ${lastName}`.trim();
      return await signup(
        name,
        email,
        deriveUsername(email),
        password,
        referralCode || undefined,
      );
    },
    onSuccess: () => {
      router.replace(onboardingRedirect);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Signup failed. Please try again.";
      setError(message);
    },
  });

  const toggleCourse = (courseName: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseName)
        ? prev.filter((c) => c !== courseName)
        : [...prev, courseName],
    );
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Please enter your first and last name.");
        return;
      }
      if (!isEmailCheckable) {
        setError("Please enter a valid email address.");
        return;
      }
      if (emailStatus === "taken") {
        setError("That email is already registered. Try logging in instead.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (!acceptedTerms) {
        setError("Please agree to the Terms and Privacy Policy.");
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (step === 2) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (step === 3) {
      signupMutation.mutate();
    }
  };

  return (
    <div className="qz-auth min-h-screen bg-white antialiased">
      {/* Top Navigation */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Qz" className="h-9 w-9 object-contain" />
            <span className="display text-lg font-bold">Qz</span>
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="hidden sm:inline">Already have an account?</span>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="soft-grid min-h-screen px-5 pb-12 pt-28 sm:pt-32">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
          {/* Left Hero Column */}
          <section className="pt-5 text-center lg:sticky lg:top-32 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm">
              <span>✦</span> Free to start · no card needed
            </div>

            {step === 1 && (
              <div>
                <h1 className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Build a study system that knows <span className="text-[#0C60FC]">you.</span>
                </h1>
                <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-600 lg:mx-0">
                  Start with the basics. Qz will shape everything else around your program, courses and goals.
                </p>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Now, <span className="text-[#0C60FC]">where do you study?</span>
                </h1>
                <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-600 lg:mx-0">
                  Your university and program let Qz map the exact syllabus, courses and exam timetable you’re working with.
                </p>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Last bit — <span className="text-[#0C60FC]">what’s the goal?</span>
                </h1>
                <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-600 lg:mx-0">
                  Tell Qz what winning looks like this semester and how much time you can realistically give it.
                </p>
              </div>
            )}

            <div className="mx-auto mt-9 max-w-md space-y-3 text-left lg:mx-0">
              {FEATURE_PILLS.map((pill) => (
                <div
                  key={pill.title}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${pill.tint}`}>
                    {pill.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold">{pill.title}</p>
                    <p className="text-[11px] text-slate-500">{pill.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Qubi Dynamic Pose Row */}
            <div className="qubi-sticker mx-auto mt-7 flex max-w-md items-end justify-center gap-3 lg:mx-0 lg:justify-start">
              <div className="relative h-28 w-28 shrink-0">
                {step === 1 && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={QUBI_WAVE_SRC}
                    alt="Qubi waving"
                    className="qubi-bob h-28 w-28 object-contain"
                  />
                )}
                {step === 2 && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={QUBI_STUDY_SRC}
                    alt="Qubi studying"
                    className="qubi-study h-28 w-28 object-contain"
                  />
                )}
                {step === 3 && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={QUBI_RUN_SRC}
                    alt="Qubi running"
                    className="qubi-run h-28 w-28 object-contain"
                  />
                )}
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-left shadow-md ring-1 ring-slate-200">
                <p className="hand text-xl leading-none text-[#0C60FC]">
                  {step === 1 && "Hey, I’m Qubi!"}
                  {step === 2 && "Nice to meet you!"}
                  {step === 3 && "Almost there!"}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  {step === 1 && "I’ll help you find your next move."}
                  {step === 2 && "Now let’s map your actual syllabus."}
                  {step === 3 && "Then I’ll build your first study plan."}
                </p>
              </div>
            </div>
          </section>

          {/* Right Interactive Onboarding Form Card */}
          <section className="card-shadow rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8 lg:p-10" style={{ borderRadius: "28px" }}>
            <div className="mb-8">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>
                  {step === 1 && "Create account"}
                  {step === 2 && "Your studies"}
                  {step === 3 && "Your goals"}
                </span>
                <span>{step} of 3</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0C60FC] transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
              <div className="mt-4 flex gap-2 text-[10px] font-bold">
                <span
                  className={`step-chip flex-1 rounded-full px-3 py-2 text-center ${
                    step >= 1 ? "bg-blue-50 text-[#0C60FC]" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  1 · Account
                </span>
                <span
                  className={`step-chip flex-1 rounded-full px-3 py-2 text-center ${
                    step >= 2 ? "bg-blue-50 text-[#0C60FC]" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  2 · Studies
                </span>
                <span
                  className={`step-chip flex-1 rounded-full px-3 py-2 text-center ${
                    step >= 3 ? "bg-blue-50 text-[#0C60FC]" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  3 · Goals
                </span>
              </div>
            </div>

            {/* Referral Discount Banner */}
            {referrerDisplayName && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-3 text-xs">
                <PartyPopper className="h-5 w-5 shrink-0 text-[#0C60FC]" />
                <div>
                  <p className="font-bold text-[#0C60FC]">Referral applied</p>
                  <p className="text-slate-600">
                    Using <span className="font-bold">{referrerDisplayName}</span>&apos;s invite — 15% off is waiting.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleNextStep}>
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold sm:text-3xl">Let’s get you set up</h2>
                  <p className="mt-2 text-sm text-slate-500">It takes less than a minute.</p>
                  
                  <div className="pt-3">
                    <GoogleSignInButton
                      referralCode={referralCode || undefined}
                      redirectOnLogin={onboardingRedirect}
                      label="Sign up with Google"
                    />
                  </div>

                  <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold">First name</span>
                      <input
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ama"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold">Last name</span>
                      <input
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Mensah"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 flex items-center justify-between text-xs font-bold">
                      <span>Email address</span>
                      <StatusPill status={emailStatus} />
                    </span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="you@email.com"
                      className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 ${
                        emailStatus === "taken"
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                          : "border-slate-200 focus:border-[#0C60FC]"
                      }`}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center justify-between text-xs font-bold">
                      <span>Create password</span>
                      <span className="font-medium text-slate-400">8+ characters</span>
                    </span>
                    <div className="relative">
                      <input
                        required
                        minLength={8}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Make it memorable"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 pr-14 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-5 text-slate-500 select-none">
                    <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                      <input
                        required
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition peer-checked:border-[#0C60FC] peer-checked:bg-[#0C60FC] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-200">
                        <svg className="hidden h-3 w-3 text-white peer-checked:block" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      </span>
                    </span>
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" className="font-bold text-slate-700 underline">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="font-bold text-slate-700 underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold sm:text-3xl">Where are you studying?</h2>
                  <p className="mt-2 text-sm text-slate-500">This is how Qz finds your exact syllabus.</p>

                  <div className="mt-7 space-y-4">
                    <div>
                      <span className="mb-2 block text-xs font-bold">Institution type</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setInstitutionType("university")}
                          className={`rounded-xl border px-2 py-3 text-center text-[11px] font-bold ${
                            institutionType === "university"
                              ? "border-[#0C60FC] bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-700"
                          }`}
                        >
                          🎓 University
                        </button>
                        <button
                          type="button"
                          onClick={() => setInstitutionType("college")}
                          className={`rounded-xl border px-2 py-3 text-center text-[11px] font-bold ${
                            institutionType === "college"
                              ? "border-[#0C60FC] bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-700"
                          }`}
                        >
                          📚 College
                        </button>
                        <button
                          type="button"
                          onClick={() => setInstitutionType("other")}
                          className={`rounded-xl border px-2 py-3 text-center text-[11px] font-bold ${
                            institutionType === "other"
                              ? "border-[#0C60FC] bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-700"
                          }`}
                        >
                          ✏️ Other
                        </button>
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold">Institution</span>
                      <select
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                      >
                        <option>University of Ghana</option>
                        <option>KNUST</option>
                        <option>University of Cape Coast</option>
                        <option>Ashesi University</option>
                        <option>GIMPA</option>
                        <option>UPSA</option>
                        <option>Other / not listed</option>
                      </select>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold">Program</span>
                        <input
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          placeholder="BSc Computer Science"
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-xs font-bold">Year &amp; semester</span>
                        <select
                          value={yearSemester}
                          onChange={(e) => setYearSemester(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                        >
                          <option>Year 1 · Semester 1</option>
                          <option>Year 1 · Semester 2</option>
                          <option>Year 2 · Semester 1</option>
                          <option>Year 2 · Semester 2</option>
                          <option>Year 3 · Semester 1</option>
                          <option>Year 4 · Semester 2</option>
                        </select>
                      </label>
                    </div>

                    <div>
                      <span className="mb-2 block text-xs font-bold">Courses this semester</span>
                      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                        {[
                          "DCIT 201 Data Structures",
                          "DCIT 205 Algorithms",
                          "DCIT 203 Digital Systems",
                          "MATH 223 Linear Algebra",
                        ].map((c) => {
                          const isSel = selectedCourses.includes(c);
                          return (
                            <button
                              type="button"
                              key={c}
                              onClick={() => toggleCourse(c)}
                              className={`rounded-full px-3 py-2 ${
                                isSel
                                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                  : "bg-white text-slate-500 ring-1 ring-slate-200"
                              }`}
                            >
                              {c} {isSel ? "✓" : "+"}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">
                        We pre-fill these from your program — you can edit them any time inside Qz.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold sm:text-3xl">What are you aiming for?</h2>
                  <p className="mt-2 text-sm text-slate-500">Qz builds your first study plan from this.</p>

                  <div className="mt-7 space-y-4">
                    <div>
                      <span className="mb-2 block text-xs font-bold">Main goal this semester</span>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[
                          { id: "ace_exams", title: "🎯 Ace my exams", body: "Exam-focused plan and mock papers" },
                          { id: "keep_up", title: "📚 Keep up week to week", body: "Steady sessions, no cramming" },
                          { id: "fix_gaps", title: "🧠 Fix weak topics", body: "Targeted practice on the gaps" },
                          { id: "study_group", title: "👋 Study with others", body: "Rooms, peers and shared streaks" },
                        ].map((g) => {
                          const isSel = mainGoal === g.id;
                          return (
                            <button
                              type="button"
                              key={g.id}
                              onClick={() => setMainGoal(g.id)}
                              className={`cursor-pointer rounded-2xl border p-4 text-left ${
                                isSel
                                  ? "border-[#0C60FC] bg-blue-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <p className={`text-sm font-bold ${isSel ? "text-blue-800" : "text-slate-900"}`}>
                                {g.title}
                              </p>
                              <p className={`mt-1 text-[11px] ${isSel ? "text-blue-700/80" : "text-slate-500"}`}>
                                {g.body}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold">Study time per day</span>
                      <select
                        value={dailyTime}
                        onChange={(e) => setDailyTime(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                      >
                        <option>30 minutes — light</option>
                        <option>1 hour — steady</option>
                        <option>2 hours — serious</option>
                        <option>3+ hours — locked in</option>
                      </select>
                    </label>

                    <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl bg-[#F7F9FC] p-4 text-[11px] leading-5 text-slate-500 select-none">
                      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={examReminders}
                          onChange={(e) => setExamReminders(e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition peer-checked:border-[#0C60FC] peer-checked:bg-[#0C60FC] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-200">
                          <svg className="hidden h-3 w-3 text-white peer-checked:block" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        </span>
                      </span>
                      <span>Send me exam reminders 7, 3 and 1 day before each paper.</span>
                    </label>
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 text-xs font-bold text-rose-600" role="alert">
                  {error}
                </p>
              )}

              {/* Navigation Actions */}
              <div className="mt-8 flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="rounded-2xl border border-slate-200 px-5 py-4 text-sm font-extrabold text-slate-600 hover:bg-slate-50"
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={signupMutation.isPending || (step === 1 && (emailStatus === "checking" || emailStatus === "taken"))}
                  className="flex-1 rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70"
                >
                  {signupMutation.isPending
                    ? "Creating my account…"
                    : step === 3
                      ? "Create my account →"
                      : "Continue →"}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-[11px] text-slate-400">
              We only use your details to personalize Qz. Your study materials stay private.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: AvailabilityStatus }) {
  if (status === "idle") return null;
  const map: Record<
    Exclude<AvailabilityStatus, "idle">,
    {
      Icon: typeof Loader2;
      label: string;
      cls: string;
    }
  > = {
    checking: {
      Icon: Loader2,
      label: "Checking…",
      cls: "text-slate-400",
    },
    available: {
      Icon: CheckCircle2,
      label: "Available",
      cls: "text-emerald-600 font-bold",
    },
    taken: {
      Icon: XCircle,
      label: "Taken",
      cls: "text-rose-600 font-bold",
    },
  };
  const { Icon, label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${cls}`}>
      <Icon className={`h-3 w-3 ${status === "checking" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="qz-auth min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#0C60FC]" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
