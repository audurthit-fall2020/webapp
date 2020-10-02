const User= require('./user.model');
const Question= require('./question.model');
const Answer= require('./answer.model');
const Category=require('./categories.model');
const sequelize= require('../dbConnection');
const { connect } = require('../app');
module.exports=async()=>{
    try{
        // User
        User.hasMany(Question,{
            foreignKey:'user_id'
        })
        // Question.belongsTo(User);
        User.hasMany(Answer,{
            foreignKey:'user_id'
        })
        // QUestion
        Question.hasMany(Answer,{
            foreignKey:'question_id'
        })
        // Category
        Category.belongsToMany(Question,{through:'QuestionCategories'})
        Question.belongsToMany(Category,{through:'QuestionCategories'});
        // Answer
        // Answer.belongsTo(Question);
        // Answer.belongsTo(User);
        // await User.sync();
        // await Question.sync();
        // await Answer.sync();
        // await Category.sync();
        await sequelize.sync()
        const cat= await Category.create({
            category:'abc'
        });
        console.log(await cat.getQuestions());
        return {
            User,Question,Category,Answer
        }
    }
    catch(err){
        console.log(err);
    }
}