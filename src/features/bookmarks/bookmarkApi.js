import { apiSlice } from "../api/apiSlice";

export const bookmarkApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        saveQuestion: builder.mutation({
            query: (id) => ({
                url: `/bookmarks/questions/${id}`,
                method: "POST",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Question", id },
                { type: "Bookmark", id: "QUESTIONS" },
            ],
        }),
        unsaveQuestion: builder.mutation({
            query: (id) => ({
                url: `/bookmarks/questions/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Question", id },
                { type: "Bookmark", id: "QUESTIONS" },
            ],
        }),
        saveAnswer: builder.mutation({
            query: (id) => ({
                url: `/bookmarks/answers/${id}`,
                method: "POST",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Answer", id },
                { type: "Bookmark", id: "ANSWERS" },
            ],
        }),
        unsaveAnswer: builder.mutation({
            query: (id) => ({
                url: `/bookmarks/answers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Answer", id },
                { type: "Bookmark", id: "ANSWERS" },
            ],
        }),
        getSavedQuestions: builder.query({
            query: () => "/bookmarks/questions",
            providesTags: [{ type: "Bookmark", id: "QUESTIONS" }],
        }),
        getSavedAnswers: builder.query({
            query: () => "/bookmarks/answers",
            providesTags: [{ type: "Bookmark", id: "ANSWERS" }],
        }),
    }),
});

export const {
    useSaveQuestionMutation,
    useUnsaveQuestionMutation,
    useSaveAnswerMutation,
    useUnsaveAnswerMutation,
    useGetSavedQuestionsQuery,
    useGetSavedAnswersQuery,
} = bookmarkApi;

