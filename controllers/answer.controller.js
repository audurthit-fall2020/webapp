const catchAsync= require('../util/catchasync');
const AppError= require('../util/apperror');
const syncModels= require('../models/syncmodels');
const {v4}= require('uuid');
const moment= require('moment');
let Question,Category,User,Answer
syncModels().then(res=>{
    Question =res.Question,
    Answer= res.Answer,
    User=res.User,
    Category=res.Category
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
        answer_text:answer.answer_text
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
    await answer.destroy()
    res.status(204).json({

    })
})
exports.getAnswer=catchAsync(async (req,res,next)=>{
    const {question_id,answer_id:id}= req.params;
    const answer= await Answer.findOne({
        where:{
            question_id,
            id
        }
    });
    if(!answer){
        next(new AppError(404,`No answer found with the given credentials`));
        return;
    }
    res.status(200).json(answer);
})