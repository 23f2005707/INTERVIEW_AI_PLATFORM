#### BACKEND ###
-- 1. npm init -y
-- 2. npm i express dotenv mongoose nodemon cors cookie-parser jsonwebtoken
-- 3. create index.js and .env 
-- 4. connect to mongodb atlas

-- 5. connect db -> config/db.js

-- 6. AUTHENTICATION -> create model/user.model.js

-- 14. create server/config/token.js for getting token by using jwt_secret and userid

-- 15. create auth controller to habdle the authentication. and store token into cookies

-- 16. handle all routes in auth.routes.js and after doing this add middleware and cors policy in `index.js`

-- 17. create middleware/isAuth.jsx for getting userId of current user

-- 18. create user.controller.js for getting current user by userId

-- 19. create routes of user and initialize in index.js 

-- 28. create middlewares/multer.jsx

-- 29. create services/openRouter.service.js -> 
   -- `npm i axios`
   -- require `API KEY`
   -- create for getting message content by asking AI

-- 30. create interview controller
   -- `npm i pdfjs-dist` -> to read data from pdf
   -- analyze the resume and get the text from pdf pages and get ai response by using pages text.


-- 31. create interview routes 
   -- add the router for pdf of interview
model, routes

-- 35. create interview controller three routes -> generate-question, submit-answer, finish interview



#### FRONTEND ####
-- 7. initilaize frontend 
-- 8. create home.jsx, auth.jsx.
-- 9. in terminal `npm i react-router-dom react-icons axios`

-- 10. create Routes in App.jsx 
-- 11. write ui for auth.jsx with react icons 
-- 12. setup autherntication from firebase and create utils/firebase.js
-- 13. add function to firebase auth conset screen for login.

--20. FETCH the current user in `App.jsx` (frontend) from backend by api call

-- 21. install command -> `npm install @reduxjs/toolkit react-redux`

-- 22. CREATE store and userSlice reducer by redux toolkit and by using dispatch store current user data in store. in `app.jsx` -> useselector to access data from store

-- 23. create components/navbar.jsx to use of store and access data from redux by useselector and create ui.

--24. create components/auth.jsx  and add the authModel in navbar.jsx and also add condition in buttons for check user is loggged in or not

--- 25. create ui for pages/home.jsx

-- 26. create components/footer.jsx

-- 27. create pages/interview project.jsx and report.jsx  || components/step1setUo, interview, report.jsx

// --- 32. create file step1setup for analyze resume. 

// -- 33. create interview.controller.js -> geneerateQuestion, submitanswer, finish interview

// -- 34. create routes of all three controller in `inter.routes.js`

// -36. create handleStart func in step1setup.jsx

// -- 37. create `step2Interview.jsx` and `timer.jsx`


# FLOW DIAGRAM 
Browser
   |
   | GET /api/user/current-user
   ↓
userRouter
   |
   ↓
isAuth
   |
   | req.cookies.token
   ↓
jwt.verify()
   |
   | verifyToken.userId
   ↓
req.userId
   |
   ↓
next()
   |
   ↓
getCurrentUser
   |
   | await User.findById(req.userId)
   ↓
MongoDB
   |
   ↓
User returned


npm i react-circular-progressbar