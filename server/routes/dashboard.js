const express=require('express');
const router=express.Router(); //creates a modular, mountable route handler
const verifyToken_middleware=require('../middlewares/middle_auth');
const AppError=require('../middlewares/error_handler').AppError
const Case=require('../models/Casedb');
const User=require('../models/userdb');

router.get('/dashboard',verifyToken_middleware, async(req,res)=>{
    try{
        if(req.user.role===`admin`){
            return res.render('./dashboard',{user:req.user,layout:false});
        }else{
            return res.send('You have no right to do so');
        }
    }catch(error){
        console.log(error);
    }
});

router.get('/dashboard_data',verifyToken_middleware, async(req,res)=>{
    try{
        if(req.user.role===`admin`){
            const data=await Case.aggregate([{
                $facet:{
                    //last four month completed cases summary
                    last_four_month_cases:[
                        {
                            $match:{
                                created_at:{
                                    $gte:new Date(new Date().getFullYear(),new Date().getMonth()-4,1),
                                    $lt:new Date(new Date().getFullYear(),new Date().getMonth()-1,1)
                                }
                            }
                        },
                        {
                            $group:{
                                _id:{
                                    year:{$year:"$created_at"},
                                    month:{$month:"$created_at"}
                                },
                                count:{$sum:1}
                            }
                        },
                        {$sort:{"_id.year":-1,"_id.month":-1}}
                    ],
                    //case in this month
                    this_month_cases:[
                        {
                            $match:{
                                created_at:{
                                    $gte:new Date(new Date().getFullYear(),new Date().getMonth(),1),
                                    $lt:new Date(new Date().getFullYear(),new Date().getMonth()+1,1)
                                }
                            }
                        },
                        {
                            $group:{
                                _id:'$status',
                                count:{$sum:1}
                            }
                        },
                        {
                            $group:{
                                _id:null,
                                totalCases:{$sum:'$count'},
                                statusBreakdown:{$push:{status:'$_id',count:'$count'}}
                            }
                        }
                    ]
                }
            }]);
            return res.json(data);
        }else{
            return res.send('You have no right to do so');
        }
    }catch(error){
        console.log(error);
    }
})


module.exports=router;