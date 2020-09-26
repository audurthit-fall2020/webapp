const handler=(err,req,res,next)=>{
    if(err.isOperational){
        if(process.env.NODE_ENV==='development'){
            res.status(err.statusCode).json({
                status:`${err.statusCode}`.startsWith('4')?'Fail':'Error',
                message:err.message,
                stack:err.stack
            })
        }
        else{
            res.status(err.statusCode).json({
                status:`${err.statusCode}`.startsWith('4')?'Fail':'Error',
                message:err.message
            })
        }   
    }
    else{
        res.status(500).json({
            message:"Something went wrong"
        })
    }
}
module.exports=handler;