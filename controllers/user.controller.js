const {Sequelize,DataTypes,Op}= require('sequelize');
const sequelize= require('../dbConnection');
const validator= require('../util/validators');
const catchAsync= require('../util/catchasync');
const AppError= require('../util/apperror');
const bcrypt= require('bcrypt');
const saltRounds = parseInt(process.env.SALT);
const {v4:uuidv4}= require('uuid');
const syncModels= require('../models/syncmodels');
const moment= require('moment');
const SDC= require('statsd-client');
const sdc= new SDC();
const log4js = require('log4js');
log4js.configure({
	  appenders: { logs: { type: 'file', filename: '/home/ubuntu/logs/webapp.log' } },
	  categories: { default: { appenders: ['logs'], level: 'info' } }
    });
const logger = log4js.getLogger('logs');
let Question,Category,User,Answer
syncModels().then(res=>{
    Question =res.Question,
    Answer= res.Answer,
    User=res.User,
    Category=res.Category
})
const filter=(arr,obj)=>{
  const newObj= Object.keys(obj).reduce((cum,cur)=>arr.includes(cur)?{...cum,[cur]:obj[cur]}:cum,{});
  return newObj;
}
exports.createUser=catchAsync(async (req,res,next)=>{
    const timer = new Date();
    let body=filter(['first_name','username','password','last_name'],req.body);
    if(Object.keys(body).length!==4||body.first_name.length==0||body.last_name.length==0){
        logger.error('Invalid request. Make sure to check that all the required fields are filled')
        next(new AppError(400,'Invalid request. Make sure to check that all the required fields are filled'));
        return;
    }
    if(!validator.validateEmail(body.username)){
        logger.error('Invalid user name')
        next(new AppError(400,'Invalid user name'));
        return;
    }
    if(!validator.validatePassword(body.password)){
        logger.error('Invalid password. Password should be atleast 9 letters')
        next(new AppError(400,'Invalid password. Password should be atleast 9 letters'));
    }
    const dbTimer = new Date();
    const dbUser= await User.findOne({
        where:{
            username:body.username
        }
    })
    if(dbUser){
        logger.error('Email address already exists');
        next(new AppError(400,'Email address already exists'));
        return ; 
    }
    body.password=await bcrypt.hash(body.password,saltRounds);
    body.id=uuidv4();
    const user = await User.create(body);
    sdc.timing('create.user.dbTimer',dbTimer);
    logger.info('created user account');
    sdc.timing('create.user.timer',timer);
    res.status(201).json({
        id:user.id,
        first_name:user.first_name,
        last_name:user.last_name,
        username:user.username,
        account_created:user.account_created,
        account_updated:user.account_updated
    })
});
exports.updateUser=catchAsync(async (req,res,next)=>{
    const timer = new Date();
    if(!req.body.username||req.body.username!=req.user.username){
        logger.error('Please provide valid email  address');
        next(new AppError(400,'Please provide valid email address'));
        return;
    }
    delete req.body.username;
    const filterArray=['first_name','last_name','password'];
    for(key in req.body){
        if(!filterArray.includes(key)){
            logger.error(`Invalid ${key} field`)
            next(new AppError(400,`Invalid ${key} field`));
            return;
        }
        else{
            if(key==='first_name'&&req.body[key].length==0){
                logger.error('Please provide valid first name');
                next(new AppError(400,'Please provide valid first name'));
                return;
            }
            else if(key==='last_name'&&req.body[key].length==0){
                logger.error('Please provide valid last name')
                next(new AppError(400,'Please provide valid last name'));
                return;
            }
            else if(req.body.password&&!validator.validatePassword(req.body.password)){
                logger.error('Password should have 9 chacaters with atleast one lowercase letter, one uppercase letter, one symbol and one number');
                next(new AppError(400,'Password should have 9 chacaters with atleast one lowercase letter, one uppercase letter, one symbol and one number'));
                return;   
            }
            else{
                req.user[key]=req.body[key];
            }
        }
    }
    
    if(req.body.password){
        req.body.password= await bcrypt.hash(req.body.password,saltRounds);
        req.user.password=req.body.password;
    }
    req.user.account_updated=moment().format('YYYY-MM-DD HH:mm:ss');
    const dbTimer = new Date();
    await req.user.save();
    sdc.timing('put.user.dbTimer',dbTimer);
    logger.info('updated user');
    sdc.timing('put.user.timer',timer);
    res.status(204).json({
    });
});
exports.getUserInfo=catchAsync(async (req,res,next)=>{
    const timer = new Date();
    const {id,username,first_name,last_name,account_created,account_updated}=req.user;
    logger.info('Retrieved user account');
    sdc.timing('get.userInfo.timer',timer);
    res.status(200).json({
        id,
        username,
        first_name,
        last_name,
        account_created,
        account_updated
    });
})
exports.getUserById=catchAsync(async (req,res, next)=>{
    const timer = new Date();
    const {id}=req.params;
    const dbTimer = new Date();
    const user=await User.findByPk(id,{
        attributes:[
            'id',
            'first_name',
            'last_name',
            'account_created',
            'account_updated',
            'username'
        ]
    })
    sdc.timing('get.userById.dbTimer',dbTimer);
    if(!user){
        logger.error('No user found');
        next(new AppError(404,'No user found'));
        return;
    }
    logger.info('Retrieved user by id');
    sdc.timing('get.userById.timer',timer);
    res.status(200).json(user)
})