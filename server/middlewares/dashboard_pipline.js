const path = require('path');
const AppError=require(path.join(__dirname,'.','error_handler')).AppError;
const Case=require(path.join(__dirname,'..','models','casedb'));
const User=require(path.join(__dirname,'..','models','userdb'));
const dashboard_data_query=async (req,res,next)=>{
    try{
        if(req.user.role==='admin'){
            //xdata is workload per admin
            const xdata=await User.aggregate([
                {
                    $match:{
                        role:'admin'
                    }
                },
                {
                    $lookup:{
                        from:"casedbs",
                        let:{admin_id:"$_id"},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $and:[
                                            {$eq:["$followed_by","$$admin_id"]},
                                            {$gte:["$completed_at",new Date(new Date().getFullYear(), new Date().getMonth(),1)]},
                                            {$eq:["$status",'completed']}
                                        ]
                                    }
                                }
                            }
                        ],
                        as:"cases"
                    }
                },
                {
                    $project:{
                        displayname:1,
                        count:{$size:"$cases"}
                    }
                }
            ]);
   
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
                        //completed case in this month
                        monthly_cases:[
                            {
                                $match:{
                                    $or:[
                                        {
                                            created_at:{
                                                $gte:new Date(new Date().getFullYear(),new Date().getMonth(),1),
                                                $lt:new Date(new Date().getFullYear(),new Date().getMonth()+1,1)
                                            },
                                            status:'completed'
                                        },
                                        {
                                            created_at:{
                                                $gte:new Date(new Date().getFullYear(),new Date().getMonth(),1),
                                                $lt:new Date(Date.now()-(1000*60*60*24))     
                                            },
                                            status:{$in:['pending','in progress']}
                                        }
                                    ]
                                }
                            },
                            {$count:'total'}
                        ],
                        resolve_within_one_day:[
                            {
                                $match:{
                                    created_at:{
                                        $gte:new Date(new Date().getFullYear(),new Date().getMonth(),1),
                                        $lt:new Date(new Date().getFullYear(),new Date().getMonth()+1,1)
                                    },
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
                rawdata[0]['workload']=xdata;
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