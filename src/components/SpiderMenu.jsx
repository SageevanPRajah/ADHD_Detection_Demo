import React from "react";
import { LogIn, User, UserCog, UserPlus, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SpiderMenu = () => {
  const [active, setActive] = React.useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const legButtons = [
    {
      id: "doctor",
      labelKey: "spider.doctorLogin",
      icon: UserCog,
      accent: "bg-clinic-primary",
      position: "top-8 left-1/2 -translate-x-1/2 -translate-y-full",
      panelPosition: "left-1/2 -translate-x-1/2 top-16"
    },
    {
      id: "parent",
      labelKey: "spider.parentLogin",
      icon: User,
      accent: "bg-clinic-secondary",
      position: "left-2 top-1/2 -translate-y-1/2 -translate-x-full",
      panelPosition: "left-16 top-1/2 -translate-y-1/2"
    },
    {
      id: "guest",
      labelKey: "spider.guestLogin",
      icon: UserPlus,
      accent: "bg-clinic-accent",
      position: "bottom-8 left-1/2 -translate-x-1/2 translate-y-full",
      panelPosition: "left-1/2 -translate-x-1/2 bottom-16"
    },
    {
      id: "admin",
      labelKey: "spider.adminLogin",
      icon: Shield,
      accent: "bg-indigo-500",
      position: "right-2 top-1/2 -translate-y-1/2 translate-x-full",
      panelPosition: "right-16 top-1/2 -translate-y-1/2"
    }
  ];

  const handleLogin = (rolePath) => {
    navigate(`/${rolePath}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 md:flex-row md:items-stretch">
      {/* tagline */}
      <section className="flex-1 space-y-4">
        <p className="inline-flex rounded-full bg-clinic-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-clinic-primary">
          {t("spider.calmClinic")}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-clinic-textDark sm:text-4xl">
          {t("spider.heading")}{" "}
          <span className="text-clinic-primary">{t("spider.children")}</span> {t("spider.andFamilies")}
        </h1>

        <p className="text-sm leading-relaxed text-slate-300">
          {t("spider.tagline")}
        </p>

        <ul className="mt-2 space-y-1 text-xs text-slate-400">
          <li>• {t("spider.evidence")}</li>
          <li>• {t("spider.separateAccess")}</li>
          <li>• {t("spider.guestMode")}</li>
        </ul>
      </section>

      {/* spider */}
      <section className="mt-4 flex flex-1 items-center justify-center md:mt-0">
        <div className="relative h-[24rem] w-80 max-w-full md:h-[26rem]">
          {/* spider body */}
          <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl bg-clinic-surfaceDark shadow-2xl shadow-black/50">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              {t("spider.singlePortal")}
            </p>
            <p className="mt-1 text-4xl font-black tracking-[0.3em] text-clinic-primary">
              ADHD
            </p>
            <p className="mt-2 px-4 text-center text-[11px] text-slate-300">
              {t("spider.chooseLeg")}
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
                    {t(leg.labelKey)}
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
  const { t } = useTranslation();

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold text-clinic-primary">
        {t("spider.doctorAccess")}
      </p>
      <div className="space-y-2">
        <input
          className={fieldBase}
          placeholder={t("spider.doctorIdPlaceholder")}
        />
        <input type="password" className={fieldBase} placeholder={t("spider.password")} />
        <button
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-clinic-primary px-3 py-2 text-xs font-semibold text-white"
          onClick={() => onLogin("doctor")}
        >
          <LogIn className="h-3 w-3" /> {t("spider.login")}
        </button>
      </div>

      {/* Toggle button */}
      <button
        type="button"
        className="mt-2 w-full text-[10px] font-medium text-clinic-primary hover:underline"
        onClick={() => setShowApply((v) => !v)}
      >
        {showApply ? t("spider.hideAppForm") : t("spider.applyAsDoctor")}
      </button>

      {showApply && (
        <div className="mt-3 border-t border-slate-700 pt-2">
          <p className="mb-1 text-[11px] font-semibold text-slate-200">
            {t("spider.doctorApplication")}
          </p>
          <p className="mb-1 text-[10px] text-slate-400">
            {t("spider.doctorAppDesc")}
          </p>
          <div className="space-y-2">
            <input className={fieldBase} placeholder={t("spider.fullName")} />
            <input className={fieldBase} placeholder={t("spider.medicalCouncilId")} />
            <input type="file" className="w-full text-[10px] text-slate-300" />
            <button className="w-full rounded-lg border border-clinic-primary/60 bg-clinic-primary/10 px-3 py-2 text-[11px] font-semibold text-clinic-primary">
              {t("spider.submitApplication")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ParentLoginPanel = ({ onLogin }) => {
  const { t } = useTranslation();
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold text-clinic-secondary">
        {t("spider.parentAccess")}
      </p>
      <p className="mb-2 text-[10px] text-slate-400">
        {t("spider.parentAccessDesc")}
      </p>
      <div className="space-y-2">
        <input className={fieldBase} placeholder={t("spider.parentIdPlaceholder")} />
        <input type="password" className={fieldBase} placeholder={t("spider.password")} />
        <button
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-clinic-secondary px-3 py-2 text-xs font-semibold text-slate-900"
          onClick={() => onLogin("parent")}
        >
          <LogIn className="h-3 w-3" /> {t("spider.login")}
        </button>
      </div>
    </div>
  );
};

const GuestLoginPanel = ({ onLogin }) => {
  const [mode, setMode] = React.useState("login");
  const { t } = useTranslation();

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold text-clinic-accent">
        {mode === "login" ? t("spider.guestLoginLabel") : t("spider.guestSignupLabel")}
      </p>

      {mode === "login" ? (
        <>
          <p className="mb-2 text-[10px] text-slate-400">
            {t("spider.guestDesc")}
          </p>
          <div className="space-y-2">
            <input className={fieldBase} placeholder={t("spider.email")} />
            <input type="password" className={fieldBase} placeholder={t("spider.password")} />
            <button
              className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-clinic-accent px-3 py-2 text-xs font-semibold text-slate-900"
              onClick={() => onLogin("guest")}
            >
              <LogIn className="h-3 w-3" /> {t("spider.login")}
            </button>
          </div>
          <button
            className="mt-2 w-full text-[10px] font-medium text-clinic-accent hover:underline"
            onClick={() => setMode("signup")}
          >
            {t("spider.newHere")}
          </button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <input className={fieldBase} placeholder={t("spider.fullName")} />
            <input className={fieldBase} placeholder={t("spider.email")} />
            <input
              type="password"
              className={fieldBase}
              placeholder={t("spider.createPassword")}
            />
            <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-600 bg-slate-900/40 px-3 py-2 text-[11px] font-medium text-slate-100">
              <span className="text-lg">G</span> {t("spider.continueGoogle")}
            </button>
            <button className="w-full rounded-lg bg-clinic-accent px-3 py-2 text-xs font-semibold text-slate-900">
              {t("spider.createGuestAccount")}
            </button>
          </div>
          <button
            className="mt-2 w-full text-[10px] font-medium text-slate-300 hover:underline"
            onClick={() => setMode("login")}
          >
            {t("spider.alreadyHaveAccount")}
          </button>
        </>
      )}
    </div>
  );
};

const AdminLoginPanel = ({ onLogin }) => {
  const { t } = useTranslation();
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold text-indigo-400">
        {t("spider.adminAccess")}
      </p>
      <p className="mb-2 text-[10px] text-slate-400">
        {t("spider.adminDesc")}
      </p>
      <div className="space-y-2">
        <input className={fieldBase} placeholder={t("spider.adminEmail")} />
        <input type="password" className={fieldBase} placeholder={t("spider.password")} />
        <button
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white"
          onClick={() => onLogin("admin")}
        >
          <LogIn className="h-3 w-3" /> {t("spider.login")}
        </button>
      </div>
    </div>
  );
};

/* Main dispatcher */

const LoginPanel = ({ id, onLogin }) => {
  if (id === "doctor") return <DoctorLoginPanel onLogin={onLogin} />;
  if (id === "parent") return <ParentLoginPanel onLogin={onLogin} />;
  if (id === "guest") return <GuestLoginPanel onLogin={onLogin} />;
  return <AdminLoginPanel onLogin={onLogin} />;
};
