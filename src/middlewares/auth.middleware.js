import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler( async (req, _, next) => {  // since res is not used here, we just replaced it with _ .
    try {
        // to get the cookies we can get it from req -- as in app.js file
        // we gave it the access of cookies through this line of code -----
        // app.use(cookieParser());
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // there might be no cookies or no access tokens, as we talked in the user controller
        // that user might be using it in a mobile app, where cookies are not accessed
        // in that case user might send us custom header and most common header is "Authorization"
        // and as it comes as Bearer <token> .. we used the replace method to trim it.
    
        if (!token) throw new apiError(401, "Unauthorized request. Please login.");
    
        // now verify this token with jwt
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // made a db call to get the user details with the help of verifiedToken and it's _id.
        const verifiedUser = await User.findById(verifiedToken?._id).select( "-password -refreshToken" );
        
        if (!verifiedUser) throw new apiError(401, "Invalid access token.");
    
        // now that we have our vertified user, we will add it in the req object and pass on, so that
        // it can be accessed while performing logout
        req.isVerifiedUser = verifiedUser;
        next();
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token.");
    }
} );







/*
we kept the name verifyJWT as here we are verifying if the user is logged in or not.

Now while login, we gave the user the access and refresh tokens. So based on those only
we will validate the user --- and if the user has all the correct tokens, in the 
req.body we will pass another object 
*/