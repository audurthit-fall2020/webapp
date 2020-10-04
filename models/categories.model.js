const sequelize= require("../dbConnection.js");
const {v4} = require('uuid')
const {DataTypes,Model} =require('sequelize');
class Category extends Model{}
Category.init({
    id:{
        type:DataTypes.STRING,
        primaryKey:true
    },
    category:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{sequelize,timestamps:false})
module.exports=Category;