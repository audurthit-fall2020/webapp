const connection = require('../dbConnection');
const AppError= require('../util/apperror');
const catchasync = require('../util/catchasync');
const promsify= require('util').promisify;
const bcrypt= require('bcrypt');
exports.authenticate=catchasync(async (req,res,next)=>{
    if(!req.headers.authorization||!req.headers.authorization.startsWith('Basic ')){
        next(new AppError(401,'Unauthenticated!! Please make sure to provide correct details'));
        return;
    }
    const base= req.headers.authorization.split(' ')[1];
    const decoded=new Buffer.from(base,'base64').toString('ascii');
    const [username,password]=decoded.split(":");
    const query= promsify(connection.query).bind(connection);
    const results= await query(`select * from user where email_address=?`,username);
    if(results.length==0){
        next(new AppError(401,`Unauthenticated!! No user found with email id ${username}`));
        return ;
    }
    const dbUser=results[0];
    if(!await bcrypt.compare(password,dbUser.userpassword)){
        next(new AppError(401,'Unauthenticated!! Invaid password'));
        return ;
    }
    req.user=dbUser;
    next();
})