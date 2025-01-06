const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const refreshTokendb= new Schema({
    tokenID:{
        type:String,
        required:true,
        unique:true,
    },
    UserId:{
        type:Schema.Types.ObjectId,
        ref:'userdb',
        required:true
    },
    issuedAt:{
        type:Date,
        default:Date.now,                //Function ref - executes when doc is created
        expires:'3d'
    }
});

module.exports=mongoose.model('refreshToken', refreshTokendb); //mongodb collection name, the schema