class ApiError extends Error {
    // using a constructor to set which fields to send when the ApiErrors constructor is called
    constructor(statusCode,
        message = 'An error occurred',
        errors = [],
        stack = ""
    ) {
        // overriding the default constructor fields with custom data.
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        // gives the stacktrace of which files have the errors, removed whwn pushing to production.
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError }
