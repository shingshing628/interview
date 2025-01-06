const express=require('express');
const router=express.Router(); //creates a modular, mountable route handler
const verifyToken_middleware=require('../middlewares/middle_auth');
const {cache,cacheMiddleware}=require('../middlewares/adminlist_cache');
const AppError=require('../middlewares/error_handler').AppError
const User=require('../models/userdb');
const Case=require('../models/Casedb');

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
            return res.status(201).json(user);
        }else{
            return res.send('You did not have any right to do that');
        }
        
    }catch(err){
        console.log(err)
        return next(new AppError('FAILED_TO_GET_USER_INFO', 404, err));
    }
});

router.get('/getcase',verifyToken_middleware,async (req,res,next)=>{
    if(req.user.role===`admin`){
        try{
            const cases=await Case.find({
                status: {$nin:['completed','cancelled']}
            })
            .populate('followed_by')
            .sort({created_at:-1})
            .lean();
         
            return res.status(200).json(cases);
        }catch(err){
            return next(new AppError('FAILED_TO_GET_RESOURCE',404, err));
        }
    }else if(req.user.role===`user`){
        try{
            const cases=await Case.find({
                status: {$nin:['completed','cancelled']},
                request_username:req.user.username
            })
            .populate('followed_by')
            .sort({created_at:1})
            .lean();

            return res.status(200).json(cases);
        }catch(err){
            return next(new AppError('FAILED_TO_GET_RESOURCE',404, err));
        }
    }
});

router.get('/searchcase',verifyToken_middleware, async(req,res)=>{
    try{
        if(req.user.role===`admin`){
            const keyword=req.query.keyword?.trim()||'';
          
            if (!keyword){
                return res.json(null);
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
            return res.json(result);
        }else{
            
        }
    }catch(error){
        console.log(error);
        return res.json({err:'unexpected error'});
    }
});

router.get('/adminlist',verifyToken_middleware, cacheMiddleware(), async(req,res)=>{
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
            return res.json(admin);
        }else{
            return res.status(401).send(`you did not have admin right to do that`)
        }
        
    }catch(err){
        console.log(err)
        return res.json({err:'unexpected error'});
    }
});

module.exports=router;