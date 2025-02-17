const mongoose=require('mongoose');
const path = require('path');
const autoincrementfactory=require('mongoose-sequence');
const Schema=mongoose.Schema;
const AppError=require(path.join(__dirname,'..','middlewares','error_handler')).AppError;
const AutoIncrement=autoincrementfactory(mongoose);

const action_logdb=new Schema({
    action:{
        type:String,
        required:true
    },
    action_at:{
        type:Date,
        default:Date.now
    },
    action_by:{
        type:String,
        required:true
    }
});

const casedb=new Schema({
    case_no:{
        type:Number,
        unique:true
    },
    request_user:{                                       //it stores the display name of user, normally for guest 
        type:String,
        required:true,
        maxlength:[1000,'Request user name cannot exceed 1000 characters'],
    },
    /*it store the username that has registered in the system, foreign key for viewing current record for user but not required
    not neccessary for ref because populate is useless*/
    request_username:{                                   
        type:String,
        maxlength:[200,'Request user name cannot exceed 200 characters'],
    },
    status:{
        type:String,
        enum:['pending', 'in progress', 'on hold','completed', 'cancelled'],  //in fact, just pending, in progress and completed is used
        default:'pending'  
    },
    urgency:{
        type:String,
        enum:['low','mid','high'],
        default:'low'
    },
    /* 
    isolate the relation between user and their information in each case, 
    it is not populate from userdb because each case should has their own history and should not be updated after user change has profile in future.
    but modify in following the case(e.g. sometime contact no. temporary changed for user) is neccessary. 
    
    Problem: redundant data.
    */
    department:{
        type:String,
        maxlength:[1000,'department should not be more than 1000 characters'],
        required:true
    },
    contact_no:{
        type:String,
        minlength:[8,'the contact number should be 8 characters'],
        maxlength:[8,'the contact number should be 8 characters'],
        required:true
    },
    location:{
        type:String,
        required:true,
        maxlength:[1000,'location cannot exceed 1000 characters']
    },
    task_detail:{                                           
        type:String,
        required:true,
        maxlength:[1000,'Task detail cannot exceed 1000 characters']
    },
    action_log:[action_logdb],
    created_at:{
        type:Date,
        default:Date.now
    },
    completed_at:{
        type:Date,
        default:null
    },  
    followed_by:{
        type:Schema.Types.ObjectId,
        ref:'userdb',
    },
    summary:{
        type:String,
        maxlength:[1000,'Summary cannot exceed 1000 characters'],
    },
    duration:{            
        type:Number,           //in mins
        required:true,
        min:0,
        default:0
    }
 
});
casedb.pre('findOneAndUpdate',async function(next){
    try{
        const update=this.getUpdate();   //get what you would like to update
        const query=this.getQuery();      //return the _id and __v that you would like to update
        const doc=await this.model.findOne({_id:query._id});
        
        if(!doc){
            throw new Error('document not found');
        }else{
            if(doc.__v!=query.__v){
                return next(new AppError('CONCURRENT_UPDATE',409,'CONFLICT'))   //concurrent update
            }
        }
        if (update.$set.status==='completed'){
            update.$set.duration=Math.floor((Date.now()-doc.created_at) / 1000*60);
        }
        return next();
    }catch(err){
        return next(err);
    }   
});

casedb.plugin(AutoIncrement,{inc_field:'case_no',start_seq:1});            //auto increment plugin for case_no



module.exports=mongoose.model('casedb', casedb);  //mongodb collection name, the schema