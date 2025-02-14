const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const userdb= new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        minlength:[6,'username must at least 6 characters'],
        maxlength:[16,'username must not be more than 16 characters']
    },
    password:{
        type:String,
        required:true,
        minlength:[8,'password must at least 8 charcters'],
        maxlenght:[16,'password not more than 16 characters']
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        maxlength:300
    },
    department:{
        type:String,
        required:true,
        maxlength:300
    },
    displayname:{
        type:String,
        required:true,
        maxlength:300
    },
    /*
    Since it is simple system that only has two roles and few rights. it could just simply assign admin/user in db
    However, it is very poor for extension to add right per roles.
    For advance, create a new table for storing each role contain which rights and join the table. 
    It is too late for me to discover that and time not adequate, just simply naming admin and user to assign right.
    */
    role:{
        type:String,
        required:true,
        maxlength:300
    }, 
    contact_no:{
        type:String,
        required:true,
        maxlength:8
    },
    location:{
        type:String,
        required:true,
        maxlength:300
    }

});

module.exports=mongoose.model('userdb', userdb); //mongodb collection name, the schema