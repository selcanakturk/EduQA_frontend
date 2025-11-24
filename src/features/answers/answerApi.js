import { apiSlice } from "../api/apiSlice";

export const answersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addAnswer: builder.mutation({
            query: ({ questionId, formData }) => ({
                url: `/questions/${questionId}/answers`,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: (result, error, { questionId }) => [
                { type: "Question", id: questionId },
            ],
        }),
        likeAnswer: builder.mutation({
            query: ({ questionId, answerId }) => ({
                url: `/questions/${questionId}/answers/${answerId}/like`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, { questionId }) => [
                { type: "Question", id: questionId },
            ],
        }),
        undoLikeAnswer: builder.mutation({
            query: ({ questionId, answerId }) => ({
                url: `/questions/${questionId}/answers/${answerId}/undo_like`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, { questionId }) => [
                { type: "Question", id: questionId },
            ],
        }),
        deleteAnswer: builder.mutation({
            query: ({ questionId, answerId }) => ({
                url: `/questions/${questionId}/answers/${answerId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { questionId }) => [
                { type: "Question", id: questionId },
            ],
        }),
    }),
});

export const {
    useAddAnswerMutation,
    useLikeAnswerMutation,
    useUndoLikeAnswerMutation,
    useDeleteAnswerMutation,
} = answersApi;

