const express=require("express");
const authController=require("../controller/auth.controller")

const router=express.Router();

/* POST  /api/auth/register*/ 
router.post("/register",authController.userRegisterController)
router.post("/login",authController.userLoginController)
router.post("/logout",authController.userLogoutController)

module.exports=router;