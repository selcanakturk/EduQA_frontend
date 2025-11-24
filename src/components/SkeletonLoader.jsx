import { useTranslation } from "react-i18next";

export default function SkeletonLoader({ type = "question", count = 3 }) {
  const { t } = useTranslation();

  if (type === "question") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="h-32 w-32 flex-shrink-0 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-3/4 rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                  <div className="h-4 w-4/6 rounded bg-gray-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                  <div className="h-6 w-20 rounded-full bg-gray-200" />
                  <div className="h-6 w-14 rounded-full bg-gray-200" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-4 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "answer") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-20 rounded-full bg-gray-200" />
                  <div className="h-8 w-20 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="h-6 w-3/4 rounded bg-gray-200 mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

