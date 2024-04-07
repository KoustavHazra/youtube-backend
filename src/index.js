// require('dotenv').config({ path: "./env"});  -- not good for code consistency, new version below
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT;

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log(`FOUND SOME ERRORS BEFORE SETTING UP CONNECTION WITH DB :: ${error}`);
        throw error;
    })
    app.listen( PORT || 8000 , function() {
        console.log(`⚙️  Server is running at port :: ${PORT}`);
    })
})
.catch((err) => {
    console.log(`ERROR WHILE CONNECTING TO DB :: ${err}`);
})