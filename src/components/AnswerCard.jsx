import { useMemo, useState } from "react";
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
import ImageLightbox from "./ImageLightbox";

export default function AnswerCard({ answer, questionId }) {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [likeAnswer, { isLoading: likeLoading }] = useLikeAnswerMutation();
    const [undoLikeAnswer, { isLoading: undoLoading }] =
        useUndoLikeAnswerMutation();
    const [saveAnswer, { isLoading: isSavingAnswer }] = useSaveAnswerMutation();
    const [unsaveAnswer, { isLoading: isUnsavingAnswer }] = useUnsaveAnswerMutation();
    const [lightboxImages, setLightboxImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

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
        <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs md:text-sm text-gray-500">
                <span className="font-semibold text-gray-700">
                    {answer.user?.name || "Anonim"}
                </span>
                <span className="text-xs">{new Date(answer.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="mt-2 md:mt-3 text-sm md:text-base text-gray-800">
                <MarkdownRenderer content={answer.content} />
            </div>
            {answer.attachments && answer.attachments.length > 0 && (
                <div className="mt-2 md:mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600">Ekli Dosyalar:</p>
                    <div className="flex flex-wrap gap-2">
                        {answer.attachments.map((file, idx) => {
                            const fileUrl = getFileUrl(file);
                            const fileName = file.split("/").pop() || `Dosya ${idx + 1}`;
                            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);

                            const handleImageClick = (e) => {
                                if (isImage && fileUrl) {
                                    e.preventDefault();
                                    const imageAttachments = answer.attachments
                                        .map((f) => getFileUrl(f))
                                        .filter((url, i) => {
                                            const name = answer.attachments[i].split("/").pop() || "";
                                            return /\.(jpg|jpeg|png|gif)$/i.test(name) && url;
                                        });
                                    setLightboxImages(imageAttachments);
                                    setLightboxIndex(imageAttachments.indexOf(fileUrl));
                                    setShowLightbox(true);
                                }
                            };

                            return (
                                <a
                                    key={idx}
                                    href={fileUrl || "#"}
                                    target={isImage ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    onClick={isImage ? handleImageClick : undefined}
                                    className={`flex items-center gap-1.5 md:gap-2 rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-100 ${isImage ? "cursor-pointer" : ""}`}
                                >
                                    {isImage ? (
                                        <img src={fileUrl || ""} alt={fileName} className="h-5 w-5 md:h-6 md:w-6 rounded object-cover flex-shrink-0" />
                                    ) : (
                                        <FiDownload className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                    )}
                                    <span className="max-w-[100px] sm:max-w-[120px] truncate">{fileName}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
            <div className="mt-3 md:mt-4 flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleLikeToggle}
                    disabled={likeLoading || undoLoading}
                    className={`inline-flex items-center gap-1.5 md:gap-2 rounded-full border px-2.5 py-1 md:px-3 md:py-1 text-xs md:text-sm transition active:scale-95 ${likedByUser
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                        }`}
                >
                    <FiThumbsUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">{likedByUser ? "Beğenildi" : "Beğen"}</span>
                    <span className="font-semibold text-gray-700">
                        {answer.likes?.length || 0}
                    </span>
                </button>
                {user && (
                    <button
                        type="button"
                        onClick={handleToggleSaveAnswer}
                        disabled={isSavingAnswer || isUnsavingAnswer}
                        className={`inline-flex items-center gap-1.5 md:gap-2 rounded-full border px-2.5 py-1 md:px-3 md:py-1 text-xs md:text-sm transition active:scale-95 ${isAnswerSaved
                            ? "border-yellow-500 bg-yellow-50 text-yellow-600 hover:border-yellow-600"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                            } disabled:opacity-50`}
                        title={isAnswerSaved ? "Kaydedilenlerden kaldır" : "Kaydet"}
                    >
                        <FiBookmark className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isAnswerSaved ? "fill-current" : ""}`} />
                    </button>
                )}
            </div>

            {/* Image Lightbox */}
            {showLightbox && lightboxImages.length > 0 && (
                <ImageLightbox
                    images={lightboxImages}
                    currentIndex={lightboxIndex}
                    onClose={() => setShowLightbox(false)}
                />
            )}
        </div>
    );
}
