const path = require('path');
const express=require('express');
const router=express.Router(); //creates a modular, mountable route handler
const verifyToken_middleware=require(path.join(__dirname,'..','middlewares','middle_auth'));
const dashboard_data_query=require(path.join(__dirname,'..','middlewares','dashboard_pipline'));
const rawdata_transform=require(path.join(__dirname,'..','middlewares','transform_dashboard_rawdata'));
const AppError=require(path.join(__dirname,'..','middlewares','error_handler')).AppError;

router.get('/',verifyToken_middleware,(req,res,next)=>{
    try{
        return res.status(200).redirect('/case/view');
    }catch(err){
        return next(new AppError('INTERNAL_SERVER_ERROR',500,error));
    }
})

router.get('/dashboard',verifyToken_middleware, async(req,res,next)=>{
    try{
        if(req.user.role===`admin`){
            return res.status(200).render('./dashboard',{user:req.user,layout:false});
        }else{
            return next(new AppError('FORBIDDEN',403,'No right to do so'));
        }
    }catch(error){
        //console.log(error);
        return next(new AppError('INTERNAL_SERVER_ERROR',500,error));
    }
});

router.get('/dashboard_data',verifyToken_middleware, dashboard_data_query, rawdata_transform, async(req,res,next)=>{
    try{
        if(req.user.role===`admin`){
            return res.status(200).json(req.data);
        }else{
            return next(new AppError('FORBIDDEN',403,'No right to do so'));
        }
    }catch(error){
        //console.log(error);
        return next(new AppError('INTERNAL_SERVER_ERROR',500,error));
    }
})


module.exports=router;