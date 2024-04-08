// two different methods we will be using ::

// using promises
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((error) => next(error))
    }
};

export { asyncHandler };



// -------------------------------------------------------------------------------------------

// using async and try-catch block

// const asyncHandler = (fn) = async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: `ERROR IN ASYNC-HANDLER :: ${error.message}`
//         });
//     }
// };

// -------------------------------------------------------------------------------------------

/*
as this is a higher order function -- which is a function that can take another function as a param
or return another function.
here as we are taking a fn as a param, we need to execute it. But if we write the code like this :

const asyncHandler = (fn) => {}; --- then we won't be able to execute it, as after (fn) => {} -- we are
getting a call back. That's why to execute it, we write it like this :

const asyncHandler = (fn) = () => {};  -- here we have the place to execute the fn, and then get 
to the call back.


To understand how this works :

const asyncHandler = async () => {}  // normally our code will be like this.

const asyncHandler = (func) => {} // if we take a function and want to later to use this function
in another function.. then it will be like --

const asyncHandler = (func) => { () => {} }  // and to make it async --

const asyncHandler = (func) => { async () => {} }  // remove the extra curly braces 

const asyncHandler = (func) => async () => {}  // and now we have our code.

*/