import { useTranslation } from "react-i18next";

export default function TrendingTags({ tags = [], onSelect }) {
    const { t } = useTranslation();
    if (!tags.length) return null;

    return (
        <section
            id="trending"
            className="rounded-2xl md:rounded-3xl border border-slate-100 bg-white p-4 md:p-6 shadow-sm animate-fade-in"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wide text-blue-500">
                        {t("home.popularTags")}
                    </p>
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">
                        {t("home.trendingOnCampus")}
                    </h2>
                </div>
                <span className="text-xs md:text-sm text-slate-500">
                    {t("home.usedLast24Hours", { count: tags[0]?.count ?? 0 })}
                </span>
            </div>
            <div className="mt-3 md:mt-4 flex flex-wrap gap-2 md:gap-3">
                {tags.slice(0, 10).map((tag) => (
                    <button
                        key={tag.name}
                        type="button"
                        onClick={() => onSelect(tag.name)}
                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-blue-700 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:scale-105 active:scale-95"
                    >
                        #{tag.name}{" "}
                        <span className="ml-1 text-xs text-blue-400">{tag.count}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

