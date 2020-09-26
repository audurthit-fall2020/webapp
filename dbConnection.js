const mysql= require('mysql');
const connection= mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DN_PORT,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DATABASE
})
module.exports=connection;