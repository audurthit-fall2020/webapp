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
    let body=filter(['first_name','username','password','last_name'],req.body);
    if(Object.keys(body).length!==4||body.first_name.length==0||body.last_name.length==0){
        next(new AppError(400,'Invalid request. Make sure to check that all the required fields are filled'));
        return;
    }
    if(!validator.validateEmail(body.username)){
        next(new AppError(400,'Invalid user name'));
        return;
    }
    if(!validator.validatePassword(body.password)){
        next(new AppError(400,'Invalid password. Password should be atleast 9 letters'));
    }
    const dbUser= await User.findOne({
        where:{
            username:body.username
        }
    })
    if(dbUser){
        next(new AppError(400,'Email address already exists'));
        return ; 
    }
    body.password=await bcrypt.hash(body.password,saltRounds);
    body.id=uuidv4();
    const user = await User.create(body);
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
    if(!req.body.username||req.body.username!=req.user.username){
        next(new AppError(400,'Please provide valid email address'));
        return;
    }
    delete req.body.username;
    const filterArray=['first_name','last_name','password'];
    for(key in req.body){
        if(!filterArray.includes(key)){
            next(new AppError(400,`Invalid ${key} field`));
            return;
        }
        else{
            if(key==='first_name'&&req.body[key].length==0){
                next(new AppError(400,'Please provide valid first name'));
                return;
            }
            else if(key==='last_name'&&req.body[key].length==0){
                next(new AppError(400,'Please provide valid last name'));
                return;
            }
            else if(req.body.password&&!validator.validatePassword(req.body.password)){
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
    await req.user.save();
    res.status(204).json({
    });
});
exports.getUserInfo=catchAsync(async (req,res,next)=>{
    const {id,username,first_name,last_name,account_created,account_updated}=req.user;
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
    const {id}=req.params;
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
    if(!user){
        next(new AppError(404,'No user found'));
        return;
    }
    res.status(200).json(user)
})