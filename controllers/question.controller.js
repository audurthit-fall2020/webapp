const {Sequelize,DataTypes,Op}= require('sequelize');
const catchAsync= require('../util/catchasync');
const AppError= require('../util/apperror');
const syncModels= require('../models/syncmodels');
let Question,Category,User,Answer
syncModels().then(res=>{
    Question =res.Question,
    Answer= res.Answer,
    User=res.User,
    Category=res.Category
})
exports.postQuestion=catchAsync(async (req,res,next)=>{
    const question= await Question.create({
        question_text:req.body.question_text
    });
    // console.log(question);
    let categories=req.body.categories;
    categories=await Promise.all(categories.map(async elm => {
        let category=await Category.findOne({
            where:{
                category:elm.category
            }
        });
        if(!category){
            category= await Category.create({
                category:elm.category
            })
        }
        // console.log(await question.countCategory());
        await question.addCategory(category);
        return category;
    }))
    await req.user.addQuestion(question);
    res.status(200).json({
        ...question,categories
    })
})