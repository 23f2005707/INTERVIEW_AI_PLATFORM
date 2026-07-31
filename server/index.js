import express from 'express'
import dotenv from 'dotenv'

dotenv.config();

import connectDb from './config/connectDb.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';

// app initialize
const app = express()

// conn b/w backad front + end
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))  

const PORT = process.env.PORT || 6000

// middleware 
app.use(express.json())  // data hmesa json me aaye 
app.use(cookieParser())  // cookie sahi format me store ho 


// routers 
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

// get request 
app.get('/', (req, res) => {
    return res.json({message: "server started..."})
})


// server access or runsk
app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`)
    connectDb()
})