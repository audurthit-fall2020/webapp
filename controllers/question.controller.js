const AWS= require('aws-sdk');
const multer= require('multer');
const catchAsync= require('../util/catchasync');
const AppError= require('../util/apperror');
const syncModels= require('../models/syncmodels');
const {v4}= require('uuid');
const moment= require('moment');
const SDC= require('statsd-client');
const sdc= new SDC();
const log4js = require('log4js');
log4js.configure({
	  appenders: { logs: { type: 'file', filename: '/home/ubuntu/logs/webapp.log' } },
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
const s3=new AWS.S3();
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
exports.uploadImages = upload.single("billAttachment")
exports.uploadToS3=catchAsync(async(req,res,next)=>{
    const timer= new Date();
    if(!req.file){
        logger.error("Please choose images to upload");
        return next(new AppError(400,"Please choose images to upload"));
    }
    
    const Bucket = process.env.s3_bucket_name;
    const Key = `${req.user.id}-${Date.now()}.${req.file.mimetype.split("/")[1]}`;
    const Body = req.file.buffer;
    const data = await s3.upload({ Bucket, Key, Body }).promise();
    const s3Timer = new Date();
    const s3File=await File.create({
        id:v4(),
        s3_object_name:data.Key,
        name:data.Key.split(".")[0],
    })
    sdc.timing('upload.s3.timer',s3Timer);
    const dbTimer= new Date();
    await req.question.addFile(s3File);
    const metaParams={
        Bucket,
        Key:data.Key      
    }
    const metadata= await s3.headObject(metaParams).promise();
    metadata.id=Key;
    await Metadata.create(metadata);
    logger.info('Attached file to question');
    sdc.timing('post.question.files.timer',timer);
    res.status(200).json({
        files:s3File
    })
})
exports.postQuestion=catchAsync(async (req,res,next)=>{
    const timer =  new Date();
    if(!req.body.question_text){
        logger.error('Invalid Question, please submit a valid question');
        next(new AppError(400,'Invalid Question, please submit a valid question'));
        return;
    }
    let categories=req.body.categories?req.body.categories:[];
    if(categories&&categories.length>=1){
        for(cat of categories){
            if(!cat.category){
                logger.error('Invalid Categories');
                next(new AppError(400,'Invalid Categories'))
                return ;
            }
        }
        categories=categories.reduce((acc,cur)=>{
            let str=cur.category.toLowerCase();
            if(!acc.includes(str)){
                acc.push(str);
            }
            return acc;
        },[]);
        const dbTimer = new Date();
        categories=await Promise.all(categories.map(async elm => {
            let category=await Category.findOne({
                where:{
                    category:elm.toLowerCase()
                }
            });
            if(!category){
                category= await Category.create({
                    id:v4(),
                    category:elm.toLowerCase()
                })
            }
            return category;
        }))
    }
    const question= await Question.create({
        id: v4(),
        question_text:req.body.question_text
    });
    await question.addCategories(categories);
    await req.user.addQuestion(question);
    sdc.timing('post.question.dbTimer',dbTimer);
    sdc.timing('post.question.timer',timer);
    log.info('posted question');
    res.status(200).json({
        question_id:question.id,
        question_text:question.question_text,
        created_timestamp:question.created_timestamp,
        updated_timestamp:question.updated_timestamp,
        user_id:req.user.id,
        categories,
        answers:[],
        files:[]
    })
});
exports.deleteQuestion=catchAsync(async (req,res,next)=>{
    const timer = new Date();
    const {question_id}= req.params;
    const dbTimer = new Date();
    const question= await Question.findOne({
        where:{
            id:question_id,
            user_id:req.user.id
        }
    });
    if(!question){
        logger.error('No questions found with given credentials');
        next(new AppError(404,'No question found with given by given credentials'));
        return;
    }
    const count= await question.countAnswers();
    if(count){
        logger.error(`Question can't be deleted, since it has more than one answers`);
        next(new AppError(400,`Question can't be deleted, since it has more than one answers `))
        return;
    }
    const files=await question.getFiles();
    const params={
        Bucket:process.env.s3_bucket_name
    }
    const s3Timer = new Date();
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
    sdc.timing('delete.question.files.timer',s3Timer);
    await question.destroy();
    sdc.timing('delete.question.dbTimer',dbTimer);
    logger.info('Deleted question');
    sdc.timing('delete.question.timer',timer);
    res.status(204).json({});
})
exports.updateQuestion=catchAsync(async (req,res,next)=>{
    const timer = new Date();
    const {question_id:id}=req.params;
    const question= await Question.findOne({
        where:{
            id,
            user_id:req.user.id
        }
    })
    if(!question){
        logger.error('No question found with given credentials');
        next(new AppError(404,'No question found with given credentials'));
        return ;
    }
    let categories=req.body.categories;
    if(categories){
        for(cat of categories){
            if(!cat.category){
                logger.error('Invalid categories');
                next(new AppError(400,'Invalid Categories'))
                return ;
            }
        }
        categories=categories.reduce((acc,cur)=>{
            let str=cur.category.toLowerCase();
            if(!acc.includes(str)){
                acc.push(str);
            }
            return acc;
        },[]);
        const dbTimer = new Date();
        categories=await Promise.all(categories.map(async elm => {
            let category=await Category.findOne({
                where:{
                    category:elm.toLowerCase()
                }
            });
            if(!category){
                category= await Category.create({
                    id:v4(),
                    category:elm.toLowerCase()
                })
            }
            return category;
        }))
        question.setCategories(categories);
    }
    if(req.body.question_text){
        question.question_text=req.body.question_text;
    }
    question.updated_timestamp=moment().format('YYYY-MM-DD HH:mm:ss');
    await question.save();
    sdc.timing('put.question.dbTimer',dbTimer);
    sdc.timing('put.question.timer',timer);
    logger.info('Updated question');
    res.status(204).json({})
})
exports.getAllQuestions= catchAsync(async (req,res,next)=>{
    const timer= new Date();
    const dbTimer= new Date();
    const questions=await Question.findAll({
        include:[{
            model:Category,
            through:{attributes:[]},
        },Answer,{
            model:File,
        }]
    })
    sdc.timing('get.all_questions.dbTimer',dbTimer);
    sdc.timing('get.all_question.timer',timer);
    log.info('Retrived all question');
    res.status(200).json(questions)
})
exports.getQuestionById=catchAsync(async (req,res,next)=>{
    const timer = new Date();
    const dbTime= new Date();
    const  question= await Question.findByPk(req.params.question_id,{
        include:[{
            model:Category,
            through:{attributes:[]}
        },Answer,{
            model:File,
        }]
    });
    if(!question){
        logger.error('No question found with given id');
        next(new AppError(404,'No question found with given ID'));
        return;
    }
    sdc.timing('get.question.dbTimer',dbTimer);
    sdc.timing('get.question.timer',timer);
    log.info('Retrived question');
    res.status(200).json({
        question
    })
})
exports.getAuthQuestionById=catchAsync(async(req,res,next)=>{
    const timer = new Date();
    const dbTimer = new Date();
    const {question_id:id}=req.params;
    const question=await Question.findOne({
        where:{
            id,
            user_id:req.user.id
        }
    })
    if(!question){
        logger.error('No question found with given credentials');
        next(new AppError(404,'No question found with given credentials'));
        return ;
    }
    req.question=question;
    sdc.timing('get.questionAuthById.dbTimer',dbTimer);
    sdc.timing('get.questionAuthById.timer',timer);
    log.info('Retrived question');
    next();
})
exports.deleteQuestionFile=catchAsync(async(req,res,next)=>{
    const timer = new Date();
    const {file_id:id,question_id}=req.params;
    const file=await File.findOne({
        where:{
            id,
            question_id,
        }
    });
    if(!file){
        logger.error('File not found')
        return next(new AppError(404,"File not found"))
    }
    const params={
        Bucket:process.env.s3_bucket_name,
        Key:file.s3_object_name
    }
    const s3Timer = new Date();
    await s3.deleteObject(params).promise();
    sdc.timing('delete.question.files',s3Timer);
    const dbTimer = new Date();
    const metadata=await Metadata.findOne({
        where:{
            id:file.s3_object_name
        }
    })
    await metadata.destroy();
    await file.destroy();
    sdc.timing('delete.question.files.dbTimer',dbTimer);
    logger.info('deleted file attched to question');
    sdc.timing('delete.question.files.timer',timer);
    res.status(204).json({});
})