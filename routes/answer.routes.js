const router= require('express').Router({mergeParams:true});
const usercontroller= require('../controllers/user.controller.js');
const {authenticate}= require('../controllers/auth.controller');
const questionController=require('../controllers/question.controller');
const answerController=require('../controllers/answer.controller');
const counter= require('../util/counter');
router.route("/").post(counter('post.v1.answer'),authenticate,answerController.answerQuestion)
router.route("/:answer_id").put(counter('put.v1.answer'),authenticate,answerController.updateAnswer)
    .delete(counter('delete.v1.answer'),authenticate,answerController.deleteAnswer).get(counter('get.v1.answer'),answerController.getAnswer);
router.route("/:answer_id/file").post(counter('post.v1.answer.file'),authenticate,answerController.getAuthAnswerById,answerController.uploadImages,
    answerController.uploadToS3)
router.route("/:answer_id/file/:file_id").delete(counter('delete.v1.answer.file'),authenticate,answerController.getAuthAnswerById,
    answerController.deleteAnswerFile);
module.exports=router;