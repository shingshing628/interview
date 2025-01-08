
const AppError=require('./error_handler').AppError

/*
raw data= [last_four_month_cases, monthly_cases, completed_by, resolve_within_one_day, openTicket, more_than_four_hours, TodayTicket]

For each raw data, please make sure to handle the array as it could be no element inside it

for detail, console.log(req.rawdata)
*/
class DataTransformer{
    constructor(rawdata){
        this.rawdata=rawdata[0];
        this.data=
            {
                bar_chart_label:[],          
                bar_chart_data:[],
                current_ticket:0,
                morethan_4h:0,
                performance:[{resolve_in1day:0},{percentage:0}],
                today_ticket:0
            }
    }
    getresult(){                                 //error would be handle on middleware
        this.convert_barchart_data();
        this.convert_ticket_data();
        return this.data; 
    }
    convert_barchart_data(){
        let a=0;
        //get last 4 months raw data, it is null if no element in the rawdata array
        const lfmc=this.rawdata?.last_four_month_cases;
        const current_date=new Date();
        /* convert into barchart label format=>e.g. [12,11,10,9]         last four months
           convert into barchart data format =>e.g. [123,85,90,79]       cases per month respectively
        */
        for(let i=1;i<=4;i++){
            this.data.bar_chart_label.push(`${new Date(current_date.getFullYear(),current_date.getMonth()-i).getMonth()+1}`);
            if ((lfmc?.[a]?._id?.month??0)-1===new Date(current_date.getFullYear(),current_date.getMonth()-i).getMonth()&&(lfmc?.[a]?._id?.year??0)===new Date(current_date.getFullYear(),current_date.getMonth()-i).getFullYear()){
                this.data.bar_chart_data.push(lfmc?.[a]?.count??0);
                a+=1;
            }else{
                this.data.bar_chart_data.push(0);
            }
        }
    }
    convert_ticket_data(){
        //if rawdata array is not empty
        if(this.rawdata?.openTicket?.[0]?.total){
            this.data.current_ticket=this.rawdata.openTicket[0].total;
        }
        if(this.rawdata?.more_than_four_hours?.[0]?.total){
            this.data.morethan_4h=this.rawdata.more_than_four_hours[0].total;
        }
        if(this.rawdata?.TodayTicket?.[0]?.total){
            this.data.today_ticket=this.rawdata.TodayTicket[0].total;
        }
        if(this.rawdata?.resolve_within_one_day?.[0]?.total){
            this.data.performance[0].resolve_in1day=this.rawdata.resolve_within_one_day[0].total;
            if(this.rawdata?.monthly_cases?.[0]?.totalCases){
                this.data.performance[1].percentage=(this.data.performance[0].resolve_in1day/this.rawdata.monthly_cases[0].totalCases).toFixed(2)
            }
        }
        
    }


    
}

const rawdata_transform=async (req,res,next)=>{
    try{
        req.data=new DataTransformer(req.rawdata).getresult();
        console.log(req.data)

        
        return next()
    }catch(err){
        console.log(err);
        return next(new AppError(`ERROR_ON_RAWDATA_TRANSFORM`, 400, err));
    }
}


module.exports=rawdata_transform;