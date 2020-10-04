const sequelize= require("../dbConnection.js");
const {DataTypes,Model} =require('sequelize');
const createTables=async ()=>{
    try{
        createUserTable();
    }
    catch(err){
        console.log(err.message);
    }
}
exports.createUserTable=async ()=>{
        try{
            
        }
        catch(err){
            console.log(err);
        }
        
}
exports.createQuestionTable=async ()=>{
    try{
        // const query= promisify(connection.query).bind(connection);
        // await query(`create table if not exists questions(id varchar(60),
            // user_id varchar(60) not null,
            // question_text varchar(150) not null,
            // email_address varchar(100) unique not null,
            // catergories varchar(60),
            // created_timestamp datetime not null,
            // updated_timestamp datetime not null,
            // primary key(id))`);
    }
    catch(err){
        console.log(err);
    }
}