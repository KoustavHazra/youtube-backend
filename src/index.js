// require('dotenv').config({ path: "./env"});  -- not good for code consistency, new version below
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})

connectDB()