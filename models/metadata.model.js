const sequelize= require("../dbConnection.js");
const {v4} = require('uuid')
const {DataTypes,Model, Sequelize, DATE} =require('sequelize');
class Metadata extends Model{}
Metadata.init({
    id:{
        type:DataTypes.STRING,
        primaryKey:true
    },
    AcceptRanges:{
        type:DataTypes.STRING,
        allowNull:false
    },
    LastModified:{
        type:DataTypes.DATE,
        allowNull:false
    },
    ContentLength:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    ETag:{
        type:DataTypes.STRING,
        allowNull:false
    },
    VersionId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    ContentType: {
        type:DataTypes.STRING,
        allowNull:false
    },
    ServerSideEncryption:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{sequelize,timestamps:false})
module.exports=Metadata;