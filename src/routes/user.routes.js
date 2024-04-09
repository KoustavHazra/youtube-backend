import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);  
// the url will become (if the user is coming from /users): https://localhost:8000/api/v1/users/register 
// if the user wants to go for login -- https://localhost:8000/api/v1/users/login 

// in post, before registerUser, we passed the middleware "upload" -- which helps to upload files
// adn within that, we mainly want to upload 2 files - avatar and coverImage.
// name is to identify what will be the name of the file, in frontend also we should have the 
// exact same name. Then we mentioned how many files will be uploaded. Here we are taking 1 file,
// but we can take more if we need.

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;