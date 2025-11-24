import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiX, FiFilter, FiCalendar, FiUser, FiThumbsUp, FiMessageSquare } from "react-icons/fi";

export default function AdvancedFilters({ filters, onFiltersChange, onClear }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
          hasActiveFilters
            ? "border-blue-600 bg-blue-50 text-blue-600"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <FiFilter className="h-4 w-4" />
        {t("home.filter")}
        {hasActiveFilters && (
          <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
            {Object.values(filters).filter(
              (v) => v !== "" && v !== null && v !== undefined
            ).length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl animate-slide-in-right">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t("home.filter")}</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Solved/Unsolved Filter */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiMessageSquare className="h-4 w-4" />
                  {t("question.solved")} / {t("question.unsolved")}
                </label>
                <select
                  value={filters.solved || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "solved",
                      e.target.value === "" ? null : e.target.value === "true"
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">{t("home.filterAll")}</option>
                  <option value="true">{t("home.filterSolved")}</option>
                  <option value="false">{t("home.filterUnsolved")}</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiCalendar className="h-4 w-4" />
                  {t("home.filterByDate")}
                </label>
                <select
                  value={filters.dateRange || ""}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value || null)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">{t("home.filterAll")}</option>
                  <option value="today">{t("common.today")}</option>
                  <option value="week">{t("common.thisWeek")}</option>
                  <option value="month">{t("common.thisMonth")}</option>
                  <option value="year">{t("common.thisYear")}</option>
                </select>
              </div>

              {/* Min Likes Filter */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiThumbsUp className="h-4 w-4" />
                  {t("home.filterByLikes")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minLikes || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minLikes",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder={t("common.minimum")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Min Answers Filter */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiMessageSquare className="h-4 w-4" />
                  {t("home.filterByAnswers")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minAnswers || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minAnswers",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder={t("common.minimum")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="mt-4 w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                {t("common.clear")} {t("home.filter")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

