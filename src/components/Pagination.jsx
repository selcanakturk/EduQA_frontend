import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  isLoading = false,
}) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-4 md:py-6 animate-fade-in">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || isLoading}
        className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold transition active:scale-95 ${!hasPrevPage || isLoading
            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
      >
        <FiChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className="hidden sm:inline">{t("common.previous")}</span>
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1 md:px-2 text-xs md:text-sm text-gray-400"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`min-w-[32px] md:min-w-[40px] rounded-lg border px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-semibold transition active:scale-95 ${isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : isLoading
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || isLoading}
        className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold transition active:scale-95 ${!hasNextPage || isLoading
            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
      >
        <span className="hidden sm:inline">{t("common.next")}</span>
        <FiChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </button>

      <div className="ml-2 md:ml-4 text-xs md:text-sm text-gray-600">
        {t("common.page")} {currentPage} / {totalPages}
      </div>
    </div>
  );
}

