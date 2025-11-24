import { FiFeather } from "react-icons/fi";

export default function EmptyState({ onAsk }) {
    return (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center shadow-sm">
            <div className="rounded-full bg-blue-50 p-4 text-blue-500">
                <FiFeather className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Kampüsü ilk sen hareketlendirebilirsin!
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">
                Henüz hiç soru yok. Dersle ilgili aklına takılanları paylaş, diğer
                öğrenciler ve akademisyenler seninle birlikte tartışsın.
            </p>
            <button
                type="button"
                onClick={onAsk}
                className="mt-5 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
                İlk soruyu sor
            </button>
        </div>
    );
}

