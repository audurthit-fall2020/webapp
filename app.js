const express= require('express');
const app=express();
const globalErrorHandler= require('./util/globalErrorHandler');
const userRouter=require('./routes/user.routes.js');
const questionRouter= require('./routes/question.routes');
const answerRouter= require('./routes/answer.routes');
const allQuestionsRouter= require('./routes/allQuetions.router');
const AppError= require('./util/apperror');
const SDC= require('statsd-client');
const sdc= new SDC();
const log4js = require('log4js');
log4js.configure({
	  appenders: { logs: { type: 'file', filename: './logs/webapp.log' } },
	  categories: { default: { appenders: ['logs'], level: 'info' } }
    });
const logger = log4js.getLogger('logs');
app.use(express.json({ limit: "10kb" }));
app.use("/v1/user",userRouter);
app.use("/v1/question",questionRouter);
app.use("/v1/question/:question_id/answer",answerRouter);
app.use("/v1/questions",allQuestionsRouter);
app.use("/v1/health",(req,res,next)=>{
    res.status(200).json({
        status:'success'
    })
});
app.use(globalErrorHandler);
app.use("*",(req,res,next)=>{
    res.status(404).json({
        message:`${req.originalUrl} is not found on this server`
    })
})
module.exports=app;