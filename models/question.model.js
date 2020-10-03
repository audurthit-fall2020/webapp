const sequelize= require("../dbConnection.js");
const {v4} = require('uuid')
const {DataTypes,Model, Sequelize, DATE} =require('sequelize');
const Answer = require("./answer.model.js");
const Catergory = require("./categories.model.js");
const User= require('./user.model');
class Question extends Model{}
Question.init({
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
    question_text:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{sequelize,timestamps:false});
module.exports=Question;