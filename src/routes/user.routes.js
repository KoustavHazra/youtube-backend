import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);  
// the url will become (if the user is coming from /users): https://localhost:8000/api/v1/users/register 
// if the user wants to go for login -- https://localhost:8000/api/v1/users/login 



export default router;