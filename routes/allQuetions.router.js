const router= require('express').Router();
const usercontroller= require('../controllers/user.controller.js');
const {authenticate}= require('../controllers/auth.controller');
const questionController=require('../controllers/question.controller');
const answerController= require('../controllers/answer.controller');
const counter= require('../util/counter');
router.route('/').get(counter('get.v1.questions'),questionController.getAllQuestions);
module.exports=router;