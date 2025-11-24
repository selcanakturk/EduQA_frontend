import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FiMessageSquare, FiThumbsUp, FiCalendar, FiAward, FiTrendingUp, FiUser, FiEdit3, FiSettings } from "react-icons/fi";
import MarkdownEditor from "../components/MarkdownEditor";
import ErrorFallback from "../components/ErrorFallback";
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
import SkeletonLoader from "../components/SkeletonLoader";
import ConfirmationModal from "../components/ConfirmationModal";
import { FiEdit2, FiTrash2, FiX, FiBookmark } from "react-icons/fi";

export default function Profile() {
  const { t } = useTranslation();
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
  const [activeTab, setActiveTab] = useState(null); // null = hiçbir içerik gösterilmiyor, sadece profil bilgileri
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editUser, { isLoading: isSaving }] = useEditUserMutation();
  const [uploadProfileImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const [editQuestion, { isLoading: isEditingQuestion }] = useEditQuestionMutation();
  const [deleteQuestion, { isLoading: isDeletingQuestion }] = useDeleteQuestionMutation();
  // İstatistik kartları için verileri her zaman yükle (sadece isOwner kontrolü ile)
  const { data: myQuestionsData, isLoading: isLoadingQuestions, refetch: refetchMyQuestions } = useGetMyQuestionsQuery(
    undefined,
    { skip: !isOwner }
  );
  const { data: savedQuestionsData, isLoading: isLoadingSavedQuestions } = useGetSavedQuestionsQuery(
    undefined,
    { skip: !isOwner }
  );
  const { data: savedAnswersData, isLoading: isLoadingSavedAnswers } = useGetSavedAnswersQuery(
    undefined,
    { skip: !isOwner }
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

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

  // İstatistikler - Hook'lar erken return'lerden önce çağrılmalı
  const stats = useMemo(() => {
    const questionCount = myQuestionsData?.data?.length || 0;
    const savedQuestionsCount = savedQuestionsData?.data?.length || 0;
    const savedAnswersCount = savedAnswersData?.data?.length || 0;

    return {
      questions: questionCount,
      savedQuestions: savedQuestionsCount,
      savedAnswers: savedAnswersCount,
      reputation: profile?.reputation || 0,
      memberSince: profile?.createdAt ? new Date(profile.createdAt) : null,
    };
  }, [myQuestionsData, savedQuestionsData, savedAnswersData, profile]);

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
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      {/* Modern Profile Header with Cover */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
        {/* Cover Image Area */}
        <div className="h-48 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 backdrop-blur-sm"></div>

        {/* Profile Content */}
        <div className="relative -mt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Profile Image & Info */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative">
                  <img
                    src={profileImageUrl}
                    alt={profile.name}
                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105"
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
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50 hover:scale-105"
                      >
                        {isUploading ? (
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Yükleniyor...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FiEdit3 className="h-3 w-3" />
                            Değiştir
                          </span>
                        )}
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="text-white">
                <p className="text-sm uppercase tracking-widest text-white/70 mb-1">
                  {t("profile.profil")}
                </p>
                <h1 className="text-4xl font-black tracking-tight mb-2">
                  {profile.name}
                </h1>
                <p className="text-white/90 mb-4">{profile.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold">
                    {profile.role === "teacher" ? (
                      <>
                        <FiUser className="h-3.5 w-3.5" />
                        {t("profile.roleTeacher")}
                      </>
                    ) : (
                      <>
                        <FiUser className="h-3.5 w-3.5" />
                        {t("profile.roleStudent")}
                      </>
                    )}
                  </span>
                  {profile.role === "student" && profile.department && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold">
                      <FiTrendingUp className="h-3.5 w-3.5" />
                      {profile.department}
                    </span>
                  )}
                  {profile.role === "teacher" && profile.branch && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold">
                      <FiTrendingUp className="h-3.5 w-3.5" />
                      {profile.branch}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {isOwner && (
              <button
                onClick={handleToggleEdit}
                className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-6 py-3 font-semibold text-white transition hover:bg-white/30 hover:scale-105 shadow-lg"
              >
                {editMode ? (
                  <>
                    <FiX className="h-4 w-4" />
                    {t("common.cancel")}
                  </>
                ) : (
                  <>
                    <FiSettings className="h-4 w-4" />
                    {t("profile.edit")}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Card - Sabit, kartların üstünde */}
      {!editMode && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  {t("profile.name")}
                </p>
                <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  {t("profile.email")}
                </p>
                <p className="text-lg font-semibold text-gray-900">{profile.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Üyelik Tarihi
                </p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiCalendar className="h-4 w-4 text-gray-400" />
                  {stats.memberSince ? stats.memberSince.toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  {t("profile.reputation")}
                </p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiAward className="h-4 w-4 text-amber-500" />
                  {stats.reputation} puan
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İstatistik Kartları - Tıklanabilir */}
      {isOwner && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setActiveTab("questions");
              setEditMode(false);
            }}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left w-full ${activeTab === "questions" ? "ring-4 ring-blue-500 ring-offset-2" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-600/70 mb-1">
                  {t("profile.questions")}
                </p>
                <p className="text-3xl font-black text-blue-700">{stats.questions}</p>
              </div>
              <div className="rounded-full bg-blue-200/50 p-3">
                <FiMessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("savedQuestions");
              setEditMode(false);
            }}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left w-full ${activeTab === "savedQuestions" ? "ring-4 ring-green-500 ring-offset-2" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-green-600/70 mb-1">
                  {t("profile.savedQuestions")}
                </p>
                <p className="text-3xl font-black text-green-700">{stats.savedQuestions}</p>
              </div>
              <div className="rounded-full bg-green-200/50 p-3">
                <FiBookmark className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("savedAnswers");
              setEditMode(false);
            }}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left w-full ${activeTab === "savedAnswers" ? "ring-4 ring-purple-500 ring-offset-2" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-purple-600/70 mb-1">
                  {t("profile.savedAnswers")}
                </p>
                <p className="text-3xl font-black text-purple-700">{stats.savedAnswers}</p>
              </div>
              <div className="rounded-full bg-purple-200/50 p-3">
                <FiBookmark className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab(null);
              setEditMode(false);
            }}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left w-full ${activeTab === null ? "ring-4 ring-amber-500 ring-offset-2" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-600/70 mb-1">
                  {t("profile.reputation")}
                </p>
                <p className="text-3xl font-black text-amber-700">{stats.reputation}</p>
              </div>
              <div className="rounded-full bg-amber-200/50 p-3">
                <FiAward className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* İçerikler - Profil bilgilerinin üstünde gösterilir */}
      {activeTab === "questions" && isOwner && (
        <div className="space-y-4 animate-fade-in">
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
                      onClick={() => {
                        setQuestionToDelete(question._id);
                        setShowDeleteConfirm(true);
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
                {t("profile.noQuestionsYet")}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {t("profile.noQuestionsYetDescription")}
              </p>
              <Link
                to="/ask"
                className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                {t("question.ask")}
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "savedQuestions" && isOwner && (
        <div className="space-y-4 animate-fade-in">
          {isLoadingSavedQuestions ? (
            <SkeletonLoader type="question" count={3} />
          ) : savedQuestionsData?.data?.length > 0 ? (
            <div className="grid gap-4">
              {savedQuestionsData.data.map((question, index) => (
                <div
                  key={question._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <QuestionCard question={question} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <FiBookmark className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-semibold text-gray-900">
                {t("profile.noSavedQuestions")}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                İlgini çeken soruları kaydederek daha sonra kolayca bulabilirsin.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "savedAnswers" && isOwner && (
        <div className="space-y-4 animate-fade-in">
          {isLoadingSavedAnswers ? (
            <SkeletonLoader type="answer" count={3} />
          ) : savedAnswersData?.data?.length > 0 ? (
            <div className="grid gap-4">
              {savedAnswersData.data.map((answer, index) => (
                <div
                  key={answer._id}
                  className="animate-fade-in rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-2 text-sm text-gray-500">
                    <Link
                      to={`/questions/${answer.question?._id || answer.question}`}
                      className="font-semibold text-blue-600 hover:underline transition-colors"
                    >
                      {answer.question?.title || "Soru"}
                    </Link>
                  </div>
                  <AnswerCard answer={answer} questionId={answer.question?._id || answer.question} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <FiBookmark className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-semibold text-gray-900">
                {t("profile.noSavedAnswers")}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Beğendiğin cevapları kaydederek daha sonra kolayca bulabilirsin.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Profil Düzenleme Formu */}
      {editMode && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg animate-fade-in"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="rounded-full bg-blue-100 p-2">
              <FiSettings className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t("profile.edit")}</h3>
              <p className="text-sm text-gray-500">Profil bilgilerini güncelle</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {t("profile.name")}
              </label>
              <input
                {...register("name")}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder={t("profile.name")}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {t("profile.email")}
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder={t("profile.email")}
              />
            </div>
          </div>

          {profile?.role === "student" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {t("profile.department")}
              </label>
              <input
                {...register("department")}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Örn: Yazılım Mühendisliği"
              />
              <p className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                <FiTrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Bölüm bilgisini, sana önerilecek içerikleri kişiselleştirmek için kullanacağız.
              </p>
            </div>
          )}

          {profile?.role === "teacher" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {t("profile.branch")}
              </label>
              <input
                {...register("branch")}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Örn: Matematik, Fizik, Programlama"
              />
              <p className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                <FiTrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Branş bilgisini, sana önerilecek içerikleri kişiselleştirmek için kullanacağız.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleToggleEdit}
              className="rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <FiSettings className="h-4 w-4" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </form>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setQuestionToDelete(null);
        }}
        onConfirm={async () => {
          if (questionToDelete) {
            try {
              await deleteQuestion(questionToDelete).unwrap();
              toast.success("Soru silindi");
              refetchMyQuestions();
              setShowDeleteConfirm(false);
              setQuestionToDelete(null);
            } catch (err) {
              toast.error(err?.data?.message || "Soru silinemedi");
            }
          }
        }}
        title={t("profile.deleteQuestionTitle")}
        message={t("profile.deleteQuestionMessage")}
        confirmText={t("profile.deleteConfirm")}
        cancelText={t("common.cancel")}
        type="danger"
        isLoading={isDeletingQuestion}
      />
    </div>
  );
}