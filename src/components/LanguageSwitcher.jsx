import { useTranslation } from "react-i18next";
import { FiGlobe } from "react-icons/fi";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === "tr" ? "en" : "tr";
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            title={i18n.language === "tr" ? "Switch to English" : "Türkçe'ye geç"}
        >
            <FiGlobe className="h-4 w-4" />
            <span className="uppercase">{i18n.language === "tr" ? "TR" : "EN"}</span>
        </button>
    );
}

