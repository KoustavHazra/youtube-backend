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




export { app };