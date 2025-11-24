import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useGetQuestionsQuery } from "../features/questions/questionApi";
import { selectCurrentUser } from "../features/auth/authSlice";
import QuestionCard from "../components/QuestionCard";
import HeroSection from "../components/home/HeroSection";
import StatHighlights from "../components/home/StatHighlights";
import TrendingTags from "../components/home/TrendingTags";
import TopContributors from "../components/home/TopContributors";
import EmptyState from "../components/home/EmptyState";
import ErrorFallback from "../components/ErrorFallback";
import AdvancedFilters from "../components/AdvancedFilters";
import { parseApiError } from "../utils/errorHandler";

export default function Home() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [activeTag, setActiveTag] = useState("");
  const [filters, setFilters] = useState({
    solved: null,
    dateRange: null,
    minLikes: null,
    minAnswers: null,
  });
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {};
    if (activeTag) {
      params.search = activeTag;
    } else if (search) {
      params.search = search;
    }
    if (sort) {
      params.sort = sort;
    }
    if (filters.solved !== null) {
      params.solved = filters.solved.toString();
    }
    if (filters.dateRange) {
      params.dateRange = filters.dateRange;
    }
    if (filters.minLikes !== null) {
      params.minLikes = filters.minLikes;
    }
    if (filters.minAnswers !== null) {
      params.minAnswers = filters.minAnswers;
    }
    return params;
  }, [search, sort, activeTag, filters]);

  const { data, isLoading, isError, error, refetch } = useGetQuestionsQuery(queryParams);

  const questions = data?.data || [];

  const derived = useMemo(() => {
    const tagCounts = {};
    const contributorMap = {};
    let totalAnswers = 0;
    let totalLikes = 0;

    questions.forEach((question) => {
      (question.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      const answerCount =
        question.answerCount || question.answers?.length || 0;
      totalAnswers += answerCount;
      totalLikes += question.likeCount || question.likes?.length || 0;

      const contributorId = question.user?._id || question.user?.id;
      if (contributorId) {
        const existing = contributorMap[contributorId] || {
          id: contributorId,
          name: question.user.name,
          department: question.user.department,
          reputation: question.user.reputation || 0,
          questions: 0,
          answers: 0,
          likes: 0,
        };
        existing.questions += 1;
        existing.answers += answerCount;
        existing.likes += question.likeCount || 0;
        contributorMap[contributorId] = existing;
      }
    });

    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const contributors = Object.values(contributorMap)
      .sort((a, b) => b.reputation - a.reputation || b.answers - a.answers)
      .slice(0, 5);

    return {
      tags,
      contributors,
      totalAnswers,
      totalLikes,
    };
  }, [questions]);

  const heroStats = {
    totalQuestions: data?.total ?? 0,
    activeContributors: derived.contributors.length || 0,
    topTag: derived.tags[0]?.name || "react",
    answerPerQuestion: questions.length
      ? Math.max((derived.totalAnswers / questions.length).toFixed(1), 0)
      : 0,
  };

  const highlightStats = {
    totalAnswers: derived.totalAnswers,
    answerPerQuestion: heroStats.answerPerQuestion,
    totalLikes: derived.totalLikes,
    dailyQuestions: Math.max(Math.round((data?.total ?? 0) / 14), 1),
  };

  const handleAskQuestion = () => {
    navigate("/ask");
  };

  const handleTagSelect = (tag) => {
    setActiveTag(tag);
    setSearch("");
  };

  const clearActiveTag = () => {
    setActiveTag("");
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      solved: null,
      dateRange: null,
      minLikes: null,
      minAnswers: null,
    });
  }, []);

  return (
    <div className="space-y-8">
      <HeroSection user={user} stats={heroStats} onAsk={handleAskQuestion} />

      <StatHighlights stats={highlightStats} />

      <div className="grid gap-6 lg:grid-cols-[3fr,1.3fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
                  {t("home.campusFeed")}
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {t("home.title")}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {activeTag && (
                  <button
                    type="button"
                    onClick={clearActiveTag}
                    className="text-sm font-semibold text-blue-600 underline"
                  >
                    #{activeTag} {t("home.removeFilter")}
                  </button>
                )}
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClear={handleClearFilters}
                />
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveTag("");
                }}
                placeholder={t("home.searchPlaceholder")}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="newest">{t("home.sortNewest")}</option>
                <option value="most_liked">{t("home.sortMostLiked")}</option>
                <option value="most_answered">{t("home.sortMostAnswered")}</option>
                <option value="oldest">{t("home.sortOldest")}</option>
                <option value="solved_newest">{t("home.sortSolvedNewest")}</option>
                <option value="unsolved_newest">{t("home.sortUnsolvedNewest")}</option>
              </select>
            </div>
          </section>

          {isLoading && (
            <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow-sm">
              {t("home.questionsLoading")}
            </div>
          )}

          {isError && (
            <ErrorFallback
              error={error}
              resetErrorBoundary={refetch}
            />
          )}

          {!isLoading && !isError && questions.length === 0 && (
            <EmptyState onAsk={handleAskQuestion} />
          )}

          <div className="grid gap-4">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <TrendingTags tags={derived.tags} onSelect={handleTagSelect} />
          <TopContributors contributors={derived.contributors} />
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              {t("home.campusGuide")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {t("home.campusGuideDescription")}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• {t("home.campusGuideTip1")}</li>
              <li>• {t("home.campusGuideTip2")}</li>
              <li>• {t("home.campusGuideTip3")}</li>
            </ul>
            <button
              type="button"
              onClick={handleAskQuestion}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {t("home.exploreMore")}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}