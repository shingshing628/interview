const mongoose=require('mongoose');
const connectDB=async ()=>{
    try{
        mongoose.set('strictQuery',false); //handles query filters that include fields not defined in the schema is allowed
        const conn=await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database Connected:'+ conn.connection.host);
    } catch (err) {
        console.log('Database could not be connected, error: '+err);
    }
}

module.exports=connectDB;  