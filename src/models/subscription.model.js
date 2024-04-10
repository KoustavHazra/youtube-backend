import { Schema, model } from "mongoose";

const subscriptionSchema = Schema({
    subscriber: {
        type: Schema.Types.ObjectId,  // who is subscribing
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,  // one to whom a "subscriber" is subscribing
        ref: "User",
        required: true
    },
}, {timestamps: true});

export const Subscription = model("Subscription", subscriptionSchema);