import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message

    // check db connection
    const dbConnected = mongoose.connection.readyState;

    if (dbConnected === 0) return res.status(500).json(new apiError(500, "Inernal Server Error"));
    
    if (dbConnected === 1) return res.status(200).json(new apiResponse(200, "Health check passed"));

    if (dbConnected === 2) return res.status(500).json(new apiError(500, "Inernal Server Error"));
    
})

export {
    healthcheck
    }
    