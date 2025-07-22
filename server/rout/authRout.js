import express from 'express';
import { Login, LogOut, Signup } from '../routControler/authControler.js';
import isLogin  from '../middleware/isLogin.js';



const router  =  express.Router();

router.post('/signup',Signup)
router.post('/login', Login)
router.post('/logout', isLogin, LogOut)

export default  router 