import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiAward, FiStar } from "react-icons/fi";

export default function TopContributors({ contributors = [] }) {
    const { t } = useTranslation();
    if (!contributors.length) return null;

    return (
        <section className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
                <FiAward />
                <p className="text-sm font-semibold uppercase tracking-wide">
                    {t("home.namesOfTheWeek")}
                </p>
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
                {t("home.topContributors")}
            </h2>
            <div className="mt-4 space-y-3">
                {contributors.map((contributor, idx) => (
                    <div
                        key={contributor.id}
                        className="flex items-center gap-3 rounded-2xl bg-white/70 p-3"
                    >
                        <span className="text-lg font-bold text-amber-500">{idx + 1}</span>
                        <div className="flex-1">
                            <Link
                                to={`/profile/${contributor.id}`}
                                className="font-semibold text-slate-900 hover:text-amber-600"
                            >
                                {contributor.name}
                            </Link>
                            <p className="text-xs text-slate-500">
                                {contributor.department ?? t("home.general")} •{" "}
                                {contributor.questions} {t("home.question")} • {contributor.answers} {t("home.answer")}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <FiStar />
                            {contributor.reputation} {t("home.rep")}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

