import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { FILE_LIMIT } from "./constants.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


/*
SETTING UP THE EXPRESS APP ::
*/

// setting up how much data can be sent at a time through a form
app.use(express.json({ FILE_LIMIT }));  // express.json() is for parsing application/json in our app

// setting up how much data can be sent at a time through an URL
app.use(express.urlencoded({ extended: true, FILE_LIMIT }))  // for parsing application/x-www-form-urlencoded

// sometimes we want to store some data like image or pdf, and we want to store them in a folder
// thus the public folder is built, to store the data.
app.use(express.static("public"));

// this one is used to get the acceess of the broswer's cookie from the server and perform CRUD
// operations on it.
app.use(cookieParser());


// routes import
import userRoute from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// routes decleration
app.use("/api/v1/users", userRoute);  // anytime user goes to /users, they will be redirected to userRoute router.
// can't use app.get() here as in one file only we will be writing apps and controllers both while using .get()
// but since router is in other directory, to bring it here we will be needing middleware, hence we are using .use()
// /api/v1 are just to show that version 1 API is being used. If later we change to version 2, then it will be /api/v2 ...

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);


export { app };