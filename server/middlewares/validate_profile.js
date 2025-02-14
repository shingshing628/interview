const path = require('path');
const AppError=require(path.join(__dirname,'.','error_handler')).AppError;

const validateProfile_middleware= async (req,res,next)=>{
    
    function validateEmail(str){
        return /^[A-Za-z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
    }
    //return true if contain / or < or >
    function invalidchar(str){
        return /[/<>]/.test(str);
    }
    //only allow 8 digits number
    function valid_conatct_no(num){
        return /^[0-9]{8}$/.test(num);
    }
    //return true if contain < or >
    function invalid_location(str){
        return /[<>]/.test(str);
    }
    try{
        const error_include={};
    
        //validate display name
        if ((req.body.displayname?.trim?.()?.length??0)<1 || (req.body.displayname?.trim?.()?.length??0)>200){
            error_include['displayname_err']="The display name's length should be in range 1 to 200";
        }else if(invalidchar(req.body.displayname)){
            error_include['displayname_err']="The display name should not contain these characters: '<','>','/'";
        }
        //validate department
        if ((req.body.department?.trim?.()?.length??0)<1 || (req.body.department?.trim?.()?.length??0)>200){
            error_include['department_err']="The department length should be in range 1 to 200"
        }else if(invalidchar(req.body.department)){
            error_include['department_err']="The department should not contain these characters: '<','>','/'";
        }
        //validate email
        if (!validateEmail(req.body.email)){
            error_include[`email_err`]=`Please enter a valid email`;
        }
        //validate location
        if ((req.body.location?.trim?.()?.length??0)<1 || (req.body.location?.trim?.()?.length??0)>200){
            error_include['location_err']="The location's length should be in range 1 to 200";
        }else if(invalid_location(req.body.location)){
            error_include['location_err']="The location should not contain these characters: '<','>'";
        }

        //validate conatct_no
        if(!valid_conatct_no(req.body.contact_no.replace(/\s/g,''))){
            error_include['contact_no_err']=`The contact number should be 8 digits number`;
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


module.exports=validateProfile_middleware;