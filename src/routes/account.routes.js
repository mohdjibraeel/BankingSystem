const express=require('express');


const authMiddleware=require('../middleware/auth.middleware');
const accountController=require('../controller/account.controller');

const router=express.Router()


/** 
 * POST /api/accounts
 * Description: Create a new account for the authenticated user
 */

router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

/**
 * GET /api/accounts
 * Description: Get all accounts for the authenticated user
 */
router.get("/",authMiddleware.authMiddleware,accountController.getAllAccountsController)

/**
 * -GET /api/accounts/:accountId
 * Description: Get details of a specific account by ID (optional, can be implemented later)
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountByIdController)

module.exports=router;