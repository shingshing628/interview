const jwt=require('jsonwebtoken');
const User=require('../models/userdb');
const refreshTokendb = require('../models/refreshTokendb');
const AppError=require('./error_handler').AppError

/* 
verify process:
1. check access token and its payload content, also check whether refresh token is valid/expire at the same time 
    1.1 if (both valid) => next()
    1.2 if (refresh token invalid/expire) => redirect to login page
    1.3 if (only access token invalid) => 2.

2. check database whether there are the refresh token ID
    2.1 if found in db => assign a new access token to user
    2.2 if !found in db => redirect to login page 
*/


const verifyToken_middleware= async (req,res,next)=>{
    const access_token=req.cookies.jwt;
    const refresh_token=req.cookies.refreshToken;

    //function to check refreshToken in db and assign new access token
    async function generateAccessToken(tokenID){                   
        try{
            const refreshtoken=await refreshTokendb.findOne({tokenID:tokenID});
            if (!refreshtoken){
                throw new AppError('The session is expired, please login again',401,'Token could not be found in database');
            }
            const user=await User.findById(refreshtoken.UserId);
            req.user={username:user.username, displayname:user.displayname, role:user.role, type:'access'};
            return jwt.sign({username:user.username, displayname:user.displayname, role:user.role, type:'access'},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'});
        }catch(err){
            throw new AppError(`The session is expired, please login again`, 401,`Token verification failed: ${err}`);
        }
    }

    //check access token is it expired and is it valid
    function isTokenExpired(token){
        try{
            const t=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user=t;                            //if above jwt valid, req.user=jwt payload
            return false;
        }catch(err){
            if (err.name==='TokenExpiredError'){
                return true;
            }
            // if the access token is invalid (but not expire), even the refresh token is true, it required user login again 
            throw new AppError(`The session is expired, please login again`, 401,`Token verification failed: ${err}`);
        }
    }

    
    try{
        //if refresh token is expired/not valid/empty, it would throw error
        const refreshToken_payload=jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);

        if(!access_token){                                              // if no access token provided, it would throw error
            throw new AppError(`The session is expired, please login again`, 401,`No access token provided`);                                               
        }

        if (isTokenExpired(access_token)===true){                          //it would also check is it valid token and throw error if not 
            //create new access token to user if refresh token is valid
            const new_accesstoken=await generateAccessToken(refreshToken_payload.tokenID);  
            res.cookie('jwt',new_accesstoken,{
                httpOnly:true,
                sameSite:'strict'
            });                             
        }else{    
            // check the type on the payload, if pass, then verify
            if (req.user.type!='access'){
                throw new AppError(`The session is expired, please login again`, 401,`The token type is incorrect`);
            }
        }
        return next();
    }catch (error){
        console.log(error);
        return res.status(error.status||401).redirect('/user/login');
    }
};


module.exports=verifyToken_middleware;