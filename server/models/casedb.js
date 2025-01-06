const mongoose=require('mongoose');
const autoincrementfactory=require('mongoose-sequence');
const Schema=mongoose.Schema;

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
        unqiue:true
    },
    request_user:{                                       //it stores the display name of user, normally for guest 
        type:String,
        required:true,
        maxlength:[1000,'Request user name cannot exceed 1000 characters'],
    },
    request_username:{                                   //it store the username that has registered in the system, foreign key for viewing current record for user but not required
        type:String,
        maxlength:[200,'Request user name cannot exceed 200 characters'],
    },
    status:{
        type:String,
        enum:['pending', 'in progress', 'on hold','completed', 'cancelled'],
        default:'pending'  
    },
    urgency:{
        type:String,
        enum:['low','mid','high'],
        default:'low'
    },
    department:{
        type:String,
        maxlength:[1000,'department should not be more than 1000 characters']
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

casedb.plugin(AutoIncrement,{inc_field:'case_no',start_seq:1});            //auto increment plugin for case_no

module.exports=mongoose.model('casedb', casedb);  //mongodb collection name, the schema