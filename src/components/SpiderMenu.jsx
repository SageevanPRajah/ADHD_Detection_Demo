import React from "react";
import { LogIn, User, UserCog, UserPlus, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const legButtons = [
  {
    id: "doctor",
    label: "Doctor Login",
    icon: UserCog,
    accent: "bg-clinic-primary",
    // slightly down from top, closer to center
    position: "top-8 left-1/2 -translate-x-1/2 -translate-y-full",
    // panel appears between button and center
    panelPosition: "left-1/2 -translate-x-1/2 top-16"
  },
  {
    id: "parent",
    label: "Parent Login",
    icon: User,
    accent: "bg-clinic-secondary",
    position: "left-2 top-1/2 -translate-y-1/2 -translate-x-full",
    // panel pulled towards center (to the right of button)
    panelPosition: "left-16 top-1/2 -translate-y-1/2"
  },
  {
    id: "guest",
    label: "Guest Login",
    icon: UserPlus,
    accent: "bg-clinic-accent",
    position: "bottom-8 left-1/2 -translate-x-1/2 translate-y-full",
    // panel above bottom button, towards center
    panelPosition: "left-1/2 -translate-x-1/2 bottom-16"
  },
  {
    id: "admin",
    label: "Admin Login",
    icon: Shield,
    accent: "bg-indigo-500",
    position: "right-2 top-1/2 -translate-y-1/2 translate-x-full",
    // panel pulled towards center (to the left of button)
    panelPosition: "right-16 top-1/2 -translate-y-1/2"
  }
];

const SpiderMenu = () => {
  const [active, setActive] = React.useState(null);
  const navigate = useNavigate();

  const handleLogin = (rolePath) => {
    navigate(`/${rolePath}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 md:flex-row md:items-stretch">
      {/* tagline */}
      <section className="flex-1 space-y-4">
        <p className="inline-flex rounded-full bg-clinic-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-clinic-primary">
          Calm Clinic Mode
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-clinic-textDark sm:text-4xl">
          ADHD screening hub for{" "}
          <span className="text-clinic-primary">children</span> & families.
        </h1>

        <p className="text-sm leading-relaxed text-slate-300">
          One portal for doctors, parents and admins. Start from the role that
          matches you and explore tailored dashboards, progress tracking and
          child-friendly assessments.
        </p>

        <ul className="mt-2 space-y-1 text-xs text-slate-400">
          <li>• Evidence-based screening workflow</li>
          <li>• Separate access for doctors, parents and school staff</li>
          <li>• Guest mode for demo and training</li>
        </ul>
      </section>

      {/* spider */}
      <section className="mt-4 flex flex-1 items-center justify-center md:mt-0">
        <div className="relative h-[24rem] w-80 max-w-full md:h-[26rem]">
          {/* spider body */}
          <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl bg-clinic-surfaceDark shadow-2xl shadow-black/50">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Single Portal
            </p>
            <p className="mt-1 text-4xl font-black tracking-[0.3em] text-clinic-primary">
              ADHD
            </p>
            <p className="mt-2 px-4 text-center text-[11px] text-slate-300">
              Choose a leg to continue with your role.
            </p>
          </div>

          {/* connector lines */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2">
            <div className="absolute left-1/2 top-0 h-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-clinic-primary/60 to-transparent" />
            <div className="absolute right-0 top-1/2 h-[1px] w-1/2 -translate-y-1/2 bg-gradient-to-l from-indigo-500/60 to-transparent" />
            <div className="absolute left-1/2 bottom-0 h-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-t from-clinic-accent/60 to-transparent" />
            <div className="absolute left-0 top-1/2 h-[1px] w-1/2 -translate-y-1/2 bg-gradient-to-r from-clinic-secondary/60 to-transparent" />
          </div>

          {/* legs = buttons */}
          {legButtons.map((leg) => {
            const Icon = leg.icon;
            const isActive = active === leg.id;

            return (
              <div
                key={leg.id}
                className={`absolute ${leg.position} ${
                  leg.id === "guest" ? "z-10" : "z-20"
                }`}
                onMouseEnter={() => setActive(leg.id)}
                onMouseLeave={() => setActive(null)}
              >
                {/* circle button */}
                <button
                  type="button"
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-clinic-surfaceDark text-slate-100 shadow-xl transition-transform hover:scale-105 ${leg.accent} bg-opacity-10 backdrop-blur`}
                  onClick={() => setActive(leg.id)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-slate-200">
                    {leg.label}
                  </span>
                </button>

                {/* hover panel */}
                {isActive && (
                  <div
                    className={`absolute z-30 w-64 rounded-2xl border border-slate-700 bg-clinic-surfaceDark/95 p-4 text-xs shadow-2xl shadow-black/60 ${leg.panelPosition}`}
                  >
                    <LoginPanel id={leg.id} onLogin={handleLogin} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SpiderMenu;

/* Shared field style */
const fieldBase =
  "w-full rounded-lg border border-slate-600 bg-slate-900/40 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-clinic-primary";

/* Split into sub-components so hooks are safe */

const DoctorLoginPanel = ({ onLogin }) => {
  const [showApply, setShowApply] = React.useState(false);

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold text-clinic-primary">
        Doctor Access
      </p>
      <div className="space-y-2">
        <input
          className={fieldBase}
          placeholder="Doctor ID (assigned by Admin)"
        />
        <input type="password" className={fieldBase} placeholder="Password" />
        <button
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-clinic-primary px-3 py-2 text-xs font-semibold text-white"
          onClick={() => onLogin("doctor")}
        >
          <LogIn className="h-3 w-3" /> Login
        </button>
      </div>

      {/* Toggle button */}
      <button
        type="button"
        className="mt-2 w-full text-[10px] font-medium text-clinic-primary hover:underline"
        onClick={() => setShowApply((v) => !v)}
      >
        {showApply ? "Hide application form" : "Apply as Doctor"}
      </button>

      {showApply && (
        <div className="mt-3 border-t border-slate-700 pt-2">
          <p className="mb-1 text-[11px] font-semibold text-slate-200">
            Doctor Application
          </p>
          <p className="mb-1 text-[10px] text-slate-400">
            Submit your details & registration ID. Admin will verify and create
            your Doctor ID.
          </p>
          <div className="space-y-2">
            <input className={fieldBase} placeholder="Full Name" />
            <input className={fieldBase} placeholder="Medical Council ID" />
            <input type="file" className="w-full text-[10px] text-slate-300" />
            <button className="w-full rounded-lg border border-clinic-primary/60 bg-clinic-primary/10 px-3 py-2 text-[11px] font-semibold text-clinic-primary">
              Submit Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ParentLoginPanel = ({ onLogin }) => (
  <div>
    <p className="mb-2 text-[11px] font-semibold text-clinic-secondary">
      Parent Access
    </p>
    <p className="mb-2 text-[10px] text-slate-400">
      Parent account is created by your child&apos;s doctor. Use your Parent ID
      & password.
    </p>
    <div className="space-y-2">
      <input className={fieldBase} placeholder="Parent ID" />
      <input type="password" className={fieldBase} placeholder="Password" />
      <button
        className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-clinic-secondary px-3 py-2 text-xs font-semibold text-slate-900"
        onClick={() => onLogin("parent")}
      >
        <LogIn className="h-3 w-3" /> Login
      </button>
    </div>
  </div>
);

const GuestLoginPanel = ({ onLogin }) => {
  const [mode, setMode] = React.useState("login");

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold text-clinic-accent">
        Guest {mode === "login" ? "Login" : "Signup"}
      </p>

      {mode === "login" ? (
        <>
          <p className="mb-2 text-[10px] text-slate-400">
            Explore the portal in demo mode. No child data is stored.
          </p>
          <div className="space-y-2">
            <input className={fieldBase} placeholder="Email" />
            <input type="password" className={fieldBase} placeholder="Password" />
            <button
              className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-clinic-accent px-3 py-2 text-xs font-semibold text-slate-900"
              onClick={() => onLogin("guest")}
            >
              <LogIn className="h-3 w-3" /> Login
            </button>
          </div>
          <button
            className="mt-2 w-full text-[10px] font-medium text-clinic-accent hover:underline"
            onClick={() => setMode("signup")}
          >
            New here? Register as Guest
          </button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <input className={fieldBase} placeholder="Full Name" />
            <input className={fieldBase} placeholder="Email" />
            <input
              type="password"
              className={fieldBase}
              placeholder="Create Password"
            />
            <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-600 bg-slate-900/40 px-3 py-2 text-[11px] font-medium text-slate-100">
              <span className="text-lg">G</span> Continue with Google
            </button>
            <button className="w-full rounded-lg bg-clinic-accent px-3 py-2 text-xs font-semibold text-slate-900">
              Create Guest Account
            </button>
          </div>
          <button
            className="mt-2 w-full text-[10px] font-medium text-slate-300 hover:underline"
            onClick={() => setMode("login")}
          >
            Already have an account? Login
          </button>
        </>
      )}
    </div>
  );
};

const AdminLoginPanel = ({ onLogin }) => (
  <div>
    <p className="mb-2 text-[11px] font-semibold text-indigo-400">
      Admin Access
    </p>
    <p className="mb-2 text-[10px] text-slate-400">
      Restricted to system administrators. Use your official credentials.
    </p>
    <div className="space-y-2">
      <input className={fieldBase} placeholder="Admin Email" />
      <input type="password" className={fieldBase} placeholder="Password" />
      <button
        className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white"
        onClick={() => onLogin("admin")}
      >
        <LogIn className="h-3 w-3" /> Login
      </button>
    </div>
  </div>
);

/* Main dispatcher */

const LoginPanel = ({ id, onLogin }) => {
  if (id === "doctor") return <DoctorLoginPanel onLogin={onLogin} />;
  if (id === "parent") return <ParentLoginPanel onLogin={onLogin} />;
  if (id === "guest") return <GuestLoginPanel onLogin={onLogin} />;
  return <AdminLoginPanel onLogin={onLogin} />;
};
