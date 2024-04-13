import { Schema, model } from "mongoose";

const playlistSchema = Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, {timestamps: true});

export const Playlist = model("Playlist", playlistSchema);