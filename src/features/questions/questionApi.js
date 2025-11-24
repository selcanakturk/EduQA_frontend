import { apiSlice } from "../api/apiSlice";

export const questionsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getQuestions: builder.query({
            query: (params = {}) => ({
                url: "/questions",
                params,
            }),
            providesTags: (result) =>
                result?.data?.map((question) => ({
                    type: "Question",
                    id: question._id,
                })) || [{ type: "Question", id: "LIST" }],
        }),
        getQuestionById: builder.query({
            query: (id) => `/questions/${id}`,
            providesTags: (result, error, id) => [{ type: "Question", id }],
        }),
        getMyQuestions: builder.query({
            query: () => "/questions/my-questions",
            providesTags: (result) =>
                result?.data?.map((question) => ({
                    type: "Question",
                    id: question._id,
                })) || [{ type: "Question", id: "MY_LIST" }],
        }),
        askQuestion: builder.mutation({
            query: (formData) => ({
                url: "/questions/ask",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Question", id: "LIST" }],
        }),
        likeQuestion: builder.mutation({
            query: (id) => ({
                url: `/questions/${id}/like`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Question", id },
                { type: "Question", id: "LIST" },
            ],
        }),
        undoLikeQuestion: builder.mutation({
            query: (id) => ({
                url: `/questions/${id}/undo_like`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Question", id },
                { type: "Question", id: "LIST" },
            ],
        }),
        editQuestion: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/questions/${id}/edit`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Question", id },
                { type: "Question", id: "LIST" },
                { type: "Question", id: "MY_LIST" },
            ],
        }),
        deleteQuestion: builder.mutation({
            query: (id) => ({
                url: `/questions/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Question", id },
                { type: "Question", id: "LIST" },
                { type: "Question", id: "MY_LIST" },
            ],
        }),
        markAsSolved: builder.mutation({
            query: (id) => ({
                url: `/questions/${id}/solve`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Question", id },
                { type: "Question", id: "LIST" },
                { type: "Question", id: "MY_LIST" },
            ],
        }),
        markAsUnsolved: builder.mutation({
            query: (id) => ({
                url: `/questions/${id}/unsolve`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Question", id },
                { type: "Question", id: "LIST" },
                { type: "Question", id: "MY_LIST" },
            ],
        }),
    }),
});

export const {
    useGetQuestionsQuery,
    useGetQuestionByIdQuery,
    useGetMyQuestionsQuery,
    useLazyGetQuestionsQuery,
    useAskQuestionMutation,
    useLikeQuestionMutation,
    useUndoLikeQuestionMutation,
    useEditQuestionMutation,
    useDeleteQuestionMutation,
    useMarkAsSolvedMutation,
    useMarkAsUnsolvedMutation,
} = questionsApi;

