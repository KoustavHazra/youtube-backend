import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";


const getAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.getAccessAndRefreshToken();
        const refreshToken = user.generateRefreshToken();

        // refresh token is saved in db -- we will store it in the user object and save it
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        // while saving since all the data in User is going to save, and here we don't have access
        // to all data, we make sure only refresh token is saved by adding { validateBeforeSave: false }
        // in .save() method.

        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new apiError(500, "TOKEN GENERATION ISSUE. PLEASE REACH OUT TO PUZZLES.")
    }
};


const registerUser = asyncHandler( async (req, res) => {
    // get userdata from registration form
    const { username, fullName, email, password } = req.body;

    // validating user input -- we are only checking if the fields are empty
    if ( [username, fullName, email, password].some((field) => field?.trim() === "") ) {
        // .some() method checks through all elements in array and based on the condition
        // in callback returns true / false. Here it will go for all of the field,
        // and if anyone of them returns true, it will get out the loop.
        throw new apiError(400, "Please fill all the fields in registration form.");
    }
    // we can other validations like proper email formatting, password length and complexity

    
    // check if the user is an existing user or not - we'll check username and email
    // to check if the user exists, we can use User model, as the Uuser model is created by mongoose
    // it can check for us if the user already exists or not.
    const existingUser = await User.findOne({  // using await, as it is performing a db call, which takes time
        $or: [{ username }, { email }]  
        // $or is an operator
        // any of the username or email if already exists in db, it will return that
    });

    if (existingUser) throw new apiError(409, "User already exists.")

    
    // get the required files - images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if ( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    // check if the files are uploaded in the local path or not
    if (!avatarLocalPath) throw new apiError(410, "Avatar file is required. Please upload.");
    // if (!coverImageLocalPath) throw new apiError(410, "Cover image is required. Please upload.");


    // upload the files to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);


    // check if files is properly uploaded there or not
    if (!avatar) throw new apiError(411, "Avatar was not uploaded successfully.");
    // if (!coverImage) throw new apiError(411, "Cover image was not uploaded successfully.");


    // create a new user object - create new entry in db
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password
    });

    
    // check if user object is actually created or not
    // remove password and refresh token from response ( as response is going to the frontend, 
    // saying that user is registered ). Also password should be only kept at db and refresh token
    // should only stay in server.
    const newUser = await User.findById(user._id).select(
        "-password -refreshToken"
        // select automatically selects all elements, so have to specifically mention which fields
        // we don't want. To do so, we use -fieldName ..
    );

    if (!newUser) throw new apiError(500, "User not created. Internal server error.");

    return res.status(201).json(
        new apiResponse(201, newUser, "User registered successfully.")
    );

    // login the user

} )


const loginUser = asyncHandler( async (req, res) => {
    // get user data - email and password
    const { username, email, password } = req.body;

    // username based login or email based login
    if ( !username || !email ) throw new apiError(400, "username or email is required.");

    // validate the inputs - check new user or existing user
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!existingUser) throw new apiError(404, "User does not exist.")

    // password checking
    const isPasswordValid = await existingUser.isPasswordCorrect(password);

    if (!isPasswordValid) throw new apiError(409, "Password is invalid. Please put correct password.")

    // create access and refresh token - send them to user -- we created separate method for these.
    const { accessToken, refreshToken } = await getAccessAndRefreshToken(existingUser._id);

    // send cookie
    // while returning the data to user, we just cannot send everything to the frontend - such as password
    // also in the existingUser, we still don't have the refresh token or access token, since it was
    // created before the token were created. 
    // so wither we update the existingUser object or we can do a db query -- it totally depends upon us
    // which way we should go, as db operation can be an expensive operation.
    const loggedInUser = await User.findById(existingUser._id).select(
        " -password -refreshToken "
    );

    const options = {  // adding some security measure for our cookie
        httpOnly: true,
        secure: true
    }

    // return seccess
    return res
            .status(200)
            .cookie( "accessToken", accessToken, options )
            .cookie( "refreshToken", refreshToken, options)
            .json(
                new apiResponse( 
                    200, 
                    { existingUser: loggedInUser, accessToken, refreshToken }, 
                    "User logged in successfully."
                    // we already sent these accessToken and refreshToken through cookie,
                    // but why again sending in the json response ---
                    // because here we are handling those cases where user wants to save these tokens
                    // on their own ( not a good practice ).. but is needed when the user wants to store
                    // it in the local storage or maybe they're building a mobile app and in mobile app
                    // cookies will not be set.
                    )
                )
    } );


const logoutUser = asyncHandler( async (req, res) => {
    // here we don't have the access to anything like we were having in register or login
    // as in those scenarios we were getting data from req.body.
    // Here to get some data, basically to logout the user we will build a middleware
    // the only thing this middleware will do is let us know if the user is logged in or not.
    
    // delete the refresh token
    await User.findByIdAndUpdate(
        req.isVerifiedUser._id,
        {
            $set: { refreshToken: undefined }
            // through User we will find the user using req.isVerifiedUser._id, and using $set operator
            // we will delete the refresh token from server
        },
        {
            new: true
            // because of this, in the return response we will get the updated value, where
            // refresh token will be undefined.
        }
    );

    // clear the cookies
    const options = {  // adding some security measure for our cookie
        httpOnly: true,
        secure: true
    }   

    return res
            .status(200)
            .clearCookie( "accessToken", options )
            .clearCookie( "refreshToken", options)
            .json(
                new apiResponse( 
                    200, 
                    "User logged out successfully."
                    )
                )
    } );


export { registerUser, loginUser, logoutUser };



































/*
usually through req.body, we can get all the data. But as in the user routes we have added a middleware, 
it gives us some extra methods. One of them is req.Files, we get from Multer --

Now we will first check if any files are uploaded or not, thus ----> req.files?
then we want the "avatar" file ( as avatar is name we kept for our file ) ----> req.files?.avatar
Now avatar has many properties within it, and we need the first one ----> req.files?.avatar[0]
The first one because if we take it optionally ( ? ), we will get the .path property, which will give us 
the path of the directory where temporiraly our file is kept by Multer ----> req.files?.avatar[0].path

whenever we do these optional chaining, we must check whether the output file is created or not... like
in case of  -----
const coverImageLocalPath = req.files?.coverImage[0]?.path; --- after creating this kinda checkings,
we must put an if block to check the existance of the outout.. thus we added this:

if (!coverImageLocalPath) throw new apiError(410, "Cover image is required. Please upload.");

Actually if we do this method chaining, some unwanted issues might arrive.. such as ---
TypeError: Cannot read properties of undefined (reading '0')

It occurs when we have the coverImage code -- const coverImageLocalPath = req.files?.coverImage[0]?.path;
But we haven't uploaded the cover image. 

So it is better to handle such scenarios with basic if-else, thus we can see what is the proper error.
As we use this code:
let coverImageLocalPath;
    if ( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    Now even if we don't upload cover image, we get the proper error --- 
    if (!coverImageLocalPath) throw new apiError(410, "Cover image is required. Please upload.");

    or if we haven't set any checking, then from this code:: coverImage: coverImage?.url || ""
    our cover image will automatically set as "", and it won't throw any error - which won't
    be stopping the flow.


How Multer is storing the file in our local storage ? That code is written in multer.middleware.js file.


const avatar = await uploadOnCloudinary(avatarLocalPath); -- this code as it is going to save the file in
a cloud env, it will always take time. So it is a good practice, to use "await" in front of it. 
We know that our registerUser is already wrapped with asyncHandler(), which is returning a promise.. which means
it will tackle these kind of scenarios. However sometimes it becomes compulsory to wait for the code to
be executed first and then only move to the next line -- that is the reason why we used "await" here.



we added this line while creating the User object: coverImage: coverImage?.url || "", -- because 
( even though we have checked the coverImage will define=itely be there ), but for some other field,
let's say we haven't checked for it's existance, here we can directly code like if this field 
exists, give the value otherwise give "".




*/