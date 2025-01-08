const AppError=require('./error_handler').AppError
const Case=require('../models/Casedb');

const dashboard_data_query=async (req,res,next)=>{
    try{
        if(req.user.role==='admin'){
            const rawdata=await Case.aggregate([
                {   //to optimize the performance, i assume that all the cases would be completed within 2 years
                    $match:{
                        created_at:{
                            $gte:new Date(new Date().getFullYear()-2,new Date().getMonth(),1),
                            $lte:new Date()
                        },
                        status:{$in:["pending","in progress","completed"]}
                    }
                },
                {
                    $facet:{
                        //last four month completed cases summary
                        last_four_month_cases:[
                            {
                                $match:{
                                    created_at:{
                                        $gte:new Date(new Date().getFullYear(),new Date().getMonth()-4,1),
                                        $lt:new Date(new Date().getFullYear(),new Date().getMonth(),1)
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
                            },
                            {
                                $project:{
                                    _id:0,
                                    totalCases:"$totalCases",
                                    statusBreakdown:"$statusBreakdown"
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
                            },
                            {
                                $project:{
                                    _id:0,
                                    totalCases:"$totalCases",
                                    Completedcase_distributed:"$Completedcase_distributed"
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
                            {$count:'total'}
                        ],
                        openTicket:[
                            {
                                $match:{
                                    status:{$in:['pending','in progress']}
                                }
                            },
                            {$count:'total'}
                        ],
                        more_than_four_hours:[
                            {
                                $match:{
                                    status:{$in:['pending','in progress']},
                                    created_at:{
                                        $lt:new Date(Date.now()-(1000*60*60*4))
                                    }
                                }
                            },
                            {$count:'total'}
                        ],
                        TodayTicket:[
                            {
                                $match:{
                                    created_at:{
                                        $gte:new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()),
                                        $lt:new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+1)
                                    }
                                }
                            },
                            {$count:'total'}
                        ]
                    }
                }
                ]);
                req.rawdata=rawdata;
                return next();
        }else{
            return next(new AppError('UNAUTHORIZED',401,'You are not authorized to do so'));
        }
    }catch(err){
        console.log(err);
        return next(new AppError(`Error on getting dashboard raw data`, 400, err));
    }
}


module.exports=dashboard_data_query;