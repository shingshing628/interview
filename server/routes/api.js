const path = require('path');
const express=require('express');
const router=express.Router(); //creates a modular, mountable route handler
const verifyToken_middleware=require(path.join(__dirname,'..','middlewares','middle_auth'));
const {cache,cacheMiddleware}=require(path.join(__dirname,'..','middlewares','adminlist_cache'));
const AppError=require(path.join(__dirname,'..','middlewares','error_handler')).AppError;
const User=require(path.join(__dirname,'..','models','userdb'));
const Case=require(path.join(__dirname,'..','models','casedb'));


router.get('/getuser_info',verifyToken_middleware,async (req,res,next)=>{
    try{
        if(req.user.role===`admin`){
            const keyword=req.query.search || '';
            const user=await User.find({
                $or:[
                    {username:{$regex:keyword,$options:'i'}},      //$options:'i' mean case insensitive
                    {displayname:{$regex:keyword,$options:'i'}}
                ]
            })
            .limit(20)
            .sort({displayname:1})
            .select('-password -_id -role');
            return res.status(200).json(user);
        }else{
            return next(new AppError('FORBIDDEN',403,'No right to do so'));
        }
        
    }catch(err){
        console.log(err)
        return next(new AppError('INTERNAL_SERVER_ERROR', 500, err));
    }
});

router.get('/getcase',verifyToken_middleware,async (req,res,next)=>{
    try{
        if(req.user.role===`admin`){
            const cases=await Case.find({
                status: {$nin:['completed','cancelled']}
            })
            .populate('followed_by')
            .sort({created_at:-1})
            .lean();
            return res.status(200).json(cases);
        }else{
            const cases=await Case.find({
                status: {$nin:['completed','cancelled']},
                request_username:req.user.username
            })
            .populate('followed_by')
            .sort({created_at:-1})
            .lean();
            return res.status(200).json(cases);
        }
    }catch(err){
        console.log(err);
        return next(new AppError('INTERNAL_SERVER_ERROR',500, err));
    }
});

router.get('/searchcase',verifyToken_middleware, async(req,res,next)=>{
    try{
        const keyword=req.query.keyword?.trim()||'';

        if(req.user.role===`admin`){
            if (!keyword){
                return res.status(200).json(null);
            }
            let case_number=Infinity;
            if (keyword.toLowerCase().includes('prs-')){
                const start=keyword.toLowerCase().indexOf('prs-');
                case_number=parseInt(keyword.slice(start+4,start+9),10);
            }  
            const result=await Case.find({
                $or:[
                    {case_no:case_number},
                    {request_user:{$regex:keyword,$options:'i'}},
                    {request_username:keyword},
                    {contact_no:keyword},
                    {department:{$regex:keyword,$options:'i'}},
                    {task_detail:{$regex:keyword,$options:'i'}},
                    {status:keyword}
                ]
            })
            .limit(300)
            .sort({created_at:-1})
            .select('_id case_no request_user department contact_no task_detail status created_at')
            .lean();
            return res.status(200).json(result);
        }else{
            if (!keyword){
                return res.status(200).json(null);
            }
            let case_number=Infinity;
            if (keyword.toLowerCase().includes('prs-')){
                const start=keyword.toLowerCase().indexOf('prs-');
                case_number=parseInt(keyword.slice(start+4,start+9),10);
            }  
            const result=await Case.find({
                $and:[
                    {
                        $or:[
                            {case_no:case_number},
                            {request_user:{$regex:keyword,$options:'i'}},
                            {request_username:keyword},
                            {contact_no:keyword},
                            {department:{$regex:keyword,$options:'i'}},
                            {task_detail:{$regex:keyword,$options:'i'}},
                            {status:keyword}
                        ]
                    },
                    {
                        request_username:req.user.username
                    }
                ]
            })
            .limit(300)
            .sort({created_at:-1})
            .select('_id case_no request_user department contact_no task_detail status created_at')
            .lean();
            return res.status(200).json(result);
        }
    }catch(error){
        console.log(error);
        return next(new AppError("INTERNAL_SERVER_ERROR",500,error));
    }
});

router.get('/adminlist',verifyToken_middleware, cacheMiddleware(), async(req,res,next)=>{
    try{
        if (req.user.role===`admin`){
            const admin=await User.find({
                role:`admin`
            })
            .select('displayname _id');
            cache.set(req.originalUrl,{
                value:admin,
                expiry:Date.now()+(3600*1000)                 //1h
            })
            return res.status(200).json(admin);
        }else{
            return next(new AppError('FORBIDDEN',403,'No right to do so'));
        }
        
    }catch(err){
        console.log(err)
        return next(new AppError('INTERNAL_SERVER_ERROR',500,err));
    }
});

module.exports=router;