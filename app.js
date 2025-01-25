require('dotenv').config();  // load environment variables from a .env into process.env


const express=require('express');
const expressLayout=require('express-ejs-layouts');
//it is used fixed window algorithm
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const csrf=require('csurf');
const cookieParser=require('cookie-parser');
const methodOverride=require('method-override');

//connection to mongodb
const connectDB=require('./server/config/db');
connectDB();

const app=express();
const PORT = 5000 || process.env.PORT;

//Serve static files from public directory
app.use('/',express.static('public'));

//Global middleware
app.use(helmet(require("./server/config/helmet")));     //protect website from attack
app.use(express.json());   // for JSON payloads
app.use(express.urlencoded({extended:true}));  // for getting form data
app.use(methodOverride('_method'));
app.use(cookieParser());      

app.use(csrf({cookie:true}));   //by default get, head, options are ignored, it would automatically generate random secrets for the token
//Set EJS as view engine
app.set('view engine','ejs'); 

//Enable layouts
app.use(expressLayout);
app.set('layout','./layouts/main') //set default layout


//rate limited per minutes
app.use(rateLimit({
    windowMs: 1000*60,
    max: 250,
    message: 'You have submitted too many requests within 1 minute, please tried to use the system a minute later',
    standardHeaders:true, //return rate limit info in the 'RateLimit-*' headers
    legacyHeaders:false  //Disable old format 'X-RateLimit-*' headers
}));

//Route
app.use('/api',require('./server/routes/api'));
app.use('/user',require('./server/routes/user'));
app.use('/case',require('./server/routes/case'));
app.use('/',require('./server/routes/dashboard'));
app.use(require('./server/middlewares/error_handler').ErrorHandler);

app.listen(PORT,()=>{
    console.log(`App listening on port ${PORT}`);
});


