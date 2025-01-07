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
                    monthly_cases:[
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
                    ],
                    //case completed by each admin this month
                    completed_by:[
                        {
                            $match:{
                                created_at:{
                                    $gte:new Date(new Date().getFullYear(),new Date().getMonth(),1),
                                    $lt:new Date(new Date().getFullYear(),new Date().getMonth()+1,1)
                                },
                                status:"completed"
                            }
                        },
                        {
                            $lookup:{
                                from:"userdbs",
                                localField:"followed_by",
                                foreignField:"_id",
                                as:"admin"
                            }
                        },
                        {
                            $group:{
                                _id:{
                                    id:'$followed_by',
                                    name:"$admin.displayname",
                                },
                                count:{$sum:1}
                            }
                        },
                        {
                            $group:{
                                _id:null,
                                totalCases:{$sum:'$count'},
                                Completedcase_distributed:{$push:{followed_by:'$_id',count:'$count'}}
                            }
                        }
                    ],
                    resolve_within_one_day:[
                        {
                            $match:{
                                duration:{
                                    $gte:0,
                                    $lte:1000*60*60*24
                                },
                                status:`completed`
                            }
                        },
                        {
                            $group:{
                                _id:null,
                                count:{$sum:1}
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