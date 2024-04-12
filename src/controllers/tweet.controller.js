import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    try {
        //TODO: create tweet
        const { content } = req.body;
        if (!content?.trim()) throw new apiError(400, "NO CONTENT FOUND. PLEASE ADD SOME CONTENT IN YOUR TWEET.");
        
        // get the logged in user
        const user = await User.findById(req.isVerifiedUser._id).select(
            " -password -refreshToken -avatar -coverImage -createdAt -updatedAt -watchHistory -email "
        );
        if (!user) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");
    
        // create the new tweet
        const tweet = await Tweet.create({ owner: user, content: content });
        if (!tweet) throw new apiError(500, "TWEET NOT CREATED. INTERNAL SERVER ERROR.");
    
        return res
                .status(200)
                .json(new apiResponse(200, tweet.content, "Tweet was created successfully."));
    } catch (error) {
        throw new apiError(500, "ERROR OCCURRED WHILE CREATING A TWEET. INTERNAL SERVER ERROR.");
    }
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        // TODO: get user tweets
        const userId = req.params.userId;
        const tweets = await Tweet.find({ owner: userId });
        if (!tweets) throw new apiError(400, "ERROR OCCURED WHILE FINDING TWEETS.");
        
        if (tweets.length > 0) {
            return res
                .status(200)
                .json(new apiResponse(200, tweets, "Tweets found successfully."))
        } else {
            return res
                .status(200)
                .json(new apiResponse(200, {}, "No tweets were found for this user."))
        }
        
    } catch (error) {
        throw new apiError(500, "ERROR OCCURRED WHILE FETCHING USER TWEETS. INTERNAL SERVER ERROR.");
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    try {
        //TODO: update tweet
        const user = await User.findById(req.isVerifiedUser._id);
        if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");
    
        // get the content and tweet id
        const { content } = req.body;
        const tweetId = req.params.tweetId;
    
        // check content is there ?
        if (!content?.trim()) throw new apiError(400, "WITHOUT ANY NEW CONTENT TWEET CANNOT BE UPDATED.");
    
        // find the tweet using tweet id
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) throw new apiError(400, "TWEET WAS NOT FOUND.");
    
        // update the tweet
        tweet.content = content;
        await tweet.save({ validateBeforeSave: false });
    
        return res
                .status(200)
                .json(new apiResponse(200, tweet.content, "Tweet got updated successfully."))
    } catch (error) {
        throw new apiError(500, "ERROR OCCURRED WHILE UPDATING A TWEET. INTERNAL SERVER ERROR.");
    }
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    try {
        //TODO: delete tweet
        const user = await User.findById(req.isVerifiedUser._id);
        if (!user) throw new apiError(400, "USER IS NOT VERIFIED. PLEASE LOGIN.");
    
        // get the tweet from param
        const tweetId = req.params.tweetId;
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) throw new apiError(400, "TWEET WAS NOT FOUND.");
    
        // delete the tweet
        await tweet.deleteOne();
    
        return res
                .status(200)
                .json(new apiResponse(200, {}, "Tweet was deleted successfully."))
    } catch (error) {
        throw new apiError(500, "ERROR OCCURRED WHILE DELETING A TWEET. INTERNAL SERVER ERROR.");
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}