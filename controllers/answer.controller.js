const catchAsync= require('../util/catchasync');
const AppError= require('../util/apperror');
const syncModels= require('../models/syncmodels');
const {v4}= require('uuid');
const moment= require('moment');
const multer= require('multer');
const AWS= require('aws-sdk');
const s3= new AWS.S3();
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
  return cb(
    new AppError(400, 'Not an image! Please upload only images'),
    false
  );
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadImages = upload.single('billAttachment');
exports.uploadToS3=catchAsync(async(req,res,next)=>{
    if(!req.file){
        return next(new AppError(400,"Please choose images to upload"));
    }
    const Bucket = process.env.s3_bucket_name;
    const Key = `${req.user.id}-${Date.now()}.${req.file.mimetype.split("/")[1]}`;
    const Body = req.file.buffer;
    const data = await s3.upload({ Bucket, Key, Body }).promise();
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
    res.status(200).json({
        files:s3File
    })
})
exports.answerQuestion=catchAsync(async(req,res,next)=>{
    if(!req.body.answer_text){
        next(new AppError(400,'Invalid Answer'));
        return;
    }
    const id= req.params.question_id;
    const question= await Question.findByPk(id);
    if(!question){
        next(new AppError(400,'No question found with the given id'));
        return;
    }
    const answer= await Answer.create({
        id:v4(),
        answer_text:req.body.answer_text,
    })
    await question.addAnswer(answer);
    await req.user.addAnswer(answer);
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
    const {question_id,answer_id}= req.params;
    if(!req.body.answer_text){
        next(new AppError(400,'Invalid answer'));
        return;
    }
    const answer=await Answer.findOne({
        where:{
            question_id,
            id:answer_id,
            user_id:req.user.id
        }
    });
    if(!answer){
        next(new AppError(404,'No answer found with given credentials'));
        return;
    }
    answer.answer_text=req.body.answer_text;
    answer.updated_timestamp=moment().format('YYYY-MM-DD HH:mm:ss');
    await answer.save();
    res.status(204).json({

    })
})
exports.deleteAnswer=catchAsync(async (req,res, next)=>{
    const {question_id,answer_id}= req.params;
    const answer=await Answer.findOne({
        where:{
            question_id,
            id:answer_id,
            user_id:req.user.id
        }
    });
    if(!answer){
        next(new AppError(404,'No answer found with given credentials'));
        return;
    }
    const files=await answer.getFiles();
    const params={
        Bucket:process.env.s3_bucket_name
    }
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
    await answer.destroy();
    res.status(204).json({

    })
})
exports.getAnswer=catchAsync(async (req,res,next)=>{
    const {question_id,answer_id:id}= req.params;
    const answer= await Answer.findOne({
        where:{
            question_id,
            id
        },
        include:[
            File
        ]
    });
    if(!answer){
        next(new AppError(404,`No answer found with the given credentials`));
        return;
    }
    res.status(200).json(answer);
})
exports.getAuthAnswerById=catchAsync(async(req,res,next)=>{
    const {answer_id:id,question_id}=req.params;
    const answer=await Answer.findOne({
        where:{
            id,
            question_id,
            user_id:req.user.id
        }
    })
    if(!answer){
        next(new AppError(404,'No question found with given credentials'));
        return ;
    }
    req.answer=answer;
    next();
})
exports.deleteAnswerFile=catchAsync(async(req,res,next)=>{
    const {file_id:id,question_id,answer_id}=req.params;
    const file=await File.findOne({
        where:{
            id,
            answer_id
        }
    })
    if(!file){
        return next(new AppError(404,"File not found"))
    }
    const params={
        Bucket:process.env.s3_bucket_name,
        Key:file.s3_object_name
    }
    await s3.deleteObject(params).promise();
    const metadata=await Metadata.findOne({
        where:{
            id:file.s3_object_name
        }
    })
    await metadata.destroy();
    await file.destroy();
    res.status(204).json({});
})