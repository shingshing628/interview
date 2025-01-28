const path = require('path');
const express=require('express');
const router=express.Router(); //creates a modular, mountable route handler
const verifyToken_middleware=require(path.join(__dirname,'..','middlewares','middle_auth'));
const gather_updatedata_middleware=require(path.join(__dirname,'..','middlewares','gather_updated_data'));
const AppError=require(path.join(__dirname,'..','middlewares','error_handler')).AppError;
const User=require(path.join(__dirname,'..','models','userdb'));
const Case=require(path.join(__dirname,'..','models','casedb'));

router.get('/update',verifyToken_middleware,async (req,res,next)=>{
    try{
        if (req.user.role===`admin`){
            const caseid=req.query.id;
            const data=await Case.findOne({_id:caseid})
            .populate('followed_by','-id -password')
            .lean();   

            if(!data){
                return next(new AppError('CASE_NOT_FOUND',404,'The case could not be found in database'));
            }

            //if status=completed, admin could not be able to submit or modify the existing data, render a new page for completed case is an easy way to handle
            if (data.status===`completed`){
                return res.status(200).render('./case/admin/completed',{user:req.user,layout:false,data:data,caseid:caseid})
            }
            //if status=(pending / in progress), render update page
            return res.status(200).render('./case/admin/update', {csrfToken:req.csrfToken(),user:req.user,layout:false,data:data,caseid:caseid});
        }else if(req.user.role===`user`){
            const caseid=req.query.id;
            const data=await Case.findById(caseid)
            .populate('followed_by','-_id -password')
            .select('-_id -summary')
            .lean();
            if(!data){
                return next(new AppError('CASE_NOT_FOUND',404,'The case could not be found in database'))
            }
            //for user want to view the case did not belong to him
            if (data.request_username!=req.user.username){
                return next(new AppError('FORBIDDEN',403,'No right to do so'));
            }
            // user has no right to update the case, render a page to user that only could view case detail
            return res.status(200).render('./case/user/detail', {user:req.user,layout:false,data:data,caseid:caseid});
        }
    }catch(error){
        return next(new AppError('PAGE_NOT_FOUND', 404, error));
    }
});

router.put('/update', verifyToken_middleware, gather_updatedata_middleware, async (req,res,next)=>{
    try{
        if(req.user.role===`admin`){
            //in order to prevent update concurrently, check version (__v) before update
            const updated=await Case.findOneAndUpdate(
                {_id:req.query.id, __v:req.body.version},
                {
                    $set:req.modified_data,     //gather from middleware
                    $push:{
                        action_log:{
                            $each:req.push_log
                        }
                    }
                },                          
                {new:true}
        );
            //if !update, mostly is because the version is not correct
            if(!updated){
                return next('CONCURRENT_UPDATE',409,'CONFLICT');
            //else if admin choose to complete the case and successfully update the content
            }else if(updated && req.query.type===`complete`){
                return res.status(200).send('The case completed.');
            }
            //otherwise, for just update the content, not the completion of the case
            return res.status(200).redirect(`/case/update?id=${req.query.id}&update=success`)
        }else{
            return next(new AppError('FORBIDDEN',403,'No right to do so'));
        }
    }catch(error){
        return next(new AppError("INTERNAL_SERVER_ERROR",500,error));
    }
});

router.get('/create',verifyToken_middleware,async (req,res,next)=>{
    try{
        if (req.user.role===`admin`){
            return res.status(200).render('./case/admin/create', {csrfToken:req.csrfToken(),user:req.user,layout:false});
        }else if (req.user.role===`user`){
            const user_info=await User.findOne({
                username:req.user.username
            })
            .select('-password -_id -role');
            return res.status(200).render('./case/user/create', {csrfToken:req.csrfToken(),user:user_info,layout:false});
        }
    }catch(error){ 
        return next(new AppError("INTERNAL_SERVER_ERROR",500, error));
    }
});

router.post('/create',verifyToken_middleware,async (req,res,next)=>{
    try{
        if (req.user.role===`admin`){
            const array_action=[{action:'Case created', action_by:req.user.displayname}];
            /* 
            action could be more than one, it may be submitted in array / string,
            need to identitfy the format
            */
            if (Array.isArray(req.body.action)){                       
                req.body.action.forEach((item,index)=>{
                    array_action.push({action:item, action_by:req.user.displayname});
                });
            }else if(req.body.action){                                 
                array_action.push({action:req.body.action, action_by:req.user.displayname});
            }
            
            //if case is assigned to admin
            if(req.body.followed_by){                                   
                array_action.push({action:`The case is assigned to ${req.body.corresponding_person}`,action_by:req.user.displayname});
            }
            const case_data={
                request_user:req.body.request_user,
                request_username:req.body.request_username,
                status:(req.body.followed_by ? `in progress`: "pending"),        //if assigned to admin->in progress, else pending
                urgency:req.body.urgency,
                location:req.body.location,
                department:req.body.department,
                task_detail:req.body.task_detail,
                action_log:array_action,
                contact_no:req.body.contact_no,
                followed_by:(req.body.followed_by? req.body.followed_by:null),     //if assigned to admin->_id, else null
                summary:req.body.summary
            }
            await Case.create(case_data);
            return res.status(201).send('Case created');
        }else if (req.user.role===`user`){
            const case_data={
                request_user:req.body.request_user,
                request_username:req.user.username,
                status:"pending",
                urgency:req.body.urgency,
                location:req.body.location,
                department:req.body.department,
                task_detail:req.body.task_detail,
                action_log: [{action:'Case created', action_by:req.user.displayname}],
                contact_no:req.body.contact_no
            }
            await Case.create(case_data);
            return res.status(201).send('Case created');
        }   
    }catch(error){
        return next(new AppError("INTERNAL_SERVER_ERROR",500, error));
    }
});

router.get('/view',verifyToken_middleware,async (req,res,next)=>{
    try{
        if(req.user.role===`admin`){
            return res.status(200).render('./case/admin/viewing',{csrfToken:req.csrfToken(),user:req.user});
        }else if(req.user.role===`user`){
            return res.status(200).render('./case/user/viewing',{csrfToken:req.csrfToken(),user:req.user});
        }
    }catch(error){
        return next(new AppError("INTERNAL_SERVER_ERROR",500, error));
    }
});

module.exports=router;