const sequelize= require("../dbConnection.js");
const {v4} = require('uuid')
const {DataTypes,Model, Sequelize, DATE} =require('sequelize');
const Question = require("./question.model.js");
class Catergory extends Model{}
Catergory.init({
    id:{
        type:DataTypes.STRING,
        defaultValue:v4(),
        primaryKey:true
    },
    category:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{sequelize,timestamps:false})
// Catergory.belongsToMany(Question,{through:'QuestionCategories'})
// Catergory.sync().catch(err=>console.log(err));
module.exports=Catergory;