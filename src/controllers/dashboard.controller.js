import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Tweet } from "../models/tweet.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes, total tweet etc.

    // total video views
    const totalVideoViews = await Video.aggregate([
        {
            $match: {
                owner: req.isVerifiedUser?._id,
                isPublished: true
            }
        },
        {
            $group: { _id: 0, totalViews: { $sum: "$views" }}
        },
        {
            $project: {
                totalViews: 1,
                _id: 0
            }
        }
    ]);
    if (!totalVideoViews) throw new apiError(411, "UNABLE TO FETCH TOTAL VIDEO VIEWS.");

    // total subscribers count
    const subscriberCount = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.isVerifiedUser._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalSubscriberCount: {
                    $size: "$subscribers"
                }
            }
        },
        {
            $project: {
                totalSubscriberCount: 1,
                _id: 0
            }
        }
    ]);
    if (!subscriberCount) throw new apiError(411, "UNABLE TO FETCH TOTAL SUBSCRIBER COUNT.");

    // total vidoe count
    const totalVideoCount = await Video.aggregate([
        {
            $match: {
                owner: req.isVerifiedUser._id,
                isPublished: true
            }
        },
        {
            $group: { _id: null, totalVideos: { $sum: 1 }}
        },
        {
            $project: {
                totalVideos: 1,
                _id: 0
            }
        }
    ]);
    if (!totalVideoCount) throw new apiError(411, "UNABLE TO FETCH TOTAL VIDEO COUNT.");

    // total like count on all published video
    const totalLikeCount = await Video.aggregate([
        {
            $match: {
                owner: req.isVerifiedUser._id,
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "totalLikes"
            }
        },
        {
            $unwind: "$totalLikes"
        },
        {
            $group: { _id: 0, likes: { $sum: 1 }}
        },
        {
            $project: {
                likes: 1,
                _id: 0
            }
        }
    ]);
    if (!totalLikeCount) throw new apiError(411, "UNABLE TO FETCH TOTAL LIKE COUNT.");

    // total tweet count
    const totalTweetCount = await Tweet.aggregate([
        {
            $match: {
                owner: req.isVerifiedUser._id
            }
        },
        {
            $group: { _id: 0, totalTweets: { $sum: 1 } }
        },
        {
            $project: {
                totalTweets: 1,
                _id: 0
            }
        }
    ]);
    if (!totalTweetCount) throw new apiError(411, "UNABLE TO FETCH TOTAL TWEET COUNT.");

    return res
            .status(200)
            .json(new apiResponse(
                200,
                {
                    totalViews: totalVideoViews[0]?.totalViews || 0,
                    totalSubscriberCount: subscriberCount[0]?.totalSubscriberCount || 0,
                    totalVideos: totalVideoCount[0]?.totalVideos || 0,
                    totalLikeCount: totalLikeCount[0]?.likes || 0,
                    totalTweets: totalTweetCount[0]?.totalTweets || 0,
                },
                "Channel data fetched successfully."
            ))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const videos = await Video.aggregate([
        {
            $match: {
                owner: req.isVerifiedUser._id,
                isPublished: true
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                owner: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1
            }
        }
    ]);
    if (!videos) throw new apiError(411, "UNABLE TO FETCH CHANNEL VIDEOS.");

    return res.status(200).json(new apiResponse(200, videos, "Videos fetched successfully."));
})

const getChannelTweets = asyncHandler( async (req, res) => {
    // TODO: Get all the Tweet uploaded by the channel

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: req.isVerifiedUser._id
            }
        },
        {
            $project: {
                owner: 1,
                content: 1
            }
        }
    ]);
    if (!tweets) throw new apiError(411, "UNABLE TO FETCH CHANNEL TWEETS.");
    
    return res.status(200).json(new apiResponse(200, tweets, "Tweets fetched successfully."));
} );

const getChannelPlaylists = asyncHandler( async (req, res) => {
    // TODO: Get all the Tweet uploaded by the channel

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: req.isVerifiedUser._id
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                videos: 1,
                owner: 1
            }
        }
    ]);
    if (!playlists) throw new apiError(411, "UNABLE TO FETCH CHANNEL PLAYLISTS.");
    
    return res.status(200).json(new apiResponse(200, playlists, "Playlists fetched successfully."));
} );


export {
    getChannelStats, 
    getChannelVideos,
    getChannelTweets,
    getChannelPlaylists
    }