import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { mongoose } from "mongoose";

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

    // user is logged in ?
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // in the like table find how many videos are liked by a single user, that is our output
    const likedVideos = await Like.aggregate([
        {
            $match: {  // Match likes by the user for videos
                likedBy: new mongoose.Types.ObjectId(req.isVerifiedUser._id),
                video: { $exists: true }
            }
        },
        {
            $group: {
                _id: "$video",
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project: {
                _id: 1,
                title: 1,
                owner: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1
           }
        }
    ])
    
    if(!likedVideos) throw new apiError(400, "ERROR WHILE FETCHING LIKED VIDEOS.");

    if (likedVideos.length === 0) return res.status(200).json(new apiResponse(200, [], "No liked videos found."));

    else return res.status(200).json(new apiResponse(200, likedVideos, "Liked videos fetched successfully."));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}