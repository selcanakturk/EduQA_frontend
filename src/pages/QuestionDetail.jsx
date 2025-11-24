import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { FiX, FiPaperclip, FiDownload, FiCheckCircle, FiBookmark } from "react-icons/fi";
import { selectCurrentUser, setCredentials } from "../features/auth/authSlice";
import MarkdownEditor from "../components/MarkdownEditor";
import MarkdownRenderer from "../components/MarkdownRenderer";
import {
    useGetQuestionByIdQuery,
    useLikeQuestionMutation,
    useUndoLikeQuestionMutation,
    useMarkAsSolvedMutation,
    useMarkAsUnsolvedMutation,
} from "../features/questions/questionApi";
import {
    useSaveQuestionMutation,
    useUnsaveQuestionMutation,
    useSaveAnswerMutation,
    useUnsaveAnswerMutation,
} from "../features/bookmarks/bookmarkApi";
import {
    useAddAnswerMutation,
    useDeleteAnswerMutation,
} from "../features/answers/answerApi";
import AnswerCard from "../components/AnswerCard";

const answerSchema = z.object({
    content: z.string().min(10, "Cevap en az 10 karakter olmalı"),
});

export default function QuestionDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetQuestionByIdQuery(id, { skip: !id });
    const question = data?.data;
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [likeQuestion, { isLoading: likeLoading }] = useLikeQuestionMutation();
    const [undoLikeQuestion, { isLoading: undoLoading }] =
        useUndoLikeQuestionMutation();
    const [addAnswer, { isLoading: answerLoading }] = useAddAnswerMutation();
    const [deleteAnswer] = useDeleteAnswerMutation();
    const [markAsSolved, { isLoading: isMarkingSolved }] = useMarkAsSolvedMutation();
    const [markAsUnsolved, { isLoading: isMarkingUnsolved }] = useMarkAsUnsolvedMutation();
    const [saveQuestion, { isLoading: isSavingQuestion }] = useSaveQuestionMutation();
    const [unsaveQuestion, { isLoading: isUnsavingQuestion }] = useUnsaveQuestionMutation();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(answerSchema),
        defaultValues: {
            content: "",
        },
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((file) => {
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error(`${file.name} 5MB'den büyük olamaz`);
                return false;
            }
            return true;
        });

        if (selectedFiles.length + validFiles.length > 5) {
            toast.error("En fazla 5 dosya ekleyebilirsiniz");
            return;
        }

        setSelectedFiles((prev) => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5002/api";
    const apiOrigin = apiUrl.replace(/\/api\/?$/, "");

    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        if (filePath.startsWith("http")) return filePath;
        if (filePath.startsWith("/")) return `${apiOrigin}${filePath}`;
        return `${apiOrigin}/${filePath}`;
    };

    const likedByUser = useMemo(() => {
        if (!question || !user) return false;
        return question.likes?.some(
            (likeId) => likeId?.toString() === (user.id || user._id)
        );
    }, [question, user]);

    const isQuestionSaved = useMemo(() => {
        if (!question || !user) return false;
        const questionId = question._id || question.id;
        return user.savedQuestions?.some(
            (savedId) => savedId?.toString() === questionId?.toString()
        );
    }, [question, user]);

    const handleToggleSaveQuestion = async () => {
        if (!user) {
            toast.error("Kaydetmek için giriş yapmalısın.");
            return;
        }
        try {
            const questionId = question._id || question.id;
            const response = isQuestionSaved
                ? await unsaveQuestion(questionId).unwrap()
                : await saveQuestion(questionId).unwrap();

            // Update user state with new saved questions
            if (response?.data) {
                const updatedUser = {
                    ...user,
                    savedQuestions: response.data,
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
                isQuestionSaved
                    ? "Soru kaydedilenlerden kaldırıldı"
                    : "Soru kaydedildi"
            );
        } catch (err) {
            toast.error(err?.data?.message || "İşlem başarısız");
        }
    };

    const handleQuestionLike = async () => {
        if (!user) {
            toast.error("Beğenmek için giriş yapmalısın.");
            return;
        }
        try {
            if (likedByUser) {
                await undoLikeQuestion(id).unwrap();
                toast.success("Beğeni kaldırıldı");
            } else {
                await likeQuestion(id).unwrap();
                toast.success("Soru beğenildi");
            }
        } catch (err) {
            toast.error(err?.data?.message || "İşlem başarısız oldu");
        }
    };

    const onSubmitAnswer = async (values) => {
        if (!user) {
            toast.error("Cevap yazmak için giriş yapmalısın.");
            return;
        }
        if (!values.content || values.content.trim().length < 10) {
            toast.error("Cevap en az 10 karakter olmalı");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("content", values.content.trim());

            selectedFiles.forEach((file) => {
                formData.append("attachments", file);
            });

            await addAnswer({ questionId: id, formData }).unwrap();
            toast.success("Cevap eklendi");
            reset();
            setSelectedFiles([]);
        } catch (err) {
            toast.error(err?.data?.message || "Cevap eklenemedi");
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        try {
            await deleteAnswer({ questionId: id, answerId }).unwrap();
            toast.success("Cevap silindi");
        } catch (err) {
            toast.error(err?.data?.message || "Cevap silinemedi");
        }
    };

    const handleToggleSolved = async () => {
        if (!user) {
            toast.error("Bu işlem için giriş yapmalısın.");
            return;
        }
        try {
            if (question.solved) {
                await markAsUnsolved(id).unwrap();
                toast.success("Soru çözülmemiş olarak işaretlendi");
            } else {
                await markAsSolved(id).unwrap();
                toast.success("Soru çözüldü olarak işaretlendi");
            }
        } catch (err) {
            toast.error(err?.data?.message || "İşlem başarısız");
        }
    };

    const isQuestionOwner = user && question && (
        user.id === question.user?._id ||
        user.id === question.user?.id ||
        user._id === question.user?._id ||
        user._id === question.user?.id
    );

    if (isLoading) {
        return (
            <div className="rounded bg-white p-6 text-center text-gray-500 shadow">
                Soru yükleniyor...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded bg-red-50 p-4 text-red-600">
                Soru getirilemedi: {error?.data?.message || error?.error}
                <button
                    className="ml-4 text-sm font-semibold text-blue-600 underline"
                    onClick={refetch}
                >
                    Tekrar dene
                </button>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="rounded bg-white p-6 text-center shadow">
                Soru bulunamadı.
            </div>
        );
    }

    const answers = question.answers || [];
    const bestAnswer = question.bestAnswer;
    const regularAnswers =
        bestAnswer?._id
            ? answers.filter((ans) => ans._id !== bestAnswer._id)
            : answers;

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex flex-wrap items-center gap-4">
                    {question.solved && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                            <FiCheckCircle className="h-4 w-4" />
                            Çözüldü
                        </span>
                    )}
                    <span className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                        {question.answerCount || answers.length} cevap
                    </span>
                    <span className="text-sm text-gray-500">
                        {new Date(question.createdAt).toLocaleString()}
                    </span>
                </div>

                <h1 className="mt-4 text-3xl font-bold text-gray-900">
                    {question.title}
                </h1>
                <div className="mt-4 text-gray-800">
                    <MarkdownRenderer content={question.content} />
                </div>

                {question.attachments && question.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Ekli Dosyalar:</p>
                        <div className="flex flex-wrap gap-2">
                            {question.attachments.map((file, idx) => {
                                const fileUrl = getFileUrl(file);
                                const fileName = file.split("/").pop() || `Dosya ${idx + 1}`;
                                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
                                return (
                                    <a
                                        key={idx}
                                        href={fileUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                                    >
                                        {isImage ? (
                                            <img src={fileUrl || ""} alt={fileName} className="h-8 w-8 rounded object-cover" />
                                        ) : (
                                            <FiDownload />
                                        )}
                                        <span className="max-w-[150px] truncate">{fileName}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    {question.tags?.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                        type="button"
                        onClick={handleQuestionLike}
                        disabled={likeLoading || undoLoading}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${likedByUser
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                            }`}
                    >
                        {likedByUser ? "Beğenildi" : "Soruyu Beğen"}
                        <span>{question.likeCount || question.likes?.length || 0}</span>
                    </button>
                    {user && (
                        <button
                            type="button"
                            onClick={handleToggleSaveQuestion}
                            disabled={isSavingQuestion || isUnsavingQuestion}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isQuestionSaved
                                    ? "border-yellow-500 bg-yellow-50 text-yellow-600 hover:border-yellow-600"
                                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                                } disabled:opacity-50`}
                        >
                            <FiBookmark className={`h-4 w-4 ${isQuestionSaved ? "fill-current" : ""}`} />
                            {isQuestionSaved ? "Kaydedildi" : "Kaydet"}
                        </button>
                    )}
                    {isQuestionOwner && (
                        <button
                            type="button"
                            onClick={handleToggleSolved}
                            disabled={isMarkingSolved || isMarkingUnsolved}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${question.solved
                                ? "border-orange-500 bg-orange-50 text-orange-600 hover:border-orange-600"
                                : "border-green-500 bg-green-50 text-green-600 hover:border-green-600"
                                } disabled:opacity-50`}
                        >
                            <FiCheckCircle className="h-4 w-4" />
                            {question.solved ? "Çözülmedi Olarak İşaretle" : "Çözüldü Olarak İşaretle"}
                        </button>
                    )}
                    {question.user && (
                        <Link
                            to={`/profile/${question.user._id || question.user.id}`}
                            className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            {question.user.name}
                        </Link>
                    )}
                </div>
            </div>

            {bestAnswer && (
                <section className="rounded-lg border border-green-200 bg-green-50 p-5">
                    <div className="mb-2 text-sm font-semibold text-green-700">
                        En iyi cevap
                    </div>
                    <AnswerCard answer={bestAnswer} questionId={id} />
                    {user &&
                        (user.id === bestAnswer.user?._id ||
                            user.id === bestAnswer.user?.id) && (
                            <button
                                type="button"
                                onClick={() => handleDeleteAnswer(bestAnswer._id)}
                                className="mt-2 text-sm text-red-500 hover:underline"
                            >
                                Cevabı Sil
                            </button>
                        )}
                </section>
            )}

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Tüm Cevaplar</h2>
                {regularAnswers.length === 0 && !bestAnswer && (
                    <div className="rounded bg-white p-4 text-center text-gray-500 shadow">
                        Henüz cevap yok. İlk cevabı sen yaz!
                    </div>
                )}
                {regularAnswers.map((answer) => (
                    <div key={answer._id} className="flex flex-col gap-2">
                        <AnswerCard answer={answer} questionId={id} />
                        {user && (user.id === answer.user?._id || user.id === answer.user?.id) && (
                            <button
                                type="button"
                                onClick={() => handleDeleteAnswer(answer._id)}
                                className="self-end text-sm text-red-500 hover:underline"
                            >
                                Cevabı Sil
                            </button>
                        )}
                    </div>
                ))}
            </section>

            <section className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-xl font-semibold text-gray-900">Cevap Yaz</h3>
                {user ? (
                    <form onSubmit={handleSubmit(onSubmitAnswer)} className="mt-4 space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Cevabını yaz (Markdown desteklenir)
                            </label>
                            <MarkdownEditor
                                value={watch("content") || ""}
                                onChange={(value) => {
                                    setValue("content", value);
                                }}
                                placeholder="Cevabını detaylıca yaz... Markdown formatında yazabilirsin: **kalın**, *italik*, `kod`, ```kod bloğu```"
                                minHeight="250px"
                            />
                            {errors.content && (
                                <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                id="answer-file-input"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="answer-file-input"
                                className="flex cursor-pointer items-center gap-2 rounded border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                            >
                                <FiPaperclip />
                                Dosya Ekle (En fazla 5, 5MB'a kadar)
                            </label>
                            {selectedFiles.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2"
                                        >
                                            <span className="text-sm text-gray-700">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={answerLoading}
                            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            {answerLoading ? "Gönderiliyor..." : "Cevabı Gönder"}
                        </button>
                    </form>
                ) : (
                    <p className="mt-2 text-sm text-gray-600">
                        Cevap yazmak için{" "}
                        <Link to="/login" className="text-blue-600 underline">
                            giriş yap
                        </Link>
                        .
                    </p>
                )}
            </section>
        </div>
    );
}
