import React from "react";
import { Brain, Menu, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useAuth } from "../hooks/useAuth.js";

const Dashboard = ({ children, roleLabel = "Welcome" }) => {
  const [open, setOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profileRef = React.useRef(null);

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    if (!profileOpen) return;
    
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  const handleProfileClick = () => {
    setProfileOpen(!profileOpen);
  };

  return (
    <div className="min-h-screen bg-clinic-bgDark text-clinic-textDark">
      {/* Top bar */}
      <header className="border-b border-slate-700 bg-clinic-surfaceDark/80 backdrop-blur relative z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-clinic-primary/20 text-clinic-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">
                {t("dashboard.title")}
              </p>
              <p className="text-[11px] text-slate-400">
                {t("dashboard.subtitle")}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-xs text-slate-300 sm:flex">
            <LanguageSwitcher />
            <span className="rounded-full bg-clinic-primary/10 px-3 py-1 font-medium text-clinic-primary">
              {roleLabel}
            </span>
            
            {/* Profile Dropdown */}
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 rounded-lg border border-slate-600 bg-clinic-surfaceDark/50 px-3 py-1.5 text-xs font-medium transition-all hover:border-clinic-primary/50 hover:bg-clinic-surfaceDark"
                  type="button"
                >
                  <User className="h-4 w-4" />
                  <span>{user.email || "Profile"}</span>
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 top-12 mt-1 w-48 rounded-lg border border-slate-600 bg-clinic-surfaceDark shadow-xl z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="border-b border-slate-700 px-4 py-3">
                      <p className="text-xs font-semibold text-white break-all">{user.email}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{roleLabel}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-400 transition-colors hover:bg-red-500/10 active:bg-red-500/20 cursor-pointer"
                      type="button"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span>{t("dashboard.logout") || "Logout"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-600 p-1.5 text-slate-300 sm:hidden"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* simple mobile dropdown */}
        {open && (
          <div className="border-t border-slate-800 bg-clinic-surfaceDark px-4 py-3 text-xs text-slate-300 sm:hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p>{t("dashboard.role")}: {roleLabel}</p>
                <LanguageSwitcher />
              </div>
              {user && (
                <>
                  <div className="border-t border-slate-700 pt-3">
                    <p className="text-xs font-semibold text-white mb-2 break-all">{user.email}</p>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-red-400 transition-colors hover:bg-red-500/20 active:bg-red-500/30 cursor-pointer"
                      type="button"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span>{t("dashboard.logout") || "Logout"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-6xl flex-1 flex-col px-4 pb-8 pt-6">
        {children}
      </main>
    </div>
  );
};

export default Dashboard;
