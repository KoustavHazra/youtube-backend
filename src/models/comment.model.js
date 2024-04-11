import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = Schema({
    comment: {
        type: String,
        default: ""
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
    
}, {timestamps: true});

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = model("Comment", commentSchema);