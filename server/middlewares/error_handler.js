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
        case 'LOGOUT_FAILED':                      //logout failed
            return res.redirect('/user/login');
        case 'FAILED_TO_GET_USER_INFO':            //fail to fetch user data 
            return res.status(err.status||500).json({error:'something wrong while fetching the user information'});
        case 'Signup_validate_ERR':               //unexpected fail for signup validation
            return res.status(err.status||500).json({error:'unexpected error for sign up, please contain system admin'});
        case 'FAILED_TO_SUBMIT':                  //failed to create a case
            return res.status(err.status||500).send('validation error');       //should advance, because there are no validation on creating case 
        case 'UNAUTHORIZED':                      //for all unauthorized user
            return res.status(err.status||500).send('unauthorized user');
        default:                                  //all unexpected error or not important error would throw here
            return res.status(500).send('internal server error');
    }
}

module.exports={AppError, ErrorHandler};