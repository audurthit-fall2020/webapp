const connection= require('../dbConnection');
const router= require('express').Router();
const usercontroller= require('../controllers/user.controller.js');
const authController= require('../controllers/auth.controller');
const counter=  require('../util/counter')
router.route("/").post(counter('post.v1.user'),usercontroller.createUser);
router.route("/self").get(counter('get.v1.self'),authController.authenticate,usercontroller.getUserInfo)
                     .put(counter('put.v1.self'),authController.authenticate,usercontroller.updateUser);
router.route('/:id').get(counter('get.v1.user'),usercontroller.getUserById);
module.exports=router;