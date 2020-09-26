const { ModernFakeTimers } = require("@jest/fake-timers");
const connection= require("../dbConnection.js");
const promisify = require('util').promisify;
const createTables=async ()=>{
    try{
        await createUserTable();
    }
    catch(err){
        console.log(err.message);
    }
}
const createUserTable=async ()=>{
    const query = promisify(connection.query).bind(connection);
        try{
            await query(`create table if not exists user(id varchar(60),
            first_name varchar(40) not null,
            last_name varchar(40) not null,
            email_address varchar(100) unique not null,
            userpassword varchar(100) not null,
            account_created datetime not null,
            account_updated datetime not null,
            primary key(id))`);
        }
        catch(err){
            console.log(err);
        }
        
}
module.exports= createTables;