const router= require('express').Router();
const usercontroller= require('../controllers/user.controller.js');
const {authenticate}= require('../controllers/auth.controller');
const questionController=require('../controllers/question.controller');
const answerController= require('../controllers/answer.controller');
const counter= require('../util/counter');
router.route("/").post(counter('post.v1.question'),authenticate,questionController.postQuestion);
router.route("/:question_id")
.delete(counter('delete.v1.question'),authenticate,questionController.deleteQuestion)
.put(counter('put.v1.question'),authenticate,questionController.updateQuestion)
.get(counter('get.v1.question'),questionController.getQuestionById);
router.route("/:question_id/file").post(counter('post.v1.question.file'),authenticate,questionController.getAuthQuestionById,questionController.uploadImages,
    questionController.uploadToS3);
router.route("/:question_id/file/:file_id").delete(counter('delete.v1.question.file'),authenticate,questionController.getAuthQuestionById,questionController.deleteQuestionFile);
module.exports=router;