const sequelize= require("../dbConnection.js");
const {v4} = require('uuid')
const {DataTypes,Model, Sequelize, DATE} =require('sequelize');
const Question= require('./question.model');
const Answer = require("./answer.model.js");
class User extends Model{}
User.init({
    id:{
        type:DataTypes.STRING,
        primaryKey:true
    },
    first_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    last_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    account_created:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    account_updated:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }
},{sequelize},{timestamps:false});
// User.hasMany(Question,{
//     foreignKey:'question_id'
// })
// Question.belongsTo(User);
// User.hasMany(Answer,{
//     foreignKey:'user_id'
// })
// Answer.belongsTo(User);
// User.sync().catch(err=>console.log(err));
module.exports=User;