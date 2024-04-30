
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = 1,
        username } = req.body;
    //TODO: get all videos based on query, sort, pagination

    // if any channel or username is given
    let ownerFilter = {};
    if (username) {
        const user = await User.findOne({ username });
        if (user) {
            ownerFilter = { owner: user._id }
        }
    }

    const videos = await Video.aggregate([
        {
            $match: {
                $and: [
                    {
                        $or: [
                            { title: { $regex: query, $options: "i" } },
                            { description: { $regex: query, $options: "i" } },
                        ]
                    },
                    ownerFilter 
                ]
            }
        },
        {
            $sort: { [sortBy]: sortType === 1 ? 1 : 1 }
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner: {
                    _id: 1,
                    username: 1
                }
            }
        }
    ]);

    if (!videos) throw new apiError(500, "UNABLE TO FETCH VIDEOS. INTERNAL SERVER ERROR.");

    return res.status(200).json(new apiResponse(200, videos, "Videos fetched successfully."));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video

    // title and description present ?
    if (!(title && description)) throw new apiError("PLEASE PROVIDE BOTH TITLE AND DESCRIPTION.");
    
    // user logged in ?
    const user = await User.findById(req.isVerifiedUser._id).select(
        " -password -refreshToken -avatar -coverImage -createdAt -updatedAt -watchHistory -email "
    );
    if (!user) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // video present to be uploaded ?
    let videoLocalPath;
    if ( req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0 ) {
        videoLocalPath = req.files.videoFile[0].path;
    }

    // thumbnail present ?
    let thumbnailLocalPath;
    if ( req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    // upload on cloudinary
    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!video) throw new apiError(411, "VIDEO FILE WAS NOT UPLOADED SUCCESSFULLY.");
    if (!thumbnail) throw new apiError(411, "THUMBNAIL WAS NOT UPLOADED SUCCESSFULLY.");

    // create a new video object 
    const videofile = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        owner: user,
        title,
        description,
        duration: video.duration
    })
    
    const newVideo = await Video.findById(videofile._id);
    if (!newVideo) throw new apiError(500, "VIDEO NOT UPLOADED. INTERNAL SERVER ERROR.");

    return res.status(201).json(new apiResponse(201, newVideo, "Video uploaded successfully."));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id

    // video exists ?
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(411, "VIDEO NOT FOUND. INVALID VIDEO ID.");

    return res.status(200).json(new apiResponse(200, video, "Video fetched successfully."));
    
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    //TODO: update video details like title, description, thumbnail

    // video exists ?
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(411, "VIDEO NOT FOUND. INVALID VIDEO ID.");

    if (video.owner.toString() !== req.isVerifiedUser._id.toString()) throw new apiError(400, "UNAUTHORIZED USER.");

    if (!(title || description)) throw new apiError(411, "PLEASE PROVIDE TITLE OR DESCRIPTION, OR PROVIDE BOTH.");

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { title, description },
        { new: true, runValidators: true }
    );

    return res.status(200).json(new apiResponse(200, updatedVideo, "Video updated successfully."));

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video

    // video exists ?
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(411, "VIDEO NOT FOUND. INVALID VIDEO ID.");

    if (video.owner.toString() !== req.isVerifiedUser._id.toString()) throw new apiError(400, "UNAUTHORIZED USER.");

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new apiResponse(200, {}, "Video deleted successfully."));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // video exists ?
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(411, "VIDEO NOT FOUND. INVALID VIDEO ID.");

    if (video.owner.toString() !== req.isVerifiedUser._id.toString()) throw new apiError(400, "UNAUTHORIZED USER.");

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new apiResponse(200, video, "Video publish status toggled successfully."));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

// count the user views on the videos