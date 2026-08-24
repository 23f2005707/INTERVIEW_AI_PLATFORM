import jwt from 'jsonwebtoken'

// for getting current users 
export const isAuth = async (req, res, next) => {
  try{
    // find the token
    let {token} = req.cookies;
    console.log(token)

    if(!token) {
        return res.status(400).json({message: `User does not have a token.`})
    }

    // verify token this user is authenticated 
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

    if(!verifyToken) {
        return res.status(400).json({message: `User have no valid token`})
    }

    // get currrent userId from verifytoken
    req.userId = verifyToken.userId

    next();
  }

  catch(err) {
    return res.status(500).json({message: `isAuth error: ${err}`})
  }
}