import express from 'express'
import {isAuth} from '../middlewares/isAuth.js'
import { verify } from 'crypto';
import { verifyPayment } from '../controllers/payment.controller.js';
import { createOrder } from '../controllers/payment.controller.js';


const paymentRouter = express.Router();

paymentRouter.post("/order", isAuth, createOrder )
paymentRouter.post("/verify", isAuth, verifyPayment)

export default paymentRouter