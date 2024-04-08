class apiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 
        // setting status code less than 400 because it is a reponse we are trying to send
        // if it was any error, then it should have been > 400. It's basically a good practice.
    };
};

export { apiResponse };