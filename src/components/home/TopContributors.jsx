import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiAward, FiStar } from "react-icons/fi";

export default function TopContributors({ contributors = [] }) {
    const { t } = useTranslation();
    if (!contributors.length) return null;

    return (
        <section className="rounded-2xl md:rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 md:p-6 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 text-amber-700">
                <FiAward className="h-4 w-4 md:h-5 md:w-5" />
                <p className="text-xs md:text-sm font-semibold uppercase tracking-wide">
                    {t("home.namesOfTheWeek")}
                </p>
            </div>
            <h2 className="mt-2 text-lg md:text-xl font-bold text-slate-900">
                {t("home.topContributors")}
            </h2>
            <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
                {contributors.map((contributor, idx) => (
                    <div
                        key={contributor.id}
                        className="flex items-center gap-2 md:gap-3 rounded-xl md:rounded-2xl bg-white/70 p-2.5 md:p-3 transition-all duration-200 hover:bg-white/90 hover:shadow-md animate-fade-in"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        <span className="text-base md:text-lg font-bold text-amber-500 flex-shrink-0">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                            <Link
                                to={`/profile/${contributor.id}`}
                                className="font-semibold text-sm md:text-base text-slate-900 hover:text-amber-600 truncate block"
                            >
                                {contributor.name}
                            </Link>
                            <p className="text-xs text-slate-500 truncate">
                                {contributor.department ?? t("home.general")} •{" "}
                                {contributor.questions} {t("home.question")} • {contributor.answers} {t("home.answer")}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 md:px-3 md:py-1 text-xs font-semibold text-amber-700 flex-shrink-0">
                            <FiStar className="h-3 w-3" />
                            {contributor.reputation} {t("home.rep")}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

