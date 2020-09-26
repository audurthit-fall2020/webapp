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
    if(!validator.validateEmail(body[`email_address`])||!validator.validatePassword(body.password)){
        next(new AppError(400,'Invalid email or password'));
        return;
    }
    const query=promisify(connection.query).bind(connection);
    const existingUsers=await query(`select * from user where email_address=?`,body.email_address);
    console.log(existingUsers);
    if(existingUsers.length>0){
        next(new AppError(400,'Email address already exists'));
        return ; 
    }
    body.account_created=moment().format('YYYY-MM-DD HH:mm:ss');
    body.account_updated=body.account_created;
    body.userpassword=await bcrypt.hash(body.password,saltRounds);
    body.id=uuidv4();
    body=filter(['id','first_name','last_name','userpassword','email_address','account_created','account_updated'],body);
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