import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiCalendar,
    FiMessageSquare,
    FiThumbsUp,
    FiImage,
    FiCheckCircle,
} from "react-icons/fi";
import MarkdownRenderer from "./MarkdownRenderer";
import ImageLightbox from "./ImageLightbox";

export default function QuestionCard({ question }) {
    // Markdown'dan plain text çıkar (preview için)
    const getPlainText = (markdown) => {
        if (!markdown) return "";
        // Basit markdown temizleme
        return markdown
            .replace(/#{1,6}\s+/g, "") // Başlıklar
            .replace(/\*\*([^*]+)\*\*/g, "$1") // Kalın
            .replace(/\*([^*]+)\*/g, "$1") // İtalik
            .replace(/`([^`]+)`/g, "$1") // Inline kod
            .replace(/```[\s\S]*?```/g, "[kod bloğu]") // Kod blokları
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Linkler
            .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "[görsel]") // Görseller
            .trim();
    };

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5002/api";
    const apiOrigin = apiUrl.replace(/\/api\/?$/, "");

    const imageAttachments = useMemo(() => {
        if (!question?.attachments || question.attachments.length === 0) return [];
        return question.attachments.filter((file) => {
            const fileName = file.split("/").pop() || file;
            return /\.(jpg|jpeg|png|gif)$/i.test(fileName);
        });
    }, [question?.attachments]);

    const plainText = useMemo(() => {
        return getPlainText(question?.content);
    }, [question?.content]);

    if (!question) return null;

    const {
        _id,
        title,
        content,
        user,
        createdAt,
        answerCount = 0,
        likeCount = 0,
        tags = [],
        attachments = [],
    } = question;

    const snippet = plainText.length > 180 ? `${plainText.slice(0, 180)}...` : plainText;

    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        if (filePath.startsWith("http")) return filePath;
        if (filePath.startsWith("/")) return `${apiOrigin}${filePath}`;
        return `${apiOrigin}/${filePath}`;
    };

    const firstImage = imageAttachments.length > 0 ? imageAttachments[0] : null;
    const imageUrl = firstImage ? getFileUrl(firstImage) : null;
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const handleImageClick = (e) => {
        e.preventDefault();
        if (imageAttachments.length > 0) {
            const imageUrls = imageAttachments.map((img) => getFileUrl(img));
            setLightboxIndex(0);
            setShowLightbox(true);
        }
    };

    return (
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200">
            <div className="flex gap-4">
                {imageUrl && (
                    <Link
                        to={`/questions/${_id}`}
                        className="flex-shrink-0"
                        onClick={handleImageClick}
                    >
                        <img
                            src={imageUrl}
                            alt={title}
                            className="h-32 w-32 rounded-lg object-cover border border-gray-200 cursor-pointer transition hover:opacity-90"
                        />
                    </Link>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Link to={`/questions/${_id}`} className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                {title}
                            </h3>
                        </Link>
                        {question.solved && (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                <FiCheckCircle className="h-3 w-3" />
                                Çözüldü
                            </span>
                        )}
                    </div>

                    <p className="mt-2 text-sm text-gray-600">{snippet}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {tags?.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"
                            >
                                {tag}
                            </span>
                        ))}
                        {attachments && attachments.length > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                <FiImage className="h-3 w-3" />
                                {attachments.length} dosya
                            </span>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <FiCalendar className="h-4 w-4" />
                            {new Date(createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <FiMessageSquare className="h-4 w-4" />
                            {answerCount} cevap
                        </span>
                        <span className="flex items-center gap-1">
                            <FiThumbsUp className="h-4 w-4" />
                            {likeCount} beğeni
                        </span>
                        {user && (
                            <span className="ml-auto text-sm font-medium text-gray-700">
                                {user.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            {showLightbox && imageAttachments.length > 0 && (
                <ImageLightbox
                    images={imageAttachments.map((img) => getFileUrl(img))}
                    currentIndex={lightboxIndex}
                    onClose={() => setShowLightbox(false)}
                />
            )}
        </article>
    );
}
