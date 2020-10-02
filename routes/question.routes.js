const router= require('express').Router();
const usercontroller= require('../controllers/user.controller.js');
const {authenticate}= require('../controllers/auth.controller');
const questionController=require('../controllers/question.controller');
router.route("/").post(authenticate,questionController.postQuestion);
module.exports=router;