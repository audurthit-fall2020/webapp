const dotenv= require('dotenv');
dotenv.config({path:"./config.env"});
const sequelize= require('./dbConnection');
const syncModels= require('./models/syncmodels');
const log4js = require('log4js');
log4js.configure({
	  appenders: { logs: { type: 'file', filename: './logs/webapp.log' } },
	  categories: { default: { appenders: ['logs'], level: 'info' } }
    });
const logger = log4js.getLogger('logs');
sequelize.authenticate().then(res=>{
    logger.info('Database connected');
    sequelize.query("SHOW STATUS LIKE 'Ssl_cipher'", { type: sequelize.QueryTypes.SELECT })
   .then((result) => {
       logger.info(`SSL cipher: ${result[0].Value}`);
   }).catch(err=>{logger.error('Not connected to Database via SSL')});
}).catch(err=>{
    logger.error('Database connection failed')
    console.log('Database connection failed')});
syncModels().then(res=>{
    logger.info('Models sync done');
    console.log('Models Sync done')
}).catch((err)=>{
    logger.fatal('Database models sync failed');
})
const app= require('./app');
const server=app.listen(process.env.PORT||5000,()=>{
    logger.info('server started');
    console.log(`server started on port ${process.env.PORT}`);
})