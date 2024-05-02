import { Playlist } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";


const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description } = req.body;
    if (!name?.trim() || !description?.trim()) throw new apiError(400, "PLEASE FILL BOTH THE NAME AND DESCRIPTION FIELDS.")
    
    //TODO: create playlist
    // verify if user is logged in  -- how can a user save a playlist without logging in
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // create a playlist
    const playlist = await Playlist.create({ name: name, description: description, owner: user });
    if (!playlist) throw new apiError(500, "PLAYLIST NOT CREATED. INTERNAL SERVER ERROR.");

    return res
            .status(200)
            .json(new apiResponse(200, playlist, "Playlist created successfully."))

})

const getUserPlaylists = asyncHandler(async (req, res) => {    
    const { userId } = req.params;

    //TODO: get user playlists
    const playlists = await Playlist.find({ owner: userId });
    if (!playlists) throw new apiError(401, "ERROR OCCURED WHILE FINDING PLAYLISTS.");
    
    if (playlists.length > 0) {
        return res
                .status(200)
                .json(new apiResponse(200, playlists, "Playlists fetched successfully."))
    }
    else {
        return res
            .status(200)
            .json(new apiResponse(200, {}, "No playlists were found for this user."))
    }

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new apiError(401, "ERROR OCCURED WHILE FINDING PLAYLIST.");

    return res
            .status(200)
            .json(new apiResponse(200, playlist, "Playlist fetched successfully."))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // TODO: add video to playlist
    const { playlistId, videoId } = req.params;

    // validate the user first
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // find that video is existing or not
    const video = await Video.findById(videoId);
    if (!video) throw new apiError(401, "VIDEO NOT FOUND.");

    // playlist exists ?
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new apiError(401, "ERROR OCCURED WHILE FINDING PLAYLIST.");
    
    if (!playlist?.videos?.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    }

    return res
            .status(200)
            .json(new apiResponse(200, playlist, "Video saved to playlist successfully."))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const { playlistId, videoId } = req.params;

    // validate the user first
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    const video = await Video.findById(videoId);
    if (!video) throw new apiError(401, "VIDEO NOT FOUND.");

    // playlist exists ?
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new apiError(401, "ERROR OCCURED WHILE FINDING PLAYLIST.");

    playlist.videos = playlist.videos.filter( item => item === videoId );
    await playlist.save();

    return res
            .status(200)
            .json(new apiResponse(200, playlist, "Video removed from playlist successfully."))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // validate the user first
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");
    
    // TODO: delete playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new apiError(401, "PLAYLIST NOT FOUND.");

    // delete the playlist
    await playlist.deleteOne();

    return res
            .status(200)
            .json(new apiResponse(200, {}, "Playlist deleted successfully."))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!(name?.trim() || description?.trim())) throw new apiError(400, "WITHOUT ANY NEW NAME OR DESCRIPTION PLAYLIST CANNOT BE UPDATED.");
    
    //TODO: update playlist
    // validate the user first
    const user = await User.findById(req.isVerifiedUser._id);
    if (!user) throw new apiError(401, "USER IS NOT VERIFIED. PLEASE LOGIN.");

    // find and update the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new apiError(401, "PLAYLIST NOT FOUND.");
    
    // update the playlist
    if (name) playlist.name = name;    
    if (description) playlist.description = description;
    await playlist.save({ validateBeforeSave: false });

    return res
            .status(200)
            .json(new apiResponse(200, playlist, "Playlist updated succcessfully."))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}