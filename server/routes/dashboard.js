const express=require('express');
const router=express.Router(); //creates a modular, mountable route handler
const verifyToken_middleware=require('../middlewares/middle_auth');
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
        console.log(error)
    }
});



module.exports=router;