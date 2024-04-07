import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = Schema(
    {
        videoFile: {
            type: String,  // cloudinary url
            required: true
        },
        thumbnail: {
            type: String,  // cloudinary url
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,  // video length will come from cloudinary
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    }, 
    { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video", videoSchema);