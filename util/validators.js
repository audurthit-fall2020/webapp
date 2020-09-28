const validator= require('email-validator');
const e = require('express');
exports.validateEmail=(email)=>{
    return validator.validate(email);
}
exports.validatePassword=(password)=>{
    const regexp=/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{9,}$/;
    return regexp.test(password);
}   