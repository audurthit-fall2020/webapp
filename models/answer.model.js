const sequelize= require("../dbConnection.js");
const {v4} = require('uuid')
const {DataTypes,Model, Sequelize, DATE} =require('sequelize');
const Question= require('./question.model');
const User = require('./user.model');
class Answer extends Model{}
Answer.init({
    id:{
        type:DataTypes.STRING,
        primaryKey:true
    },
    created_timestamp:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    updated_timestamp:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    answer_text:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{sequelize,timestamps:false});
// Answer.sync().catch(err=>console.log(err));
module.exports=Answer