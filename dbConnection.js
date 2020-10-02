const {Sequelize}= require('sequelize');
module.exports=()=>{
    const sequelize= new Sequelize({
        dialect:"mysql",
        host:process.env.DB_HOST,
        port:process.env.DB_PORT,
        username:process.env.DB_USERNAME,
        password:process.env.DB_PASSWORD,
        database:process.env.DATABASE
    })
    return sequelize;
}