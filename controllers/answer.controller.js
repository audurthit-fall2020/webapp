const catchAsync= require('../util/catchasync');
const AppError= require('../util/apperror');
const syncModels= require('../models/syncmodels');
const {v4}= require('uuid');
const moment= require('moment');
const multer= require('multer');
const AWS= require('aws-sdk');
const s3= new AWS.S3();
const SDC= require('statsd-client');
const sdc= new SDC();
const log4js = require('log4js');
log4js.configure({
	  appenders: { logs: { type: 'file', filename: './logs/webapp.log' } },
	  categories: { default: { appenders: ['logs'], level: 'info' } }
    });
const logger = log4js.getLogger('logs');
let Question,Category,User,Answer,File,Metadata
syncModels().then(res=>{
    Question =res.Question,
    Answer= res.Answer,
    User=res.User,
    Category=res.Category,
    File=res.File,
    Metadata=res.Metadata
})
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) return cb(null, true);
  logger.error('Not an image! Please upload only images');
  return cb(
    new AppError(400, 'Not an image! Please upload only images'),
    false
  );
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadImages = upload.single('billAttachment');
exports.uploadToS3=catchAsync(async(req,res,next)=>{
    const timer= new Date();
    if(!req.file){
        logger.error('Please choose images to upload')
        return next(new AppError(400,"Please choose images to upload"));
    }
    const Bucket = process.env.s3_bucket_name;
    const Key = `${req.user.id}-${Date.now()}.${req.file.mimetype.split("/")[1]}`;
    const Body = req.file.buffer;
    const s3Timer= new Date();
    const data = await s3.upload({ Bucket, Key, Body }).promise();
    sdc.timing('upload.s3.timer',s3Timer);
    const dbTimer= new Date();
    const s3File=await File.create({
        id:v4(),
        s3_object_name:data.Key,
        name:data.Key.split(".")[0],
    })
        await req.answer.addFile(s3File);
        const metaParams={
          Bucket,
          Key:data.Key      
        }
        const metadata= await s3.headObject(metaParams).promise();
        metadata.id=Key;
        await Metadata.create(metadata);
        sdc.timing('post.answer.files.timer',dbTimer);
        logger.info('Attached file to answer');
    res.status(200).json({
        files:s3File
    })
    sdc.timing('add.file.timer',timer);
})
exports.answerQuestion=catchAsync(async(req,res,next)=>{
    const timer = new Date();
    if(!req.body.answer_text){
        logger.error('Invalid Answer')
        next(new AppError(400,'Invalid Answer'));
        return;
    }
    const id= req.params.question_id;
    const dbTimer=new Date();
    const question= await Question.findByPk(id);
    if(!question){
        logger.error('No question found with given id');
        next(new AppError(400,'No question found with the given id'));
        return;
    }
    const answer= await Answer.create({
        id:v4(),
        answer_text:req.body.answer_text,
    })
    await question.addAnswer(answer);
    await req.user.addAnswer(answer);
    sdc.timing('post.answer.dbTimer',dbTimer);
    logger.info('Added answer to question');
    sdc.timing('post.answer.timer',timer);
    res.status(200).json({
        answer_id:answer.id,
        question_id:question.id,
        created_timestamp:answer.created_timestamp,
        updated_timestamp:answer.updated_timestamp,
        user_id:req.user.id,
        answer_text:answer.answer_text,
        files:[]
    })
})
exports.updateAnswer=catchAsync(async (req,res, next)=>{
    const timer= new Date();
    const {question_id,answer_id}= req.params;
    if(!req.body.answer_text){
        logger.error('Invalid answer');
        next(new AppError(400,'Invalid answer'));
        return;
    }
    const dbTimer= new Date();
    const answer=await Answer.findOne({
        where:{
            question_id,
            id:answer_id,
            user_id:req.user.id
        }
    });
    if(!answer){
        logger.error('No answer found with given id');
        next(new AppError(404,'No answer found with given credentials'));
        return;
    }
    answer.answer_text=req.body.answer_text;
    answer.updated_timestamp=moment().format('YYYY-MM-DD HH:mm:ss');
    await answer.save();
    sdc.timing('put.answer.dbTimer',dbTimer);
    logger.info('updated answer');
    sdc.timing('put.answer.timer',timer);
    res.status(204).json({

    })
})
exports.deleteAnswer=catchAsync(async (req,res, next)=>{
    const timer= new Date();
    const {question_id,answer_id}= req.params;
    const dbTimer = new Date();
    const answer=await Answer.findOne({
        where:{
            question_id,
            id:answer_id,
            user_id:req.user.id
        }
    });
    if(!answer){
        logger.error('No answer found with given credentials');
        next(new AppError(404,'No answer found with given credentials'));
        return;
    }
    const files=await answer.getFiles();
    sdc.timing('delete.answer.files.dbTimer',dbTimer);
    const params={
        Bucket:process.env.s3_bucket_name
    }
    const s3Timer= new Date();
    await Promise.all(files.map(async (file)=>{
        params.Key=file.s3_object_name;
        await s3.deleteObject(params).promise();
        const metadata=await Metadata.findOne({
            where:{
                id:file.s3_object_name
            }
        })
        await metadata.destroy();
        await file.destroy();
    }))
    sdc.timing('delete.files.s3',s3Timer);
    await answer.destroy();
    logger.info('Deleted Answer');
    sdc.timing('delete.amswer.timer',timer);
    res.status(204).json({

    })
})
exports.getAnswer=catchAsync(async (req,res,next)=>{
    const timer= new Date();
    const {question_id,answer_id:id}= req.params;
    const dbTimer= new Date();
    const answer= await Answer.findOne({
        where:{
            question_id,
            id
        },
        include:[
            File
        ]
    });
    sdc.timing('get.answer.dbTimer',dbTimer);
    if(!answer){
        logger.error('No answer found with given credentials');
        next(new AppError(404,`No answer found with the given credentials`));
        return;
    }
    logger.info('Found answer');
    sdc.timing('get.answer.timer',timer);
    res.status(200).json(answer);
})
exports.getAuthAnswerById=catchAsync(async(req,res,next)=>{
    const timer = new Date();
    const {answer_id:id,question_id}=req.params;
    const dbTimer =  new Date();
    const answer=await Answer.findOne({
        where:{
            id,
            question_id,
            user_id:req.user.id
        }
    })
    sdc.timing('get.answerById.dbTimer',dbTimer);
    if(!answer){
        logger.error('No question found with given credentials');
        next(new AppError(404,'No question found with given credentials'));
        return ;
    }
    req.answer=answer;
    sdc.timing('get.answerById.timer',timer);
    next();
})
exports.deleteAnswerFile=catchAsync(async(req,res,next)=>{
    const timer = new Date();
    const {file_id:id,question_id,answer_id}=req.params;
    const dbTimer = new Date();
    const file=await File.findOne({
        where:{
            id,
            answer_id
        }
    })
    if(!file){
        logger.error('File not found');
        return next(new AppError(404,"File not found"))
    }
    const params={
        Bucket:process.env.s3_bucket_name,
        Key:file.s3_object_name
    }
    const s3Timer= new Date();
    await s3.deleteObject(params).promise();
    const metadata=await Metadata.findOne({
        where:{
            id:file.s3_object_name
        }
    })
    sdc.timing('delete.answer.file.s3Timer',s3Timer);
    await metadata.destroy();
    await file.destroy();
    logger.info('deleted file');
    sdc.timing('delete.answer.file.dbTimer',dbTimer);
    sdc.timing('delete.answer.file.timer',timer);
    res.status(204).json({});
})