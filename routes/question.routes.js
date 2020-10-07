const router= require('express').Router();
const usercontroller= require('../controllers/user.controller.js');
const {authenticate}= require('../controllers/auth.controller');
const questionController=require('../controllers/question.controller');
const answerController= require('../controllers/answer.controller');
router.route("/").post(authenticate,questionController.postQuestion);
router.route("/:question_id")
.delete(authenticate,questionController.deleteQuestion)
.put(authenticate,questionController.updateQuestion)
.get(questionController.getQuestionById);
module.exports=router;