const express= require('express');
const app=express();
app.use("*",(req,res,next)=>{
    res.status(404).json({
        message:`${req.originalUrl} is found on this server`
    })
})
module.exports=app;