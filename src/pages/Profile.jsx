import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FiMessageSquare, FiThumbsUp, FiCalendar } from "react-icons/fi";
import MarkdownEditor from "../components/MarkdownEditor";
import {
  useEditUserMutation,
  useGetProfileQuery,
  useUploadProfileImageMutation,
} from "../features/auth/authApi";
import {
  selectCurrentUser,
  selectAuthStatus,
  setCredentials,
} from "../features/auth/authSlice";
import {
  useGetMyQuestionsQuery,
  useEditQuestionMutation,
  useDeleteQuestionMutation,
} from "../features/questions/questionApi";
import {
  useGetSavedQuestionsQuery,
  useGetSavedAnswersQuery,
} from "../features/bookmarks/bookmarkApi";
import QuestionCard from "../components/QuestionCard";
import AnswerCard from "../components/AnswerCard";
import { FiEdit2, FiTrash2, FiX, FiBookmark } from "react-icons/fi";

export default function Profile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const authStatus = useSelector(selectAuthStatus);
  const { data, isFetching } = useGetProfileQuery(undefined, {
    skip: !currentUser || authStatus === "anonymous",
  });

  const profile = useMemo(() => {
    if (authStatus === "anonymous" || !currentUser) return null;
    return currentUser || data?.data;
  }, [currentUser, data, authStatus]);

  const isOwner =
    profile && (profile._id === id || profile.id === id || !id);

  useEffect(() => {
    if (authStatus === "anonymous" && !isFetching) {
      navigate("/");
    }
  }, [authStatus, navigate, isFetching]);

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editUser, { isLoading: isSaving }] = useEditUserMutation();
  const [uploadProfileImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const [editQuestion, { isLoading: isEditingQuestion }] = useEditQuestionMutation();
  const [deleteQuestion, { isLoading: isDeletingQuestion }] = useDeleteQuestionMutation();
  const { data: myQuestionsData, isLoading: isLoadingQuestions, refetch: refetchMyQuestions } = useGetMyQuestionsQuery(
    undefined,
    { skip: !isOwner || activeTab !== "questions" }
  );
  const { data: savedQuestionsData, isLoading: isLoadingSavedQuestions } = useGetSavedQuestionsQuery(
    undefined,
    { skip: !isOwner || activeTab !== "saved" }
  );
  const { data: savedAnswersData, isLoading: isLoadingSavedAnswers } = useGetSavedAnswersQuery(
    undefined,
    { skip: !isOwner || activeTab !== "saved" }
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);

  const {
    register: registerQuestion,
    handleSubmit: handleSubmitQuestion,
    reset: resetQuestion,
    watch: watchQuestion,
    setValue,
    formState: { errors: questionErrors },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  const editingQuestion = useMemo(() => {
    if (!editingQuestionId || !myQuestionsData?.data) return null;
    return myQuestionsData.data.find((q) => q._id === editingQuestionId);
  }, [editingQuestionId, myQuestionsData]);

  useEffect(() => {
    if (editingQuestion) {
      resetQuestion({
        title: editingQuestion.title || "",
        content: editingQuestion.content || "",
        tags: Array.isArray(editingQuestion.tags)
          ? editingQuestion.tags.join(", ")
          : editingQuestion.tags || "",
      });
      setSelectedFiles([]);
      setFilesToRemove([]);
    }
  }, [editingQuestion, resetQuestion]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      department: profile?.department || "",
      branch: profile?.branch || "",
    },
  });

  const selectedRole = watch("role") || profile?.role;

  useEffect(() => {
    reset({
      name: profile?.name || "",
      email: profile?.email || "",
      department: profile?.department || "",
      branch: profile?.branch || "",
    });
  }, [profile, reset]);

  useEffect(() => {
    if (editMode) {
      reset({
        name: profile?.name || "",
        email: profile?.email || "",
        department: profile?.department || "",
        branch: profile?.branch || "",
      });
    }
  }, [editMode, profile, reset]);

  const apiUrl =
    process.env.REACT_APP_API_URL || "http://localhost:5002/api";
  const apiOrigin = apiUrl.replace(/\/api\/?$/, "");

  const profileImageUrl = useMemo(() => {
    if (!profile?.profile_image) {
      return `${apiOrigin}/uploads/default.jpg`;
    }
    if (profile.profile_image.startsWith("http")) {
      return profile.profile_image;
    }
    if (profile.profile_image.startsWith("/")) {
      return `${apiOrigin}${profile.profile_image}`;
    }
    if (profile.profile_image.startsWith("uploads/")) {
      return `${apiOrigin}/${profile.profile_image}`;
    }
    return `${apiOrigin}/uploads/${profile.profile_image}`;
  }, [apiOrigin, profile?.profile_image]);

  if (isFetching && !profile) {
    return (
      <div className="py-20 text-center text-gray-500">
        Hesap bilgilerin kontrol ediliyor...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Profil bilgileri yüklenemedi. Lütfen tekrar deneyin.
      </div>
    );
  }

  const handleToggleEdit = () => {
    setEditMode((prev) => !prev);
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Lütfen 5MB'den küçük bir görsel yükleyin.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_image", file);

    try {
      const response = await uploadProfileImage(formData).unwrap();
      const updatedUser = response?.data;
      dispatch(
        setCredentials({
          ...(updatedUser || {}),
          access_token: currentUser?.access_token,
        })
      );
      toast.success("Profil fotoğrafı güncellendi!");
    } catch (err) {
      toast.error(err?.data?.message || "Görsel yüklenemedi");
    } finally {
      event.target.value = "";
    }
  };

  const onSubmit = async (values) => {
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined)
    );

    try {
      const response = await editUser(payload).unwrap();
      const updatedUser = response?.data || {
        ...profile,
        ...payload,
      };
      dispatch(
        setCredentials({
          ...updatedUser,
          access_token: currentUser?.access_token,
        })
      );
      reset({
        name: updatedUser.name,
        email: updatedUser.email,
        department: updatedUser.department,
        branch: updatedUser.branch,
      });
      toast.success("Profil bilgilerin güncellendi!");
      setEditMode(false);
    } catch (err) {
      toast.error(err?.data?.message || "Güncelleme başarısız");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="flex flex-wrap items-center gap-6 p-8">
          <div className="relative h-28 w-28">
            <img
              src={profileImageUrl}
              alt={profile.name}
              className="h-full w-full rounded-3xl border-4 border-white object-cover shadow-2xl"
            />
            {isOwner && (
              <>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
                <label
                  htmlFor="profile-image-input"
                  className="absolute inset-x-0 -bottom-4 mx-auto w-max cursor-pointer rounded-full bg-white px-4 py-1 text-xs font-semibold text-blue-700 shadow"
                >
                  {isUploading ? "Yükleniyor..." : "Fotoğrafı değiştir"}
                </label>
              </>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm uppercase tracking-widest text-white/80">
              Profil
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-white/80">{profile.email}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-white/20 px-4 py-1">
                {profile.role === "teacher" ? "Öğretmen" : "Öğrenci"}
              </span>
              {profile.role === "student" && profile.department && (
                <span className="rounded-full bg-white/20 px-4 py-1">
                  {profile.department}
                </span>
              )}
              {profile.role === "teacher" && profile.branch && (
                <span className="rounded-full bg-white/20 px-4 py-1">
                  {profile.branch}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "profile"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-blue-600"
                }`}
            >
              Profil
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "questions"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-blue-600"
                }`}
            >
              Sorularım
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "saved"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-blue-600"
                }`}
            >
              <FiBookmark className="h-4 w-4" />
              Kaydedilenler
            </button>
          </div>
          {activeTab === "profile" && (
            <button
              onClick={handleToggleEdit}
              className="rounded-full bg-slate-900 px-5 py-2 font-semibold text-white shadow hover:bg-slate-800"
            >
              {editMode ? "İptal et" : "Profili Düzenle"}
            </button>
          )}
        </div>
      )}

      {activeTab === "profile" && editMode && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              İsim
            </label>
            <input
              {...register("name")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="İsmini gir"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Email adresin"
            />
          </div>
          {profile?.role === "student" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Bölüm
              </label>
              <input
                {...register("department")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Örn: Yazılım Mühendisliği"
              />
              <p className="mt-1 text-xs text-gray-400">
                Bölüm bilgisini, sana önerilecek içerikleri kişiselleştirmek için
                kullanacağız.
              </p>
            </div>
          )}

          {profile?.role === "teacher" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Branş
              </label>
              <input
                {...register("branch")}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Örn: Matematik, Fizik, Programlama"
              />
              <p className="mt-1 text-xs text-gray-400">
                Branş bilgisini, sana önerilecek içerikleri kişiselleştirmek için
                kullanacağız.
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="w-full rounded-2xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </form>
      )}

      {activeTab === "profile" && (
        <div className="grid gap-4 rounded-3xl bg-white p-6 shadow sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Üyelik Tarihi
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(profile.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Repütasyon
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {profile.reputation ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Hesap Tipi
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {isOwner ? "Senin hesabın" : "Topluluk üyesi"}
            </p>
          </div>
        </div>
      )}

      {activeTab === "questions" && isOwner && (
        <div className="space-y-4">
          {isLoadingQuestions ? (
            <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
              Sorular yükleniyor...
            </div>
          ) : myQuestionsData?.data?.length > 0 ? (
            <div className="grid gap-4">
              {myQuestionsData.data.map((question) => (
                <div key={question._id} className="relative">
                  <QuestionCard question={question} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setEditingQuestionId(question._id)}
                      className="rounded-full bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                      title="Düzenle"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Bu soruyu silmek istediğine emin misin?"
                          )
                        ) {
                          try {
                            await deleteQuestion(question._id).unwrap();
                            toast.success("Soru silindi");
                            refetchMyQuestions();
                          } catch (err) {
                            toast.error(
                              err?.data?.message || "Soru silinemedi"
                            );
                          }
                        }
                      }}
                      disabled={isDeletingQuestion}
                      className="rounded-full bg-red-100 p-2 text-red-600 transition hover:bg-red-200 disabled:opacity-50"
                      title="Sil"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-8 text-center shadow">
              <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-semibold text-gray-900">
                Henüz soru sormadın
              </p>
              <p className="mt-2 text-sm text-gray-500">
                İlk sorunu sorarak topluluğa katkıda bulunabilirsin.
              </p>
              <Link
                to="/ask"
                className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Soru Sor
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "saved" && isOwner && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Kaydedilen Sorular
            </h3>
            {isLoadingSavedQuestions ? (
              <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
                Yükleniyor...
              </div>
            ) : savedQuestionsData?.data?.length > 0 ? (
              <div className="grid gap-4">
                {savedQuestionsData.data.map((question) => (
                  <QuestionCard key={question._id} question={question} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
                <FiBookmark className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg font-semibold text-gray-900">
                  Henüz soru kaydetmedin
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  İlgini çeken soruları kaydederek daha sonra kolayca bulabilirsin.
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Kaydedilen Cevaplar
            </h3>
            {isLoadingSavedAnswers ? (
              <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
                Yükleniyor...
              </div>
            ) : savedAnswersData?.data?.length > 0 ? (
              <div className="grid gap-4">
                {savedAnswersData.data.map((answer) => (
                  <div key={answer._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 text-sm text-gray-500">
                      <Link
                        to={`/questions/${answer.question?._id || answer.question}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {answer.question?.title || "Soru"}
                      </Link>
                    </div>
                    <AnswerCard answer={answer} questionId={answer.question?._id || answer.question} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
                <FiBookmark className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg font-semibold text-gray-900">
                  Henüz cevap kaydetmedin
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Beğendiğin cevapları kaydederek daha sonra kolayca bulabilirsin.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {editingQuestionId && editingQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Soruyu Düzenle
              </h3>
              <button
                onClick={() => {
                  setEditingQuestionId(null);
                  resetQuestion();
                  setSelectedFiles([]);
                  setFilesToRemove([]);
                }}
                className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-gray-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleSubmitQuestion(async (values) => {
                try {
                  const formData = new FormData();
                  formData.append("title", values.title.trim());
                  formData.append("content", values.content.trim());

                  if (values.tags && values.tags.trim()) {
                    const tagArray = values.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    tagArray.forEach((tag) => {
                      formData.append("tags", tag);
                    });
                  }

                  selectedFiles.forEach((file) => {
                    formData.append("attachments", file);
                  });

                  // Silinecek dosyaları gönder
                  if (filesToRemove.length > 0) {
                    formData.append("filesToRemove", JSON.stringify(filesToRemove));
                  }

                  await editQuestion({
                    id: editingQuestionId,
                    formData,
                  }).unwrap();
                  toast.success("Soru güncellendi!");
                  setEditingQuestionId(null);
                  resetQuestion();
                  setSelectedFiles([]);
                  setFilesToRemove([]);
                  refetchMyQuestions();
                } catch (err) {
                  toast.error(err?.data?.message || "Soru güncellenemedi");
                }
              })}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Başlık
                </label>
                <input
                  {...registerQuestion("title", {
                    required: "Başlık gereklidir",
                    minLength: {
                      value: 10,
                      message: "Başlık en az 10 karakter olmalı",
                    },
                  })}
                  className="w-full rounded border px-3 py-2"
                  placeholder="Soru başlığı"
                />
                {questionErrors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {questionErrors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  İçerik (Markdown desteklenir)
                </label>
                <MarkdownEditor
                  value={watchQuestion("content") || ""}
                  onChange={(value) => {
                    setValue("content", value, { shouldValidate: true });
                  }}
                  placeholder="Soru içeriği. Markdown formatında yazabilirsin: **kalın**, *italik*, `kod`, ```kod bloğu```"
                  minHeight="300px"
                />
                {questionErrors.content && (
                  <p className="mt-1 text-sm text-red-500">
                    {questionErrors.content.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Etiketler (virgülle ayır)
                </label>
                <input
                  {...registerQuestion("tags")}
                  className="w-full rounded border px-3 py-2"
                  placeholder="javascript, react, nodejs"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Dosya Ekle (Maksimum 5 dosya, 5MB/dosya)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const currentFilesCount =
                      (editingQuestion?.attachments?.length || 0) -
                      filesToRemove.length;
                    const maxAllowed = 5 - currentFilesCount;

                    if (files.length > maxAllowed) {
                      toast.error(
                        `Maksimum ${maxAllowed} dosya daha ekleyebilirsin (Toplam 5 dosya limiti)`
                      );
                      return;
                    }
                    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
                    if (oversized) {
                      toast.error("Dosya boyutu 5MB'den küçük olmalı");
                      return;
                    }
                    setSelectedFiles(files);
                  }}
                  className="w-full rounded border px-3 py-2"
                />
                {editingQuestion?.attachments && (
                  <p className="mt-1 text-xs text-gray-500">
                    Mevcut: {editingQuestion.attachments.length - filesToRemove.length} / 5
                    {selectedFiles.length > 0 && ` + ${selectedFiles.length} yeni`}
                  </p>
                )}
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {editingQuestion?.attachments && editingQuestion.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-2 text-sm font-medium text-gray-700">Mevcut dosyalar:</p>
                    <div className="space-y-2">
                      {editingQuestion.attachments
                        .filter((file) => !filesToRemove.includes(file))
                        .map((file, index) => {
                          const apiUrl =
                            process.env.REACT_APP_API_URL || "http://localhost:5002/api";
                          const apiOrigin = apiUrl.replace(/\/api\/?$/, "");
                          const fileUrl =
                            file.startsWith("http")
                              ? file
                              : file.startsWith("/")
                                ? `${apiOrigin}${file}`
                                : `${apiOrigin}/${file}`;
                          const isImage = /\.(jpg|jpeg|png|gif)$/i.test(
                            file.split("/").pop() || file
                          );

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                            >
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt="Attachment"
                                  className="h-16 w-16 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-200">
                                  <span className="text-xs text-gray-500">📄</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium text-gray-700">
                                  {file.split("/").pop() || file}
                                </p>
                                <p className="text-xs text-gray-500">Mevcut dosya</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFilesToRemove((prev) => [...prev, file]);
                                }}
                                className="rounded-full bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                                title="Kaldır"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                    {filesToRemove.length > 0 && (
                      <div className="mt-2 rounded-lg bg-red-50 p-2">
                        <p className="text-xs font-medium text-red-700">
                          {filesToRemove.length} dosya silinecek
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isEditingQuestion}
                  className="flex-1 rounded-full bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {isEditingQuestion ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestionId(null);
                    resetQuestion();
                    setSelectedFiles([]);
                    setFilesToRemove([]);
                  }}
                  className="rounded-full border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}