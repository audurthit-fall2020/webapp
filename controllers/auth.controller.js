const AppError= require('../util/apperror');
const catchasync = require('../util/catchasync');
const bcrypt= require('bcrypt');
const syncModels= require('../models/syncmodels')
const SDC= require('statsd-client');
const sdc= new SDC();
const log4js = require('log4js');
log4js.configure({
	  appenders: { logs: { type: 'file', filename: '/home/ubuntu/logs/webapp.log' } },
	  categories: { default: { appenders: ['logs'], level: 'info' } }
    });
const logger = log4js.getLogger('logs');
let User
syncModels().then(res=>{
    User=res.User
})
exports.authenticate=catchasync(async (req,res,next)=>{
    let timer= new Date();
    if(!req.headers.authorization||!req.headers.authorization.startsWith('Basic ')){
        logger.error("Invalid authentication method")
        next(new AppError(401,'Unauthenticated!! Invalid authentication method'));
        return;
    }
    const base= req.headers.authorization.split(' ')[1];
    const decoded=new Buffer.from(base,'base64').toString('ascii');
    const [username,password]=decoded.split(":");
    const dbTimer=new Date();
    const dbUser= await User.findOne({
        where:{
            username
        }
    })
    sdc.timing('get.user.time',dbTimer);
    if(!dbUser){
        logger.error(`Unauthenticated!! No user found with given credentials`);
        next(new AppError(401,`Unauthenticated!! No user found with email id ${username}`));
        return ;
    }
    if(!await bcrypt.compare(password,dbUser.password)){
        logger.error(`Unauthenticated!! Invalid password`);
        next(new AppError(401,'Unauthenticated!! Invaid password'));
        return ;
    }
    req.user=dbUser;
    logger.info('Successfully authenticated');
    sdc.timing('authenticate.user.time',timer);
    next();
})