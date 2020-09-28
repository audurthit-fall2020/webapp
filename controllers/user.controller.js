const connection= require('../dbConnection');
const validator= require('../util/validators');
const catchAsync= require('../util/catchasync');
const AppError= require('../util/apperror');
const bcrypt= require('bcrypt');
const saltRounds = parseInt(process.env.SALT);
const {v4:uuidv4}= require('uuid');
const moment= require('moment');
const promisify=require('util').promisify;
const filter=(arr,obj)=>{
  const newObj= Object.keys(obj).reduce((cum,cur)=>arr.includes(cur)?{...cum,[cur]:obj[cur]}:cum,{});
  return newObj;
}
exports.createUser=catchAsync(async (req,res,next)=>{
    let body=filter(['first_name','email_address','password','last_name'],req.body);
    if(Object.keys(body).length!==4||body.first_name.length==0||body.last_name.length==0){
        next(new AppError(400,'Invalid request. Make sure to check that all the required fields are filled'));
        return;
    }
    if(!validator.validateEmail(body.email_address)){
        next(new AppError(400,'Invalid email address'));
        return;
    }
    if(!validator.validatePassword(body.password)){
        next(new AppError(400,'Invalid password. Password should be atleast 9 letters'));
    }
    const query=promisify(connection.query).bind(connection);
    const existingUsers=await query(`select * from user where email_address=?`,body.email_address);
    if(existingUsers.length>0){
        next(new AppError(400,'Email address already exists'));
        return ; 
    }
    body.account_created=moment().format('YYYY-MM-DD HH:mm:ss');
    body.account_updated=body.account_created;
    body.userpassword=await bcrypt.hash(body.password,saltRounds);
    body.id=uuidv4();
    delete body.password;
    const results=await query(`Insert into user set ?`,{...body});
    res.status(201).json({
        id:body.id,
        first_name:body.first_name,
        last_name:body.last_name,
        email:body.email_address,
        account_created:body.account_created,
        account_updated:body.account_updated
    })
});
exports.updateUser=catchAsync(async (req,res,next)=>{
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
        }
    }

    if(req.body.password){
        req.body.userpassword= await bcrypt.hash(req.body.password,saltRounds);
        delete req.body.password;
    }
    req.body.account_updated=moment().format('YYYY-MM-DD HH:mm:ss');
    const query= promisify(connection.query).bind(connection);
    const results= await query(`update user set ? where email_address=?`,[req.body,req.user.email_address]);
    res.status(204).json({
    });
});
exports.getUserInfo=catchAsync(async (req,res,next)=>{
    const {id,email_address,first_name,last_name,account_created,account_updated}=req.user;
    res.status(200).json({
        id,
        email_address,
        first_name,
        last_name,
        account_created,
        account_updated
    });
})