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
router.route("/:question_id/file").post(authenticate,questionController.getAuthQuestionById,questionController.uploadImages,
    questionController.uploadToS3);
router.route("/:question_id/file/:file_id").delete(authenticate,questionController.getAuthQuestionById,questionController.deleteQuestionFile);
module.exports=router;