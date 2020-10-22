const User= require('./user.model');
const Question= require('./question.model');
const Answer= require('./answer.model');
const Category=require('./categories.model');
const File=require('./file.model');
const Metadata=require('./metadata.model');
const sequelize= require('../dbConnection');
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
        // Question
        Question.hasMany(Answer,{
            foreignKey:'question_id'
        })
        Question.hasMany(File,{
            foreignKey:'question_id',
        })
        Answer.hasMany(File,{
            foreignKey:'answer_id'
        })
        // Category
        Question.belongsToMany(Category,{through:'QuestionCategories'});
        Category.belongsToMany(Question,{through:'QuestionCategories'});
        await sequelize.sync()
        return {
            User,Question,Category,Answer,File,Metadata
        }
    }
    catch(err){
        console.log(err);
    }
}