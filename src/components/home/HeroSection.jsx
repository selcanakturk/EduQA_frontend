import { useTranslation } from "react-i18next";
import { FiArrowUpRight, FiBookOpen, FiUsers } from "react-icons/fi";

export default function HeroSection({ user, stats, onAsk }) {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-8 text-white shadow-2xl">
            <div className="relative z-10 grid gap-8 md:grid-cols-[2fr,1fr]">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-blue-100">
                        EduQA Campus
                    </p>
                    <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                        {t("home.welcomeTitle")}{user ? `, ${user.name}` : ""}.
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-blue-100/90">
                        {t("home.welcomeDescription")}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <button
                            type="button"
                            onClick={onAsk}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                        >
                            {t("home.askQuestion")}
                            <FiArrowUpRight />
                        </button>
                        <a
                            href="#trending"
                            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                        >
                            {t("home.trending")}
                        </a>
                    </div>
                </div>
                <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
                    <h3 className="text-sm uppercase tracking-wide text-blue-100">
                        {t("home.thisWeekOnCampus")}
                    </h3>
                    <ul className="mt-4 space-y-4 text-white">
                        <li className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                            <div className="rounded-2xl bg-blue-500/30 p-3">
                                <FiBookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats?.totalQuestions ?? 0}
                                </p>
                                <p className="text-sm text-blue-100">{t("home.totalQuestions")}</p>
                            </div>
                        </li>
                        <li className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                            <div className="rounded-2xl bg-purple-500/30 p-3">
                                <FiUsers className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats?.activeContributors ?? 0}
                                </p>
                                <p className="text-sm text-blue-100">{t("home.activeContributors")}</p>
                            </div>
                        </li>
                        <li className="rounded-2xl bg-white/5 p-4 text-sm text-blue-100">
                            {t("home.mostPopularTag")}{" "}
                            <span className="font-semibold text-white">
                                {stats?.topTag ?? "react"}
                            </span>{" "}
                            {t("home.became")}{" "}
                            <span className="font-semibold text-white">
                                {stats?.answerPerQuestion ?? 0}
                            </span>{" "}
                            {t("home.answerAverage")}
                        </li>
                    </ul>
                </div>
            </div>
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-amber-400/40 mix-blend-screen blur-3xl" />
            </div>
        </section>
    );
}

