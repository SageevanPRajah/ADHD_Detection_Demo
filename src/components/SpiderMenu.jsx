import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { LogIn, User, UserCog, UserPlus, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { AuthEndPoint } from "../utils/ApiRequest.js";
import { useAuth } from "../hooks/useAuth.js";

const fieldBase =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-clinic-primary/50 focus:bg-white/10 transition-all";

const SpiderMenu = () => {
  const [active, setActive] = React.useState(null);
  const [loginError, setLoginError] = React.useState("");
  const menuRef = React.useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();
  const roleRoutes = {
    ADMIN: "/admin",
    DOCTOR: "/doctor",
    PATIENT_PARENT: "/parent",
    GUEST: "/guest",
  };

  const handleAuthSuccess = (response, fallbackPath) => {
    login(response.access_token, response.user, true);
    const nextPath = roleRoutes[response?.user?.role] || fallbackPath;
    navigate(nextPath);
    setActive(null);
    setLoginError("");
  };

  const handleAdminLogin = async (payload) => {
    try {
      setLoginError("");
      const { data } = await axios.post(`${AuthEndPoint}/admin/login`, payload);
      handleAuthSuccess(data, "/admin");
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Login failed";
      setLoginError(errorMsg);
      console.error("Admin login error:", err);
    }
  };

  const handleDoctorLogin = async (payload) => {
    try {
      setLoginError("");
      const { data } = await axios.post(`${AuthEndPoint}/doctor/login`, payload);
      handleAuthSuccess(data, "/doctor");
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Login failed";
      setLoginError(errorMsg);
      console.error("Doctor login error:", err);
    }
  };

  const handleParentLogin = async (payload) => {
    try {
      setLoginError("");
      const { data } = await axios.post(`${AuthEndPoint}/parent/login`, payload);
      handleAuthSuccess(data, "/parent");
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Login failed";
      setLoginError(errorMsg);
      console.error("Parent login error:", err);
    }
  };

  const handleGuestGoogle = async (credential) => {
    try {
      setLoginError("");
      const { data } = await axios.post(`${AuthEndPoint}/guest/google`, { credential });
      handleAuthSuccess(data, "/guest");
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Google login failed";
      setLoginError(errorMsg);
      console.error("Google login error:", err);
    }
  };

  const handleDoctorRequest = async (payload) => {
    try {
      setLoginError("");
      await axios.post(`${AuthEndPoint}/doctor/request`, {
        full_name: payload.full_name,
        medical_council_id: payload.medical_council_id,
        specialization: payload.specialization,
        hospital: payload.hospital,
        phone_number: payload.phone_number,
        notes: payload.notes || null,
      });
      setLoginError("");
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Request failed";
      setLoginError(errorMsg);
      console.error("Doctor request error:", err);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActive(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const legButtons = [
    {
      id: "doctor",
      labelKey: "spider.doctorLogin",
      icon: UserCog,
      accent: "bg-clinic-primary",
      position: "top-8 left-1/2 -translate-x-1/2 -translate-y-full",
      panelPosition: "left-1/2 -translate-x-1/2 top-16",
    },
    {
      id: "parent",
      labelKey: "spider.parentLogin",
      icon: User,
      accent: "bg-clinic-secondary",
      position: "left-2 top-1/2 -translate-y-1/2 -translate-x-full",
      panelPosition: "left-16 top-1/2 -translate-y-1/2",
    },
    {
      id: "guest",
      labelKey: "spider.guestLogin",
      icon: UserPlus,
      accent: "bg-clinic-accent",
      position: "bottom-8 left-1/2 -translate-x-1/2 translate-y-full",
      panelPosition: "left-1/2 -translate-x-1/2 bottom-16",
    },
    {
      id: "admin",
      labelKey: "spider.adminLogin",
      icon: Shield,
      accent: "bg-indigo-500",
      position: "right-2 top-1/2 -translate-y-1/2 translate-x-full",
      panelPosition: "right-16 top-1/2 -translate-y-1/2",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 md:flex-row md:items-stretch">
      <section className="flex-1 space-y-4">
        <p className="inline-flex rounded-full bg-clinic-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-clinic-primary">
          {t("spider.calmClinic")}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-clinic-textDark sm:text-4xl">
          {t("spider.heading")} <span className="text-clinic-primary">{t("spider.children")}</span> {t("spider.andFamilies")}
        </h1>

        <p className="text-sm leading-relaxed text-slate-300">{t("spider.tagline")}</p>

        <ul className="mt-2 space-y-1 text-xs text-slate-400">
          <li>• {t("spider.evidence")}</li>
          <li>• {t("spider.separateAccess")}</li>
          <li>• {t("spider.guestMode")}</li>
        </ul>
      </section>

      <section className="mt-4 flex flex-1 items-center justify-center md:mt-0">
        <div ref={menuRef} className="relative h-[24rem] w-80 max-w-full md:h-[26rem]">
          <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl bg-clinic-surfaceDark shadow-2xl shadow-black/50">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{t("spider.singlePortal")}</p>
            <p className="mt-1 text-4xl font-black tracking-[0.3em] text-clinic-primary">ADHD</p>
            <p className="mt-2 px-4 text-center text-[11px] text-slate-300">{t("spider.chooseLeg")}</p>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2">
            <div className="absolute left-1/2 top-0 h-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-clinic-primary/60 to-transparent" />
            <div className="absolute right-0 top-1/2 h-[1px] w-1/2 -translate-y-1/2 bg-gradient-to-l from-indigo-500/60 to-transparent" />
            <div className="absolute left-1/2 bottom-0 h-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-t from-clinic-accent/60 to-transparent" />
            <div className="absolute left-0 top-1/2 h-[1px] w-1/2 -translate-y-1/2 bg-gradient-to-r from-clinic-secondary/60 to-transparent" />
          </div>

          {legButtons.map((leg) => {
            const Icon = leg.icon;
            const isActive = active === leg.id;

            return (
              <div
                key={leg.id}
                className={`absolute ${leg.position} ${leg.id === "guest" ? "z-10" : "z-20"}`}
              >
                <button
                  type="button"
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-clinic-surfaceDark text-slate-100 shadow-xl transition-transform hover:scale-105 ${leg.accent} bg-opacity-10 backdrop-blur`}
                  onClick={() => setActive((current) => (current === leg.id ? null : leg.id))}
                >
                  <Icon className="h-6 w-6" />
                  <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-slate-200">
                    {t(leg.labelKey)}
                  </span>
                </button>

                {isActive && (
                  <div className={`absolute z-30 w-80 rounded-3xl border border-white/10 bg-black/60 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl ${leg.panelPosition}`}>
                    <LoginPanel
                      id={leg.id}
                      onAdminLogin={handleAdminLogin}
                      onDoctorLogin={handleDoctorLogin}
                      onDoctorRequest={handleDoctorRequest}
                      onParentLogin={handleParentLogin}
                      onGuestGoogle={handleGuestGoogle}
                      globalError={loginError}
                      setGlobalError={setLoginError}
                    />
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

const DoctorLoginPanel = ({ onDoctorLogin, onDoctorRequest, globalError, setGlobalError }) => {
  const { t } = useTranslation();
  const [medicalCouncilId, setMedicalCouncilId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showApply, setShowApply] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    full_name: "",
    medical_council_id: "",
    specialization: "",
    hospital: "",
    phone_number: "",
    notes: "",
  });

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setGlobalError("");
    try {
      await onDoctorLogin({ medical_council_id: medicalCouncilId, password });
    } catch (submitError) {
      setError(submitError?.response?.data?.detail || "Login failed");
    }
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setGlobalError("");
    try {
      await onDoctorRequest(form);
      setMessage("Application submitted. Please wait for admin approval.");
      setForm({
        full_name: "",
        medical_council_id: "",
        specialization: "",
        hospital: "",
        phone_number: "",
        notes: "",
      });
    } catch (submitError) {
      setError(submitError?.response?.data?.detail || "Application failed");
    }
  };

  const displayLoginError = globalError || error;

  return (
    <div>
      <p className="mb-4 flex items-center gap-2 text-xs font-bold text-clinic-primary">
        <UserCog className="w-4 h-4" /> {t("spider.doctorAccess")}
      </p>

      <form className="space-y-3" onSubmit={submitLogin}>
        <input className={fieldBase} value={medicalCouncilId} onChange={(event) => setMedicalCouncilId(event.target.value)} placeholder={t("spider.doctorIdPlaceholder")} />
        <input type="password" className={fieldBase} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("spider.password")} />
        {displayLoginError && <p className="text-[11px] text-red-300">{displayLoginError}</p>}
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-clinic-primary px-4 py-2.5 text-xs font-bold text-slate-900 shadow-lg shadow-clinic-primary/20 transition-all hover:bg-white hover:text-clinic-primary">
          <LogIn className="h-4 w-4" /> {t("spider.login")}
        </button>
      </form>

      <button type="button" className="mt-3 w-full text-[10px] font-medium text-clinic-primary hover:underline" onClick={() => setShowApply((value) => !value)}>
        {showApply ? t("spider.hideAppForm") : t("spider.applyAsDoctor")}
      </button>

      {showApply && (
        <form className="mt-3 space-y-2 border-t border-slate-700 pt-3" onSubmit={submitApplication}>
          <p className="mb-1 text-[11px] font-semibold text-slate-200">{t("spider.doctorApplication")}</p>
          <input className={fieldBase} value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} placeholder={t("spider.fullName")} />
          <input className={fieldBase} value={form.medical_council_id} onChange={(event) => setForm((current) => ({ ...current, medical_council_id: event.target.value }))} placeholder={t("spider.medicalCouncilId")} />
          <input className={fieldBase} value={form.specialization} onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))} placeholder="Specialization" />
          <input className={fieldBase} value={form.hospital} onChange={(event) => setForm((current) => ({ ...current, hospital: event.target.value }))} placeholder="Hospital / Clinic" />
          <input className={fieldBase} value={form.phone_number} onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))} placeholder="Phone number" />
          <textarea className={fieldBase} rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes (optional)" />
          {message && <p className="text-[11px] text-emerald-300">{message}</p>}
          {error && <p className="text-[11px] text-red-300">{error}</p>}
          <button className="w-full rounded-lg border border-clinic-primary/60 bg-clinic-primary/10 px-3 py-2 text-[11px] font-semibold text-clinic-primary transition-colors hover:bg-clinic-primary/20">
            {t("spider.submitApplication")}
          </button>
        </form>
      )}
    </div>
  );
};

const ParentLoginPanel = ({ onParentLogin, globalError, setGlobalError }) => {
  const { t } = useTranslation();
  const [parentId, setParentId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setGlobalError("");

    try {
      await onParentLogin({ parent_id: parentId, password });
    } catch (submitError) {
      setError(submitError?.response?.data?.detail || "Login failed");
    }
  };

  const displayError = globalError || error;

  return (
    <div>
      <p className="mb-1 flex items-center gap-2 text-xs font-bold text-clinic-secondary">
        <User className="w-4 h-4" /> {t("spider.parentAccess")}
      </p>
      <p className="mb-4 text-[10px] text-slate-400">{t("spider.parentAccessDesc")}</p>
      <form className="space-y-3" onSubmit={submitLogin}>
        <input className={fieldBase} value={parentId} onChange={(event) => setParentId(event.target.value)} placeholder={t("spider.parentIdPlaceholder")} />
        <input type="password" className={fieldBase} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("spider.password")} />
        {displayError && <p className="text-[11px] text-red-300">{displayError}</p>}
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-clinic-secondary px-4 py-2.5 text-xs font-bold text-slate-900 shadow-lg shadow-clinic-secondary/20 transition-all hover:bg-white hover:text-clinic-secondary">
          <LogIn className="h-4 w-4" /> {t("spider.login")}
        </button>
      </form>
    </div>
  );
};

const GuestLoginPanel = ({ onGuestGoogle, globalError, setGlobalError }) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState("");

  return (
    <div>
      <p className="mb-1 flex items-center gap-2 text-xs font-bold text-clinic-accent">
        <UserPlus className="w-4 h-4" /> {t("spider.guestLoginLabel")}
      </p>
      <p className="mb-4 text-[10px] text-slate-400">{t("spider.guestDesc")}</p>

      <div className="space-y-3">
        <div className="rounded-xl bg-white/5 p-3">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                setError("");
                setGlobalError("");
                if (!credentialResponse?.credential) {
                  throw new Error("Missing Google credential");
                }
                await onGuestGoogle(credentialResponse.credential);
              } catch (guestError) {
                setError(guestError?.response?.data?.detail || "Login failed");
              }
            }}
            onError={() => setError("Login failed")}
            useOneTap={false}
          />
        </div>
        {(globalError || error) && <p className="text-[11px] text-red-300">{globalError || error}</p>}
      </div>
    </div>
  );
};

const AdminLoginPanel = ({ onAdminLogin, globalError, setGlobalError }) => {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setGlobalError("");

    try {
      await onAdminLogin({ email, password });
    } catch (submitError) {
      setError(submitError?.response?.data?.detail || "Login failed");
    }
  };

  const displayError = globalError || error;

  return (
    <div>
      <p className="mb-1 flex items-center gap-2 text-xs font-bold text-indigo-400">
        <Shield className="w-4 h-4" /> {t("spider.adminAccess")}
      </p>
      <p className="mb-4 text-[10px] text-slate-400">{t("spider.adminDesc")}</p>
      <form className="space-y-3" onSubmit={submitLogin}>
        <input className={fieldBase} value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("spider.adminEmail")} />
        <input type="password" className={fieldBase} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("spider.password")} />
        {displayError && <p className="text-[11px] text-red-300">{displayError}</p>}
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-white hover:text-indigo-600">
          <LogIn className="h-4 w-4" /> {t("spider.login")}
        </button>
      </form>
    </div>
  );
};

const LoginPanel = ({
  id,
  onAdminLogin,
  onDoctorLogin,
  onDoctorRequest,
  onParentLogin,
  onGuestGoogle,
  globalError,
  setGlobalError,
}) => {
  if (id === "doctor") {
    return <DoctorLoginPanel onDoctorLogin={onDoctorLogin} onDoctorRequest={onDoctorRequest} globalError={globalError} setGlobalError={setGlobalError} />;
  }

  if (id === "parent") {
    return <ParentLoginPanel onParentLogin={onParentLogin} globalError={globalError} setGlobalError={setGlobalError} />;
  }

  if (id === "guest") {
    return <GuestLoginPanel onGuestGoogle={onGuestGoogle} globalError={globalError} setGlobalError={setGlobalError} />;
  }

  return <AdminLoginPanel onAdminLogin={onAdminLogin} globalError={globalError} setGlobalError={setGlobalError} />;
};

export default SpiderMenu;
