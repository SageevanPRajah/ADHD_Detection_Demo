import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;

  const toggle = () => {
    i18n.changeLanguage(currentLang === "en" ? "si" : "en");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-full border border-slate-600 bg-black/30 px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:bg-black/50 hover:border-slate-400"
      title={currentLang === "en" ? "සිංහල වලට මාරු වන්න" : "Switch to English"}
    >
      <span className="text-base leading-none">🌐</span>
      <span>{currentLang === "en" ? t("langSwitch.si") : t("langSwitch.en")}</span>
    </button>
  );
};

export default LanguageSwitcher;
