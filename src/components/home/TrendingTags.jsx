import { useTranslation } from "react-i18next";

export default function TrendingTags({ tags = [], onSelect }) {
    const { t } = useTranslation();
    if (!tags.length) return null;

    return (
        <section
            id="trending"
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
                        {t("home.popularTags")}
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">
                        {t("home.trendingOnCampus")}
                    </h2>
                </div>
                <span className="text-sm text-slate-500">
                    {t("home.usedLast24Hours", { count: tags[0]?.count ?? 0 })}
                </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
                {tags.slice(0, 10).map((tag) => (
                    <button
                        key={tag.name}
                        type="button"
                        onClick={() => onSelect(tag.name)}
                        className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                    >
                        #{tag.name}{" "}
                        <span className="ml-1 text-xs text-blue-400">{tag.count}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

