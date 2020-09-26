class AppError extends Error{
    constructor(status, message){
        super(message);
        this.statusCode=status;
        this.isOperational=true;
        Error.captureStackTrace(this,this.constructor);
    }
}
module.exports=AppError;