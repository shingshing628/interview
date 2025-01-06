const User=require('../models/userdb');
const AppError=require('./error_handler').AppError

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
            $push:{
                action_log:{
                    $each:new_log
                }
            },
            $inc:{__v:1}     
        };
        
    
        if (req.body.followed_by){                          //if there are input on followed_by, no matter update or remain unchanged
            modified_data['followed_by']=req.body.followed_by;
            modified_data[`status`]=`in progress`;
        }
                    
        if (request_type===`complete`){           //if admin completed the case, need to update-> 1. status to completed  2. followed_by to the one who complete the case
            complete_user=await User.findOne({username:req.user.username}).lean();
            if(complete_user){
                modified_data['followed_by']=complete_user._id;
            }
            modified_data[`status`]=`completed`;
        }
        req.modified_data=modified_data;
        return next();
    }catch(err){
        console.log(err);
        return next(new AppError(`error on gathering update data`, 401, err));
    }  
}
module.exports=gather_updatedata_middleware;