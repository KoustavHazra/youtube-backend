import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    // Validate if channelId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(401, "INVALID CHANNEL ID.");
    }

    // channel exists ?
    const channelExists = await User.findById(channelId);
    if (!channelExists) throw new apiError(404, "CHANNEL NOT FOUND. PELASE PUT CORRECT CHANNEL ID.");

    // user is verified and loggedin to subscribe or unsubscribe
    const subscriber = await User.findById(req.isVerifiedUser._id);
    if (!subscriber) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // logged in user id and channel id cannot be same, since user cannot subscribe to their own channel
    if (channelExists._id.toString() === subscriber._id.toString()) throw new apiError(401, "CANNOT SUBSCRIBE TO YOUR OWN CHANNEL.");

    let isSubscribed;
    const channelSubscribed = await Subscription.findOne({ channel: channelId, subscriber: subscriber });
    if (!channelSubscribed) {
        // Not subscribed, so subscribe
        await Subscription.create({ channel: channelId, subscriber: subscriber });
        return res.status(200).json(new apiResponse(200, isSubscribed = true, "Channel subscribed successfully."));
    }
    else {
        // Already subscribed, so unsubscribe
        await Subscription.findByIdAndDelete(channelSubscribed._id);
        return res.status(200).json(new apiResponse(200, isSubscribed = false, "Channel unsubscribed successfully."));
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // anyone can view how many subscribers one channel has

    // Validate if channelId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(401, "INVALID CHANNEL ID. PELASE PUT CORRECT CHANNEL ID.");
    }

    // channel exists ?
    const channelExists = await User.findById(channelId);
    if (!channelExists) throw new apiError(404, "CHANNEL NOT FOUND. PELASE PUT CORRECT CHANNEL ID.");

    // Validate if channelId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(401, "INVALID CHANNEL ID.");
    }

    // get subscriber list
    const subscriberCount = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
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
                    $size: "$subscribers"  // tell the length of subsribers field
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

    if (!subscriberCount?.length) throw new apiError(411, "NO SUBSCRIBERS FOUND.");
    return res.status(200).json(new apiResponse(200, subscriberCount, "User channel fetched successfully."));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // only the channel onwer can see the list of his/her subscribed channels

    // Validate if channelId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new apiError(401, "INVALID CHANNEL ID. PELASE PUT CORRECT CHANNEL ID.");
    }

    // channel exists ?
    const channelExists = await User.findById(channelId);
    if (!channelExists) throw new apiError(404, "CHANNEL NOT FOUND.");

    // user logged in ?
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // if logged in user === channel user (other users should not know who logged in user is subscribed to)
    if (channelExists._id.toString() !== user._id.toString()) throw new apiError(401, "UNAUTHORIZED ACCESS.");
    const subscriptionList = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "totalChannelSubscribed"
            }
        },
        {
            $addFields: {
                totalSubscribers: {
                    $size: "$totalChannelSubscribed"
                }
            }
        },
        {
            $project: {
                "totalChannelSubscribed.username": 1,
                "totalChannelSubscribed.fullName": 1,
                "totalChannelSubscribed.avatar": 1,
                totalSubscribers: 1,
                _id: 0
            }
        }
    ]);

    if (!subscriptionList?.length) throw new apiError(401, "NO SUBSCRIPTION LIST FOUND.");
    return res.status(200).json(new apiResponse(200, subscriptionList, "Sunbscription list fetched successfully."));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}