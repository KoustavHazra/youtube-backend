Summary of this project:

This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have. I am building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more.


UPDATES ::

1. in user.controller.js, while checking existing user, make checking of username and email separate. So that we can say explicitely if the username is already taken or email already used.

2. create fixed status code for every error sent to user. Specify user existing error code, password error code ...

3. we can add forgot password in the user-controller file.

4. in user-controller we can add otp based email signup, same thing can be done while updating a new email.

5. in user-controller, while updating avatar and cover image, we need to delete the old one. So need to create a new utility file for it.

6. Add a separate dislike button. 