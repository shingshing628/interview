const path = require('path');
const AppError=require(path.join(__dirname,'.','error_handler')).AppError;
const cache=new Map();

const cacheMiddleware=()=>{                         //get adminlist cache
    return (req,res,next)=>{
        try{
            const key=req.originalUrl;
            if(key!=='/api/adminlist'){
                return next(new AppError(`INVALID_KEY_ON_CACHE`, 400, 'The key should be /api/adminlist'))
            }
            const cachedData=cache.get(key);
            if (cachedData&&cachedData.expiry>Date.now()){
                return res.json(cachedData.value);
            }
            return next();
        }catch(error){
            console.log(error);
            return next(new AppError(`FAILED_TO_CACHE`, 500, error));
        }
    }
};
module.exports={cache,cacheMiddleware};
