const express=require('express');
const router=express.Router(); //creates a modular, mountable route handler
const verifyToken_middleware=require('../middlewares/middle_auth');
const dashboard_data_query=require('../middlewares/dashboard_pipline');
const rawdata_transform=require('../middlewares/transform_dashboard_rawdata')
const AppError=require('../middlewares/error_handler').AppError
const Case=require('../models/Casedb');
const User=require('../models/userdb');

router.get('/dashboard',verifyToken_middleware, async(req,res)=>{
    try{
        if(req.user.role===`admin`){
            return res.render('./dashboard',{user:req.user,layout:false});
        }else{
            return res.send('You have no right to do so');
        }
    }catch(error){
        console.log(error);
    }
});

router.get('/dashboard_data',verifyToken_middleware, dashboard_data_query, rawdata_transform, async(req,res)=>{
    try{
        if(req.user.role===`admin`){
            
            return res.json(req.data);
        }else{
            return res.send('You have no right to do so');
        }
    }catch(error){
        console.log(error);
    }
})


module.exports=router;