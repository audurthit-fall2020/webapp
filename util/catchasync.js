const catchasync=(fn)=>{
    return (req,res,next)=>fn(req,res,next).catch(err=>console.log(err));
}
module.exports=catchasync;