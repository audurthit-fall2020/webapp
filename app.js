const express= require('express');
const app=express();
const globalErrorHandler= require('./util/globalErrorHandler');
const userRouter=require('./routes/user.routes.js');
app.use(express.json({ limit: "10kb" }));
app.use('*',(req,res,next)=>{
    if(req.headers["content-type"]!=='application/json'){
        next(400,'content type should in JSON format!');
        return;
    }
    next();
})
app.use("/v1/user",userRouter);
app.use(globalErrorHandler);
app.use("*",(req,res,next)=>{
    res.status(404).json({
        message:`${req.originalUrl} is not found on this server`
    })
})
module.exports=app;