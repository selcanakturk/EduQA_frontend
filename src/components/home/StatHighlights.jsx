import { FiMessageSquare, FiThumbsUp, FiTrendingUp } from "react-icons/fi";

const statIcons = {
    discussions: FiMessageSquare,
    likes: FiThumbsUp,
    growth: FiTrendingUp,
};

export default function StatHighlights({ stats }) {
    const cards = [
        {
            key: "discussions",
            label: "Toplam Cevap",
            value: stats.totalAnswers,
            caption: "Soru başına ortalama " + stats.answerPerQuestion + " cevap",
        },
        {
            key: "likes",
            label: "Beğeni",
            value: stats.totalLikes,
            caption: "En çok etkileşimde bulunan içerikler",
        },
        {
            key: "growth",
            label: "Günlük yeni soru",
            value: stats.dailyQuestions,
            caption: "Kampüs aktifliği artıyor",
        },
    ];

    return (
        <section className="grid gap-4 md:grid-cols-3">
            {cards.map((card, index) => {
                const Icon = statIcons[card.key];
                return (
                    <div
                        key={card.key}
                        className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {card.label}
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {card.value ?? 0}
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">{card.caption}</p>
                    </div>
                );
            })}
        </section>
    );
}

