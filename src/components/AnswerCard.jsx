import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiThumbsUp, FiDownload, FiBookmark } from "react-icons/fi";
import { selectCurrentUser, setCredentials } from "../features/auth/authSlice";
import {
    useLikeAnswerMutation,
    useUndoLikeAnswerMutation,
} from "../features/answers/answerApi";
import {
    useSaveAnswerMutation,
    useUnsaveAnswerMutation,
} from "../features/bookmarks/bookmarkApi";
import { toast } from "react-hot-toast";
import MarkdownRenderer from "./MarkdownRenderer";

export default function AnswerCard({ answer, questionId }) {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [likeAnswer, { isLoading: likeLoading }] = useLikeAnswerMutation();
    const [undoLikeAnswer, { isLoading: undoLoading }] =
        useUndoLikeAnswerMutation();
    const [saveAnswer, { isLoading: isSavingAnswer }] = useSaveAnswerMutation();
    const [unsaveAnswer, { isLoading: isUnsavingAnswer }] = useUnsaveAnswerMutation();

    const isAnswerSaved = useMemo(() => {
        if (!answer || !user) return false;
        const answerId = answer._id || answer.id;
        return user.savedAnswers?.some(
            (savedId) => savedId?.toString() === answerId?.toString()
        );
    }, [answer, user]);

    const handleToggleSaveAnswer = async () => {
        if (!user) {
            toast.error("Kaydetmek için giriş yapmalısın.");
            return;
        }
        try {
            const answerId = answer._id || answer.id;
            const response = isAnswerSaved
                ? await unsaveAnswer(answerId).unwrap()
                : await saveAnswer(answerId).unwrap();

            // Update user state with new saved answers
            if (response?.data) {
                const updatedUser = {
                    ...user,
                    savedAnswers: response.data,
                };
                dispatch(setCredentials(updatedUser));
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(
                        "auth_user",
                        JSON.stringify(updatedUser)
                    );
                }
            }

            toast.success(
                isAnswerSaved
                    ? "Cevap kaydedilenlerden kaldırıldı"
                    : "Cevap kaydedildi"
            );
        } catch (err) {
            toast.error(err?.data?.message || "İşlem başarısız");
        }
    };

    if (!answer) return null;

    const likedByUser = answer.likes?.some(
        (likeId) => likeId?.toString() === (user?.id || user?._id)
    );

    const handleLikeToggle = async () => {
        if (!user) {
            toast.error("Beğenmek için önce giriş yapmalısın.");
            return;
        }
        try {
            if (likedByUser) {
                await undoLikeAnswer({
                    questionId,
                    answerId: answer._id,
                }).unwrap();
                toast.success("Beğeni kaldırıldı");
            } else {
                await likeAnswer({
                    questionId,
                    answerId: answer._id,
                }).unwrap();
                toast.success("Cevap beğenildi");
            }
        } catch (error) {
            toast.error(error?.data?.message || "İşlem başarısız");
        }
    };

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5002/api";
    const apiOrigin = apiUrl.replace(/\/api\/?$/, "");

    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        if (filePath.startsWith("http")) return filePath;
        if (filePath.startsWith("/")) return `${apiOrigin}${filePath}`;
        return `${apiOrigin}/${filePath}`;
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="font-semibold text-gray-700">
                    {answer.user?.name || "Anonim"}
                </span>
                <span>{new Date(answer.createdAt).toLocaleString()}</span>
            </div>
            <div className="mt-3 text-gray-800">
                <MarkdownRenderer content={answer.content} />
            </div>
            {answer.attachments && answer.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600">Ekli Dosyalar:</p>
                    <div className="flex flex-wrap gap-2">
                        {answer.attachments.map((file, idx) => {
                            const fileUrl = getFileUrl(file);
                            const fileName = file.split("/").pop() || `Dosya ${idx + 1}`;
                            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
                            return (
                                <a
                                    key={idx}
                                    href={fileUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-100"
                                >
                                    {isImage ? (
                                        <img src={fileUrl || ""} alt={fileName} className="h-6 w-6 rounded object-cover" />
                                    ) : (
                                        <FiDownload className="h-4 w-4" />
                                    )}
                                    <span className="max-w-[120px] truncate">{fileName}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
            <div className="mt-4 flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleLikeToggle}
                    disabled={likeLoading || undoLoading}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${likedByUser
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                        }`}
                >
                    <FiThumbsUp className="h-4 w-4" />
                    {likedByUser ? "Beğenildi" : "Beğen"}
                    <span className="font-semibold text-gray-700">
                        {answer.likes?.length || 0}
                    </span>
                </button>
                {user && (
                    <button
                        type="button"
                        onClick={handleToggleSaveAnswer}
                        disabled={isSavingAnswer || isUnsavingAnswer}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${isAnswerSaved
                            ? "border-yellow-500 bg-yellow-50 text-yellow-600 hover:border-yellow-600"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                            } disabled:opacity-50`}
                        title={isAnswerSaved ? "Kaydedilenlerden kaldır" : "Kaydet"}
                    >
                        <FiBookmark className={`h-4 w-4 ${isAnswerSaved ? "fill-current" : ""}`} />
                    </button>
                )}
            </div>
        </div>
    );
}
