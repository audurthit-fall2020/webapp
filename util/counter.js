const SDC= require('statsd-client');
const sdc= new SDC();
const Counter=(str)=>{
    return (req,res,next)=>{
        sdc.increment(str);
        next();
    }
}
module.exports=Counter;