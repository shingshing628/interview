const AppError=require('./error_handler').AppError
const cache=new Map();

const cacheMiddleware=()=>{                         //get adminlist cache
    return (req,res,next)=>{
        try{
            const key=req.originalUrl;
            const cachedData=cache.get(key);
            if (cachedData&&cachedData.expiry>Date.now()){
                return res.json(cachedData.value);
            }
            next();
        }catch(error){
            console.log(error);
            throw new AppError(`FAILED_TO_CACHE`, 400, error);
        }
    }
};
module.exports={cache,cacheMiddleware};
