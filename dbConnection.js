const {Sequelize}= require('sequelize');
const moment= require('moment');
let sequelize;
const connect=()=>{
     sequelize= new Sequelize({
        dialect:"mysql",
        host:process.env.DB_HOST,
        port:process.env.DB_PORT,
        username:process.env.DB_USERNAME,
        password:process.env.DB_PASSWORD,
        database:process.env.DATABASE,
        timezone: '-04:00',
        logging:false,
        dialectOptions:{
            typeCast: function (field, next) { // for reading from database
                if (field.type === 'DATETIME') {
                  return moment(field.string()).format("YYYY-MM-DDTHH:mm:ss")
                }
                return next();
            }
        }
        
    
    })
    return sequelize;
}
module.exports=connect();