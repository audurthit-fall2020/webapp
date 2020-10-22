const router= require('express').Router({mergeParams:true});
const usercontroller= require('../controllers/user.controller.js');
const {authenticate}= require('../controllers/auth.controller');
const questionController=require('../controllers/question.controller');
const answerController=require('../controllers/answer.controller');
router.route("/").post(authenticate,answerController.answerQuestion)
router.route("/:answer_id").put(authenticate,answerController.updateAnswer)
    .delete(authenticate,answerController.deleteAnswer).get(answerController.getAnswer);
router.route("/:answer_id/file").post(authenticate,answerController.getAuthAnswerById,answerController.uploadImages,
    answerController.uploadToS3)
router.route("/:answer_id/file/:file_id").delete(authenticate,answerController.getAuthAnswerById,
    answerController.deleteAnswerFile);
module.exports=router;