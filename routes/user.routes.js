const connection= require('../dbConnection');
const router= require('express').Router();
const usercontroller= require('../controllers/user.controller.js');
router.route("/").post(usercontroller.createUser);
module.exports=router;