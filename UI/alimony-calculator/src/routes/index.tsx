import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  RotateCcw,
  IndianRupee,
  CalendarClock,
} from "lucide-react";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alimony Calculator — Estimate Monthly Alimony & Duration" },
      {
        name: "description",
        content:
          "Answer a few questions and let our advanced engine calculate a fair alimony estimate based on your case details.",
      },
      { property: "og:title", content: "Alimony Calculator" },
      {
        property: "og:description",
        content: "Formula-based estimate of monthly alimony and duration.",
      },
    ],
  }),
  component: App,
});

/* -------------------- Types & defaults -------------------- */

type FormData = {
  husbandAge: number | "";
  wifeAge: number | "";
  marriageDuration: number | "";
  numChildren: number | "";
  husbandIncome: number | "";
  wifeIncome: number | "";
  husbandAssets: number | "";
  wifeAssets: number | "";
  householdExpenses: number | "";
  husbandEducation: string;
  wifeEducation: string;
  husbandEmployment: string;
  wifeEmployment: string;
  standardOfLiving: string;
  wifeHealth: string;
  husbandHealth: string;
  wifeCareerSacrifice: boolean | null;
  custodyWith: string;
  marriageType: string;
  divorceType: string;
};

const defaultForm: FormData = {
  husbandAge: 35,
  wifeAge: 32,
  marriageDuration: 8,
  numChildren: 1,
  husbandIncome: 80000,
  wifeIncome: 25000,
  husbandAssets: 2000000,
  wifeAssets: 500000,
  householdExpenses: 40000,
  husbandEducation: "Graduate",
  wifeEducation: "Graduate",
  husbandEmployment: "Employed",
  wifeEmployment: "Homemaker",
  standardOfLiving: "Middle",
  wifeHealth: "Good",
  husbandHealth: "Good",
  wifeCareerSacrifice: false,
  custodyWith: "Wife",
  marriageType: "Arranged",
  divorceType: "Mutual Consent",
};

const STEP_NAMES = ["Basic", "Financial", "Education", "Lifestyle", "Legal", "Review"];
const TOTAL = STEP_NAMES.length;

type Screen = "hero" | "form" | "loading" | "result" | "error";

/* -------------------- Root App -------------------- */

function App() {
  const [screen, setScreen] = useState<Screen>("hero");
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(defaultForm);
  const [result, setResult] = useState<{ monthly: number, months: number } | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const start = () => {
    setStep(1);
    setData(defaultForm);
    setResult(null);
    setError(null);
    setAnimationDone(false);
    setScreen("form");
  };

  const submit = async (retries = 3) => {
    setScreen("loading");
    setError(null);
    setAnimationDone(false);
    setResult(null);

    const payload = {
      husband_age: data.husbandAge,
      wife_age: data.wifeAge,
      marriage_duration: data.marriageDuration,
      number_of_children: data.numChildren,
      husband_income: data.husbandIncome,
      wife_income: data.wifeIncome,
      husband_assets: data.husbandAssets,
      wife_assets: data.wifeAssets,
      household_expenses: data.householdExpenses,
      husband_education: data.husbandEducation,
      wife_education: data.wifeEducation,
      husband_employment: data.husbandEmployment,
      wife_employment: data.wifeEmployment,
      standard_of_living: data.standardOfLiving,
      wife_health: data.wifeHealth,
      husband_health: data.husbandHealth,
      wife_career_sacrifice: data.wifeCareerSacrifice ? "Yes" : "No",
      custody_with: data.custodyWith,
      marriage_type: data.marriageType,
      divorce_type: data.divorceType
    };

    for (let i = 0; i < retries; i++) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";
        console.log(`Attempt ${i + 1} to connect to backend at ${baseUrl}...`);
        const res = await fetch(`${baseUrl}/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`Server responded with ${res.status}`);

        const resData = await res.json();
        if (resData.status === "success") {
          setResult({
            monthly: Math.round(resData.monthly_alimony),
            months: Math.round(resData.duration_months)
          });
          return; // Success!
        } else {
          throw new Error(resData.error || "Unknown API error");
        }
      } catch (e) {
        console.error(`Attempt ${i + 1} failed:`, e);
        if (i === retries - 1) {
          setError(e instanceof Error ? e.message : "Backend connection lost");
          setScreen("error");
        } else {
          // Wait 1.5s before next retry
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }
  };

  const onLoadingDone = () => {
    setAnimationDone(true);
  };

  useEffect(() => {
    if (animationDone && result && screen === "loading") {
      setScreen("result");
    }
  }, [animationDone, result, screen]);

  const reset = () => {
    setScreen("hero");
    setStep(1);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-foreground">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      {/* floating orbs */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-[float-slow_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-400/5 blur-3xl animate-[float-slow_10s_ease-in-out_infinite]" />

      <Navbar screen={screen} step={step} />

      <main className="relative z-10 flex h-[100svh] items-center justify-center px-4 pt-16 pb-6">
        <AnimatePresence mode="wait">
          {screen === "hero" && <Hero key="hero" onStart={start} />}
          {screen === "form" && (
            <FormFlow
              key="form"
              step={step}
              setStep={setStep}
              data={data}
              set={set}
              onBackToHero={() => setScreen("hero")}
              onSubmit={submit}
            />
          )}
          {screen === "loading" && <LoadingView key="loading" onDone={onLoadingDone} />}
          {screen === "result" && <ResultView key="result" onReset={reset} prediction={result} />}
          {screen === "error" && <ErrorView key="error" message={error || ""} onRetry={() => submit()} onBack={() => setScreen("form")} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* -------------------- Navbar -------------------- */

function Navbar({ screen, step }: { screen: Screen; step: number }) {
  const progress =
    screen === "hero" ? 0 : screen === "form" ? (step / TOTAL) * 100 : 100;

  return (
    <header className="glass-nav fixed top-0 left-0 right-0 z-30">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <Scale className="h-4 w-4 text-primary" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Alimony <span className="text-primary">Calculator</span>
          </span>
        </div>

        {/* center step dots — only meaningful during form */}
        <div className="hidden md:flex items-center gap-3">
          {STEP_NAMES.map((name, i) => {
            const idx = i + 1;
            const active = screen === "form" && step === idx;
            const done =
              (screen === "form" && step > idx) ||
              screen === "loading" ||
              screen === "result";
            return (
              <div key={name} className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all ${active
                    ? "bg-primary w-6 shadow-[0_0_8px_var(--primary)]"
                    : done
                      ? "bg-primary/70"
                      : "bg-white/15"
                    }`}
                />
                <span
                  className={`text-[11px] font-medium transition-colors ${active
                    ? "text-foreground"
                    : done
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60"
                    }`}
                >
                  {name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          Calculation Engine
        </div>
      </div>
      {/* progress bar */}
      <div className="h-[2px] w-full bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-primary/80 to-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </header>
  );
}

/* -------------------- Hero -------------------- */

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl text-center"
    >
      <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-3xl bg-primary/15 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl glass-strong glow-soft animate-[float-slow_5s_ease-in-out_infinite]">
          <Scale className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
        Know Your <span className="gold-text">Alimony Estimate</span>
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed">
        Answer a few questions and let our engine calculate a fair estimate based on your
        case details.
      </p>

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground glow-primary"
      >
        Get Started <ArrowRight className="h-4 w-4" />
      </motion.button>

      <p className="mt-5 text-xs text-muted-foreground/80">
        Private · Takes ~2 minutes · No signup
      </p>
    </motion.section>
  );
}

/* -------------------- Form Flow -------------------- */

function FormFlow({
  step,
  setStep,
  data,
  set,
  onBackToHero,
  onSubmit,
}: {
  step: number;
  setStep: (n: number) => void;
  data: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  onBackToHero: () => void;
  onSubmit: () => void;
}) {
  const isLast = step === TOTAL;

  const [showAgeError, setShowAgeError] = useState(false);

  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        const valid = (
          data.husbandAge !== "" && data.husbandAge >= 18 &&
          data.wifeAge !== "" && data.wifeAge >= 18 &&
          data.marriageDuration !== "" &&
          data.numChildren !== ""
        );
        return valid;
      case 2:
        return data.husbandIncome !== "" && data.wifeIncome !== "" && data.husbandAssets !== "" && data.wifeAssets !== "" && data.householdExpenses !== "";
      case 3:
        return !!data.husbandEducation && !!data.wifeEducation && !!data.husbandEmployment && !!data.wifeEmployment;
      case 4:
        return !!data.standardOfLiving && !!data.wifeHealth && !!data.husbandHealth && data.wifeCareerSacrifice !== null;
      case 5:
        return !!data.custodyWith && !!data.marriageType && !!data.divorceType;
      case 6:
        return true;
      default:
        return false;
    }
  }, [step, data]);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-[600px]"
    >
      <div className="glass-strong glow-soft rounded-3xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary/80">
              {STEP_NAMES[step - 1]}
            </p>
            <h2 className="mt-1 text-2xl sm:text-[26px] font-bold tracking-tight">
              {stepTitle(step)}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            Step {step} of {TOTAL}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="min-h-[280px]"
          >
            {step === 1 && <StepBasic data={data} set={set} showError={showAgeError} />}
            {step === 2 && <StepFinancial data={data} set={set} />}
            {step === 3 && <StepEducation data={data} set={set} />}
            {step === 4 && <StepLifestyle data={data} set={set} />}
            {step === 5 && <StepLegal data={data} set={set} />}
            {step === 6 && <StepReview data={data} />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            onClick={() => (step === 1 ? onBackToHero() : setStep(step - 1))}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (step === 1 && !canNext) {
                setShowAgeError(true);
                return;
              }
              if (canNext) {
                setShowAgeError(false);
                isLast ? onSubmit() : setStep(step + 1);
              }
            }}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${canNext
              ? "bg-primary text-primary-foreground glow-primary"
              : "bg-primary/40 text-primary-foreground/60 border border-primary/20"
              }`}
          >
            {isLast ? "Submit" : "Next"} <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}

function stepTitle(step: number) {
  return [
    "Basic Information",
    "Financial Details",
    "Education & Employment",
    "Health & Lifestyle",
    "Marriage & Legal",
    "Review Your Answers",
  ][step - 1];
}

/* -------------------- Field primitives -------------------- */

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumInput({
  value,
  onChange,
  prefix,
  min,
}: {
  value: number | "";
  onChange: (n: number | "") => void;
  prefix?: string;
  min?: number;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-primary/80">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? "" : Number(val));
        }}
        min={min ?? 0}
        placeholder="0"
        className={`no-spinner w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 ${prefix ? "pl-8 pr-3" : "px-3.5"
          }`}
      />
    </div>
  );
}

function Pills({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${active
              ? "bg-primary text-primary-foreground glow-primary"
              : "border border-white/12 bg-white/5 text-foreground/85 hover:bg-white/10"
              }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/5 p-1">
      {[
        { label: "Yes", v: true },
        { label: "No", v: false },
      ].map(({ label, v }) => {
        const active = value === v;
        return (
          <button
            key={label}
            onClick={() => onChange(v)}
            className="relative px-5 py-1.5 text-sm font-medium"
          >
            {active && (
              <motion.span
                layoutId="toggle-pill"
                className="absolute inset-0 rounded-full bg-primary glow-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative ${active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------- Steps -------------------- */

type SP = {
  data: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
};

function StepBasic({ data, set, showError }: SP & { showError?: boolean }) {
  const husbandInvalid = data.husbandAge !== "" && data.husbandAge < 18;
  const wifeInvalid = data.wifeAge !== "" && data.wifeAge < 18;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <Field label="Husband Age (Min 18)">
          <NumInput value={data.husbandAge} onChange={(v) => set("husbandAge", v)} min={18} />
        </Field>
        {(showError || husbandInvalid) && husbandInvalid && (
          <p className="text-[10px] text-red-400 font-medium animate-pulse">
            ⚠️ Minimum age must be 18
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Field label="Wife Age (Min 18)">
          <NumInput value={data.wifeAge} onChange={(v) => set("wifeAge", v)} min={18} />
        </Field>
        {(showError || wifeInvalid) && wifeInvalid && (
          <p className="text-[10px] text-red-400 font-medium animate-pulse">
            ⚠️ Minimum age must be 18
          </p>
        )}
      </div>

      <Field label="Marriage Duration (Years)">
        <NumInput
          value={data.marriageDuration}
          onChange={(v) => set("marriageDuration", v)}
        />
      </Field>
      <Field label="Number of Children">
        <NumInput value={data.numChildren} onChange={(v) => set("numChildren", v)} />
      </Field>
    </div>
  );
}

function StepFinancial({ data, set }: SP) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Husband Monthly Income">
        <NumInput prefix="₹" value={data.husbandIncome} onChange={(v) => set("husbandIncome", v)} />
      </Field>
      <Field label="Wife Monthly Income">
        <NumInput prefix="₹" value={data.wifeIncome} onChange={(v) => set("wifeIncome", v)} />
      </Field>
      <Field label="Husband Total Assets">
        <NumInput prefix="₹" value={data.husbandAssets} onChange={(v) => set("husbandAssets", v)} />
      </Field>
      <Field label="Wife Total Assets">
        <NumInput prefix="₹" value={data.wifeAssets} onChange={(v) => set("wifeAssets", v)} />
      </Field>
      <Field label="Monthly Household Expenses" full>
        <NumInput
          prefix="₹"
          value={data.householdExpenses}
          onChange={(v) => set("householdExpenses", v)}
        />
      </Field>
    </div>
  );
}

function StepEducation({ data, set }: SP) {
  return (
    <div className="space-y-5">
      <Field label="Husband Education">
        <Pills
          value={data.husbandEducation}
          onChange={(v) => set("husbandEducation", v)}
          options={["12th Pass", "Graduate", "Postgraduate"]}
        />
      </Field>
      <Field label="Wife Education">
        <Pills
          value={data.wifeEducation}
          onChange={(v) => set("wifeEducation", v)}
          options={["12th Pass", "Graduate", "Postgraduate"]}
        />
      </Field>
      <Field label="Husband Employment">
        <Pills
          value={data.husbandEmployment}
          onChange={(v) => set("husbandEmployment", v)}
          options={["Employed", "Self-Employed", "Unemployed", "Business"]}
        />
      </Field>
      <Field label="Wife Employment">
        <Pills
          value={data.wifeEmployment}
          onChange={(v) => set("wifeEmployment", v)}
          options={["Employed", "Unemployed", "Homemaker", "Self-Employed"]}
        />
      </Field>
    </div>
  );
}

function StepLifestyle({ data, set }: SP) {
  return (
    <div className="space-y-5">
      <Field label="Standard of Living">
        <Pills
          value={data.standardOfLiving}
          onChange={(v) => set("standardOfLiving", v)}
          options={["Low", "Middle", "Upper-Middle", "High"]}
        />
      </Field>
      <Field label="Wife Health Condition">
        <Pills
          value={data.wifeHealth}
          onChange={(v) => set("wifeHealth", v)}
          options={["Good", "Moderate", "Poor"]}
        />
      </Field>
      <Field label="Husband Health Condition">
        <Pills
          value={data.husbandHealth}
          onChange={(v) => set("husbandHealth", v)}
          options={["Good", "Moderate", "Poor"]}
        />
      </Field>
      <Field label="Wife Career Sacrifice">
        <Toggle
          value={data.wifeCareerSacrifice}
          onChange={(v) => set("wifeCareerSacrifice", v)}
        />
      </Field>
    </div>
  );
}

function StepLegal({ data, set }: SP) {
  return (
    <div className="space-y-5">
      <Field label="Custody With">
        <Pills
          value={data.custodyWith}
          onChange={(v) => set("custodyWith", v)}
          options={["Wife", "Husband", "Shared"]}
        />
      </Field>
      <Field label="Marriage Type">
        <Pills
          value={data.marriageType}
          onChange={(v) => set("marriageType", v)}
          options={["Arranged", "Love", "Court Marriage"]}
        />
      </Field>
      <Field label="Divorce Type">
        <Pills
          value={data.divorceType}
          onChange={(v) => set("divorceType", v)}
          options={["Mutual Consent", "Contested"]}
        />
      </Field>
    </div>
  );
}

function StepReview({ data }: { data: FormData }) {
  return (
    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 gap-4">
          <span className="text-muted-foreground capitalize shrink-0">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
          <span className={`font-semibold text-right ${v === "" || v === null ? "text-red-400/80 italic" : "text-foreground"}`}>
            {v === true ? "Yes" : v === false ? "No" : v === "" || v === null ? "Not Selected" : v.toString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/* -------------------- Loading & Result -------------------- */

const MEMES = [
  { image: "/memes/meme1.jpg", text: "Almost there.. 🏃‍♂️💨" },
  { image: "/memes/meme2.jpg", text: "Bhai yahan pe Kya ho rha hai 😳🤯" },
  { image: "/memes/meme3.jpg", text: "Bss 2 Minute ⏳😤" },
  { image: "/memes/meme4.jpg", text: "Raha nahi jata tadap hi esi hai 😩🥺" },
  { image: "/memes/meme5.jpg", text: "Bhai ye to Koi response hi nahi de rha 😑💀" },
  { image: "/memes/meme6.jpg", text: "Ruko Jara, Sabar karo ✋😌" },
  { image: "/memes/meme7.jpg", text: "Aaj mood nahi kar raha, isse kal dekhte hai 🛌😴" },
  { image: "/memes/meme8.png", text: "Aa Rha hu Bhen 😡" },
];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function LoadingView({ onDone }: { onDone: () => void }) {
  const memes = useMemo(() => shuffled(MEMES).slice(0, 4), []);

  const [memeIndex, setMemeIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const holdTimer = setTimeout(() => {
      setVisible(false);
      const nextTimer = setTimeout(() => {
        const next = memeIndex + 1;
        if (next >= memes.length) {
          setDone(true);
          onDone();
        } else {
          setMemeIndex(next);
          setVisible(true);
        }
      }, 400);
      return () => clearTimeout(nextTimer);
    }, 2800);

    return () => clearTimeout(holdTimer);
  }, [memeIndex, visible, done, memes, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6 text-center"
    >
      {/* Meme image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={memeIndex}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{
            opacity: visible ? 1 : 0,
            scale: visible ? 1 : 0.9,
            y: visible ? 0 : -10,
          }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary/10">
            <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            <img
              src={memes[memeIndex].image}
              alt={memes[memeIndex].text}
              className="h-64 w-96 sm:h-80 sm:w-[32rem] object-contain bg-black/40"
              draggable={false}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Meme text with emoji */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`text-${memeIndex}`}
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{
            opacity: visible ? 1 : 0,
            y: visible ? 0 : -14,
            filter: visible ? "blur(0px)" : "blur(4px)",
          }}
          exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-lg text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight"
        >
          {memes[memeIndex].text}
        </motion.p>
      </AnimatePresence>

      {/* Spinner */}
      <div className="relative flex items-center justify-center mt-4">
        <span className="absolute h-28 w-28 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <Loader2 className="relative h-16 w-16 animate-spin text-primary" strokeWidth={2.5} />
      </div>

      <p className="text-xs text-muted-foreground/50 tracking-widest uppercase mt-4">
        Crunching numbers…
      </p>
    </motion.div>
  );
}

function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function ResultView({ onReset, prediction }: { onReset: () => void, prediction: { monthly: number, months: number } | null }) {
  // Use predicted values from backend, fallback to placeholders if api fails
  const monthly = prediction?.monthly ?? 32500;
  const months = prediction?.months ?? 18;

  const monthlyAnim = useCountUp(monthly);
  const monthsAnim = useCountUp(months, 1200);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const fire = (originX: number) =>
      confetti({
        particleCount: 70,
        spread: 70,
        startVelocity: 38,
        origin: { x: originX, y: 0.4 },
        colors: ["#E5C46B", "#F5D67A", "#94A3B8", "#FFFFFF"],
        ticks: 200,
        scalar: 0.9,
      });
    setTimeout(() => fire(0.3), 100);
    setTimeout(() => fire(0.7), 250);
  }, []);

  const monthlyFormatted = useMemo(
    () => `₹${monthlyAnim.toLocaleString("en-IN")}`,
    [monthlyAnim]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-3xl text-center"
    >
      <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary mb-4">
        <Sparkles className="h-3 w-3" /> Estimate ready
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Your <span className="gold-text">Estimate</span>
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Based on the details you provided.
      </p>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Monthly Alimony"
          value={monthlyFormatted}
          sub="per month"
        />
        <ResultCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Duration"
          value={`${monthsAnim}`}
          sub="months"
        />
      </div>

      <p className="mt-6 text-xs text-muted-foreground/80 max-w-md mx-auto">
        This is an ML-based estimate. Actual court decisions may vary.
      </p>

      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground glow-primary"
      >
        <RotateCcw className="h-4 w-4" /> Calculate Again
      </motion.button>
    </motion.section>
  );
}

function ResultCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-strong glow-soft relative overflow-hidden rounded-2xl p-7 text-left"
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
      <div className="relative">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
          {icon}
        </div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
          {label}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight gold-text tabular-nums">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </div>
    </motion.div>
  );
}

/* -------------------- Error View -------------------- */

function ErrorView({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      onRetry();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onRetry]);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md text-center"
    >
      <div className="glass-strong glow-soft rounded-3xl p-8 border border-red-500/20">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <RotateCcw className="h-10 w-10 animate-[spin_3s_linear_infinite]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Backend Disconnected</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {message}. We're trying to reconnect to the calculation engine automatically.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground glow-primary"
          >
            Retry Now ({countdown}s)
          </button>
          <button
            onClick={onBack}
            className="w-full rounded-full border border-white/10 bg-white/5 py-3 text-sm font-medium text-foreground hover:bg-white/10 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </motion.section>
  );
}
