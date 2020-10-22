const sequelize= require("../dbConnection.js");
const {v4} = require('uuid')
const {DataTypes,Model, Sequelize, DATE} =require('sequelize');
class File extends Model{}
File.init({
    id:{
        type:DataTypes.STRING,
        primaryKey:true
    },
    s3_object_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    created_date:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }
},{sequelize,timestamps:false})
module.exports=File;