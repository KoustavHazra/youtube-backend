import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true  
            // this is used when we want to make any field searchable in an optimized way
            // we make index: true -- this helps in database searching operations in a faster way.
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true 
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true
        },
        password: {
            // type: String,  // should not store the password in raw string in db, it is not secured.
            type: String,
            required: [true, 'Password is required']
        },
        avatar: {
            type: String,  // we will get a url from cloudinary 
            required: true
        },
        coverImage: {
            type: String,  // we will get a url from cloudinary 
            // required: true
        },
        refreshToken: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
                required: true
            }
        ]
    }, 
    { timestamps: true }
);


// method to encrypt the password while saving to db
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// method to check the string password is same with the saved encrypted password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
    // password is the user entered password.
    // this.password is the encrypted password from the above .pre() method.
};


// method to generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};


// method to generate refresh token
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};


export const User = model("User", userSchema);





/*
userSchema.pre("save", () => {});  // while using callback inside "pre()", do not use the 
arrow function since it doesn't have the access to "this" keyword. 
Thus it is written as : userSchema.pre("save", function() {});

Also as these pre() is an encryption method so it takes some time to execute, thus we should be making
it an async function.

And as these are working as a middleware, we must add "next" as a param because after this operation
is completed, at the end the next should be called once , means the next function will know that 
this process is done and thus the next process will start.

------------------------------------------------------------------

if we keep the code like this ----

userSchema.pre("save", async function (next) {
    this.password = bcrypt.hash(this.password, 10);
    next();
});

Everytime the user updates or saves anything in his/her profile, this method will automatically run since
it has the access to all the fields.
But it should be like only if we update the password field, this code should work. Otherwise it shouldn't.

Thus, we add a condition before it ----

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
});

In this code, if "password" is not modified, it will not go to encrypt the password and directly
go to next().

--------------------------------------------------------------------


*/