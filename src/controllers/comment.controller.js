import { mongoose } from "mongoose";;
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.body;

    // video exists ?
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "VIDEO NOT FOUND.");

    // comments exists ?
    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit
        },
        {
            $project: {
                comment: 1,
                owner: 1,
                _id: 0
            }
        }
    ]);

    if (!comments) throw new apiError(400, "COMMENTS NOT FOUND.");

    if (comments.length === 0) return res.status(200).json(new apiResponse(200, {}, "No comment found for this video."));
    else return res.status(200).json(new apiResponse(200, comments, "Comments fetched successfully."));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { comment } = req.body;

    // user verified ?
    const user = await User.findById(req.isVerifiedUser._id).select(
        " -password -refreshToken -avatar -coverImage -createdAt -updatedAt -watchHistory -email "
    );
    if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // create comment
    const newComment = await Comment.create({ comment: comment, video: videoId, owner: user });
    if (!newComment) throw new apiError(500, "COMMENT NOT CREATED. INTERNAL SERVER ERROR.");

    return res.status(200).json(new apiResponse(200, newComment, "Comment created for the video."));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { videoId, commentId } = req.params;
    const { editedComment } = req.body;

    // user is verified ?
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // video exists ?
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "VIDEO NOT FOUND.");

    // comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) throw new apiError(400, "COMMENT NOT FOUND.");

    // update comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                comment: editedComment
            }
        },
        {
            new: true,
            runValidators: true
        }
    );
    if (!updatedComment) throw new apiError(400, "COMMENT NOT UPDATED.");

    return res.status(200).json(new apiResponse(200, updatedComment, "Comment is updated."));

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { videoId, commentId } = req.params;

    // user is verified ?
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // video exists ?
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "VIDEO NOT FOUND.");

    // comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) throw new apiError(400, "COMMENT NOT FOUND.");

    // delete comment
    await comment.deleteOne();

    return res.status(200).json(new apiResponse(200, {}, "Comment was deleted successfully."));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }