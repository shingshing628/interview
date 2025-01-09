const User=require('../models/userdb');
const AppError=require('./error_handler').AppError

const handle_complete_action=async (modified_data,jwtuser)=>{
    const user=await User.findOne({username:jwtuser.username}).lean();
    if(user){
        modified_data['followed_by']=user._id;
    }
    modified_data[`status`]=`completed`;
    modified_data[`completed_at`]=new Date();
    return
}


const gather_updatedata_middleware=async (req,res,next)=>{
    try{
        //add new action log would put here
        const new_log=[];                          
        const request_type=req.query.type;         
    
        /* action could be more than one, it may be submitted in array / string,
            need to identitfy the format */
        if (Array.isArray(req.body.action)){       
            req.body.action.forEach((item,index)=>{
                new_log.push({action:item, action_by:req.user.displayname});
            });
        }else if(req.body.action){                
            new_log.push({action:req.body.action, action_by:req.user.displayname});
        }
        
        if (request_type===`complete`){           //auto add 'Case completed' on action log if it is completed by admin
            new_log.push({action:`Case completed`, action_by:req.user.displayname});
        }
                    
        //define updated data
        const modified_data={
            request_user:req.body.request_user,
            department:req.body.department,
            contact_no:req.body.contact_no,
            location:req.body.location,
            task_detail:req.body.task_detail,
            urgency:req.body.urgency,
            summary:req.body.summary, 
            $inc:{__v:1}     
        };
        req.push_log=new_log;
         
        if (req.body.followed_by){                          //if there are input on followed_by, no matter update or remain unchanged
            modified_data['followed_by']=req.body.followed_by;
            modified_data[`status`]=`in progress`;
        }
        if (request_type==='complete'){
            await handle_complete_action(modified_data,req.user);
        }
        
        req.modified_data=modified_data;
        return next();
    }catch(err){
        console.log(err);
        return next(new AppError(`error on gathering update data`, 401, err));
    }  
}
module.exports=gather_updatedata_middleware;