const {Sequelize,DataTypes,Op}= require('sequelize');
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
exports.postQuestion=catchAsync(async (req,res,next)=>{
    if(!req.body.question_text){
        next(new AppError(400,'Invalid Question, please submit a valid question'));
        return;
    }
    const question= await Question.create({
        id: v4(),
        question_text:req.body.question_text
    });
    // console.log(question);
    let categories=req.body.categories?req.body.categories:[];
    if(categories&&categories.length>=1){
        for(cat of categories){
            if(!cat.category){
                await question.destroy();
                next(new AppError(400,'Invalid Categories'))
                return ;
            }
        }
        categories=await Promise.all(categories.map(async elm => {
            let category=await Category.findOne({
                where:{
                    category:elm.category
                }
            });
            if(!category){
                category= await Category.create({
                    id:v4(),
                    category:elm.category
                })
            }
            await question.addCategory(category);
            return category;
        }))
    }
    await req.user.addQuestion(question);
    res.status(200).json({
        question_id:question.id,
        question_text:question.question_text,
        created_timestamp:question.created_timestamp,
        updated_timestamp:question.updated_timestamp,
        user_id:req.user.id,
        categories,
        answers:[]
    })
});
exports.deleteQuestion=catchAsync(async (req,res,next)=>{
    const {question_id}= req.params;
    const question= await Question.findOne({
        where:{
            id:question_id,
            user_id:req.user.id
        }
    });
    if(!question){
        next(new AppError(404,'No question found with given by given credentials'));
        return;
    }
    const count= await question.countAnswers();
    if(count){
        next(new AppError(400,`Question can't be deleted, since it has more than one answers `))
        return;
    }
    await question.destroy();
    res.status(204).json({});
})
exports.updateQuestion=catchAsync(async (req,res,next)=>{
    const {question_id:id}=req.params;
    const question= await Question.findOne({
        where:{
            id,
            user_id:req.user.id
        }
    })
    if(!question){
        next(new AppError(404,'No question found with given credentials'));
        return ;
    }
    const categories=req.body.categories;
    if(categories){
        for(cat of categories){
            if(!cat.category){
                next(new AppError(400,'Invalid Categories'));
                return;
            }
        }
        await question.setCategories([]);
        await Promise.all(categories.map(async elm => {
            let category=await Category.findOne({
                where:{
                    category:elm.category
                }
            });
            if(!category){
                category= await Category.create({
                    id:v4(),
                    category:elm.category
                })
            }
            await question.addCategory(category);
            return category;
        }));
    }
    if(req.body.question_text){
        question.question_text=req.body.question_text;
    }
    question.updated_timestamp=moment().format('YYYY-MM-DD HH:mm:ss');
    await question.save();
    res.status(204).json({})
})
exports.getAllQuestions= catchAsync(async (req,res,next)=>{
    const questions=await Question.findAll({
        include:[{
            model:Category,
            through:{attributes:[]}
        },Answer]
    })
    res.status(200).json(questions)
})