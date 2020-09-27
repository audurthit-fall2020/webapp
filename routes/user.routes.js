const connection= require('../dbConnection');
const router= require('express').Router();
const usercontroller= require('../controllers/user.controller.js');
const authController= require('../controllers/auth.controller');
router.route("/").post(usercontroller.createUser);
router.route("/self").get(authController.authenticate,usercontroller.getUserInfo);
module.exports=router;