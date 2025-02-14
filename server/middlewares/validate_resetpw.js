const path = require('path');
const User=require(path.join(__dirname,'..','models','userdb'));
const AppError=require(path.join(__dirname,'.','error_handler')).AppError;
const bcrypt=require('bcrypt');

const validatePw_middleware= async (req,res,next)=>{
    async function comparePw(current_pw){
        const pw=await User.findOne({username:req.user.username}).select('password').lean();
        const result=await bcrypt.compare(current_pw, pw.password);
        return result
    }
    
    function validpassword(str){
        return /^[A-Za-z0-9!@#$%^&*()_+-=\[\]{}|:;,.?]*$/.test(str);
    }
    try{
        const error_include={};
        //validate current password
    
        if(!await comparePw(req.body.current_pw??'')){
            error_include[`currpw_err`]=`Your password is wrong`;
        }

        //validate password length
        if ((req.body.new_pw?.length??0) <8){
            error_include[`newpw_err`]=`Your password should be more than or equal to 8 characters`;
        }else if(req.body.new_pw.length>16){
            error_include[`newpw_err`]=`Your password should be less than or equal to 16 characters`;
        }else if(!validpassword(req.body.new_pw)){
            error_include[`newpw_err`]="Your password should only be contain Letters, Numbers and common special chars";
        }

        //validate confirmed password
        if(req.body.new_pw!=req.body.confirm_pw){
            error_include[`confirmpw_err`]="Password did not match with new password";
        }
        
        if(Object.keys(error_include).length===0){                      //if no error
            return next();
        }else{
            //console.log(error_include);
            return res.status(400).json({validate_err:error_include});
        }
    }catch(err){
        console.log(err);
        throw new AppError(`SIGNUP_VALIDATE_ERR_UNEXPECTED`, 500, err);
    }
}


module.exports=validatePw_middleware;