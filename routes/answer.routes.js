const router= require('express').Router({mergeParams:true});
const usercontroller= require('../controllers/user.controller.js');
const {authenticate}= require('../controllers/auth.controller');
const questionController=require('../controllers/question.controller');
const answerController=require('../controllers/answer.controller');
router.route("/").post(authenticate,answerController.answerQuestion)
router.route("/:answer_id").put(authenticate,answerController.updateAnswer)
    .delete(authenticate,answerController.deleteAnswer).get(answerController.getAnswer);
module.exports=router;