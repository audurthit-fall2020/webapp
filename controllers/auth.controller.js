const AppError= require('../util/apperror');
const catchasync = require('../util/catchasync');
const bcrypt= require('bcrypt');
const syncModels= require('../models/syncmodels')
let User
syncModels().then(res=>{
    User=res.User
})
exports.authenticate=catchasync(async (req,res,next)=>{
    if(!req.headers.authorization||!req.headers.authorization.startsWith('Basic ')){
        next(new AppError(401,'Unauthenticated!! Please make sure to provide correct details'));
        return;
    }
    const base= req.headers.authorization.split(' ')[1];
    const decoded=new Buffer.from(base,'base64').toString('ascii');
    const [username,password]=decoded.split(":");
    const dbUser= await User.findOne({
        where:{
            username
        }
    })
    if(!dbUser){
        next(new AppError(401,`Unauthenticated!! No user found with email id ${username}`));
        return ;
    }
    if(!await bcrypt.compare(password,dbUser.password)){
        next(new AppError(401,'Unauthenticated!! Invaid password'));
        return ;
    }
    req.user=dbUser;
    next();
})