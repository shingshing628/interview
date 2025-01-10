class AppError extends Error{
    constructor(message, status=500, originalError=null){
        super(message);
        this.status=status;
        this.originalError=originalError;
        this.isOperational=true;
    }
}
const ErrorHandler=(err,req,res,next)=>{
    console.log(err);
    switch(err.message){
        case 'UNAUTHORIZED':                      //for all unauthorized user
            return res.status(err.status||401).send('unauthorized user');
        case 'FORBIDDEN':                         //for all action without right
            return res.status(err.status||403).send('You have no right to do so');
        case 'LOGOUT_FAILED':                      //unexpected error on logout failed
            return res.status(err.status||500).redirect('/user/login');
        case 'CASE_NOT_FOUND':                     //for all cases that could not found in database
            return res.status(err.status||404).send('Case not found');
        case 'CONCURRENT_UPDATE':                  //all conflict for concurrent case updated
            return res.status(err.status||409).send('Other user has updated the case concurrently, please refresh the page and submit again.')
        case 'INVALID_KEY_ON_CACHE':
            return res.status(err.status||400).send('Invalid key on cache');
        case 'SIGNUP_VALIDATE_ERR_UNEXPECTED':               //unexpected fail for signup validation
            return res.status(err.status||500).json({error:'unexpected error for sign up, please contain system admin'});

        //bad practice, no validation on creating the case and assume error is not validate with mongodb
        case 'FAILED_TO_SUBMIT':                  
            return res.status(err.status||500).send('validation error');      
        //for all unexpected error
        case 'INTERNAL_SERVER_ERROR':                                  
            return res.status(500).send('internal server error');
        default:                                  //all unexpected error or not important error would throw here
            return res.status(500).send('internal server error');
    }
}

module.exports={AppError, ErrorHandler};