const express=require('express');
const jwt=require('jsonwebtoken');
const router=express.Router();
const User=require('../models/userdb');
const RefreshTokendb=require('../models/refreshTokendb');
const bcrypt=require('bcrypt');
const crypto=require('crypto');
const AppError=require('../middlewares/error_handler').AppError
const validateSignup_middleware=require('../middlewares/validate_signup');

//route
router.get('/signup',(req,res)=>{
    try{
        return res.status(200).render('./auth/signup',{csrfToken:req.csrfToken(),user:req.user});
    }catch(err){
        console.log(err);
        return next(new AppError("INTERNAL_SERVER_ERROR", 500, err));
    }
});

router.post('/signup',validateSignup_middleware,async (req,res)=>{
    try{
        const hashpw=await bcrypt.hash(req.body.password,10); //saltrounds range 10-12
        const the_user={
            username:req.body.username.toLowerCase(), 
            password:hashpw, 
            department:req.body.department.trim(),  
            displayname:req.body.displayname.trim(), 
            email:req.body.email.trim(),
            role:'user',
            contact_no:req.body.contact_no.replace(/\s/g,''),
            location:req.body.location.trim() 
        };
        const result=await User.create(the_user);
        return res.status(201).json({error:null});
    } catch(error) {
        console.log(error);
        return res.status(500).json({error:'Something went wrong, please try to resubmit the form or find system owner'});
    }
});

router.get('/login',(req,res)=>{
    try{
        return res.status(200).render('./auth/login',{csrfToken:req.csrfToken(), user:req.user});
    }catch(err){
        console.log(err);
        return next(new AppError("INTERNAL_SERVER_ERROR", 500, err));
    }
});

router.post('/login',async (req,res)=>{
    try{
        const user=await User.findOne({username:req.body.username});
        //check username
        if (!user){
            return res.status(401).json({error:'The username is incorrect'});
        }
        //check password
        const isValid=await bcrypt.compare(req.body.password,user.password); //must put (plainpassword, encryptedpassword)
        if(!isValid){
            return res.status(401).json({error:'The password is incorrect'});
        }
        //assign new access token and refresh token
        const accessToken=jwt.sign({username:user.username, displayname:user.displayname, role:user.role,type:'access'},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'});
        const randomID=crypto.randomBytes(16).toString('hex');
        const refreshToken=jwt.sign({tokenID:randomID, UserId:user._id, type:'refresh'},process.env.REFRESH_TOKEN_SECRET,{expiresIn:'3d'});
        
        res.cookie('jwt', accessToken, {
            httpOnly:true,  //javascript cannot use document.cookie to take the value
            //secure:true,  // only allow HTTPS
            sameSite:'strict',   //prevent CSRF
        }); 
        res.cookie('refreshToken', refreshToken,{
            httpOnly:true,  //javascript cannot use document.cookie to take the value
            //secure:true,  // only allow HTTPS
            sameSite:'strict',   //prevent CSRF
            maxAge: 1000*60*60*24*3 
        });
        
        //create refreshtoken data in database, *schema already set the data would auto delete after 3 days
        await RefreshTokendb.create({
            tokenID:randomID,
            UserId:user._id
        });

        return res.status(200).json({error:null});     //frontend has settle if no error would redirect to homepage
    }catch(error){
        console.log(error);
        //if any error, clear all the cookies
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        //frontend, if error would show the error message in the login page
        return res.status(500).json({error:`Something goes wrong with login the system, please contact the system admin`});
    }
});

router.post('/logout', async(req,res,next)=>{
    try{
        //for every logout, delete all the refresh token record in database, it could enhance security
        const user=jwt.verify(req.cookies.refreshToken,process.env.REFRESH_TOKEN_SECRET);
        const result=await RefreshTokendb.deleteMany({UserId:user.UserId});
        //clear all the cookie
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        return res.status(200).redirect('/user/login');
    }catch(err){
        //no matter what the error is, clear the cookies, it is not important error, no need to handle completely
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        return next(new AppError('LOGOUT_FAILED',500,err));     //pass to error handler
    }
    
})
 
module.exports=router;