import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiX, FiPaperclip } from "react-icons/fi";
import { useAskQuestionMutation } from "../features/questions/questionApi";
import MarkdownEditor from "../components/MarkdownEditor";

const questionSchema = z.object({
  title: z.string().min(10, "Başlık en az 10 karakter olmalı"),
  content: z.string().min(20, "İçerik en az 20 karakter olmalı"),
  tags: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
        : []
    ),
});

export default function AskQuestion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [askQuestion, { isLoading }] = useAskQuestionMutation();
  const [selectedFiles, setSelectedFiles] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
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

  const onSubmit = async (values) => {
    try {
      if (!values.title || values.title.trim().length < 10) {
        toast.error("Başlık en az 10 karakter olmalı");
        return;
      }
      if (!values.content || values.content.trim().length < 20) {
        toast.error("İçerik en az 20 karakter olmalı");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title.trim());
      formData.append("content", values.content.trim());

      if (values.tags && Array.isArray(values.tags) && values.tags.length > 0) {
        values.tags.forEach((tag) => {
          formData.append("tags", tag);
        });
      } else if (values.tags && typeof values.tags === 'string' && values.tags.trim()) {
        // Eğer tags string olarak geliyorsa (virgülle ayrılmış)
        const tagArray = values.tags.split(',').map(t => t.trim()).filter(Boolean);
        tagArray.forEach((tag) => {
          formData.append("tags", tag);
        });
      }

      selectedFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await askQuestion(formData).unwrap();
      toast.success("Soru başarıyla paylaşıldı!");
      reset();
      setSelectedFiles([]);
      const questionId = response?.data?._id;
      if (questionId) {
        navigate(`/questions/${questionId}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Soru oluşturulamadı");
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-white p-4 md:p-6 shadow animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("question.ask")}</h1>
      <p className="mt-2 text-sm md:text-base text-gray-600">
        {t("question.askDescription")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 md:mt-6 space-y-4 md:space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Başlık
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            placeholder="Örn: React ile form doğrulama nasıl yapılır?"
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-xs md:text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            İçerik (Markdown desteklenir)
          </label>
          <MarkdownEditor
            value={watch("content") || ""}
            onChange={(value) => {
              setValue("content", value);
            }}
            placeholder="Sorunu detaylandır, denediğin adımları ve beklediğin sonucu belirt. Markdown formatında yazabilirsin: **kalın**, *italik*, `kod`, ```kod bloğu```"
            minHeight="250px"
          />
          {errors.content && (
            <p className="mt-1 text-xs md:text-sm text-red-500">
              {errors.content.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Etiketler (virgülle ayır)
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            placeholder="react, javascript, nodejs"
            {...register("tags")}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Dosya Ekle (Fotoğraf veya Belge)
          </label>
          <div className="space-y-2">
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <FiPaperclip className="h-4 w-4" />
              <span className="hidden sm:inline">Dosya Seç (En fazla 5, 5MB'a kadar)</span>
              <span className="sm:hidden">Dosya Seç</span>
            </label>
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 md:px-3 md:py-2"
                  >
                    <span className="text-xs md:text-sm text-gray-700 truncate flex-1 mr-2">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Desteklenen formatlar: JPG, PNG, GIF, PDF, DOC, DOCX, TXT (Max 5MB)
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 py-2.5 md:py-3 text-base md:text-lg font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 active:scale-95"
        >
          {isLoading ? "Gönderiliyor..." : "Soruyu Yayınla"}
        </button>
      </form>
    </div>
  );
}