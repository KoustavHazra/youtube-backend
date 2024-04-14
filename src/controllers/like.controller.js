import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    
    // user is logged in ?
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // video exists ?
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "VIDEO NOT FOUND.");

    // if on that video, user has already put a like or not - if yes, toggle. If no, toggle.
    // first check if video exists on the Like table and if user exists on the like table, and if user has liked the video or not
    const isVideoLiked = await Like.findOne({ video: videoId, likedBy: req.isVerifiedUser._id });
    if (!isVideoLiked) {
        const videoLiked = new Like({ video: videoId, likedBy: req.isVerifiedUser._id });
        await videoLiked.save();
        return res.status(200).json(new apiResponse(200, videoLiked, "Video liked successfully."));
    } else {
        await Like.findByIdAndDelete(isVideoLiked._id);
        return res.status(200).json(200, new apiResponse(200, {}, "Like removed from video successfully."));
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment

    // user is logged in ?
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // comment exists ?
    const comment = await Like.findById(commentId);
    if (!comment) throw new apiError(400, "COMMENT NOT FOUND.");

    // check if comment and user both exists on comment table, if yes - toggle. if no - toggle.
    const isCommentLiked = await Like.findOne({ comment: commentId, likedBy: req.isVerifiedUser._id });
    if (!isCommentLiked) {
        const commentLiked = new Like({ comment: commentId, likedBy: req.isVerifiedUser._id });
        await commentLiked.save();
        return res.status(200).json(new apiResponse(200, commentLiked, "Comment liked successfully."));
    } else {
        await Like.findByIdAndDelete(isCommentLiked._id);
        return res.status(200).json(new apiResponse(200, {}, "Like removed from comment successfully."));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    // user is logged in ?
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // tweet exists ?
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new apiError(400, "TWEET NOT FOUND.");

    // toggle user like on tweet
    const isTweetLiked = await Like.findOne({ tweet: tweetId, likedBy: req.isVerifiedUser._id });
    if (!isTweetLiked) {
        const tweetLiked = new Like({ tweet: tweetId, likedBy: req.isVerifiedUser._id });
        await tweetLiked.save();
        return res.status(200).json(new apiResponse(200, tweetLiked, "Tweet liked successfully."));
    } else {
        await Like.findByIdAndDelete(isTweetLiked._id);
        return res.status(200).json(new apiResponse(200, {}, "Like removed from tweet successfully."));
    }

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}