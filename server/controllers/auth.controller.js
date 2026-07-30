import gentoken from "../config/token.js"
import User from "../models/user.models.js"

// LOGIN 
export const googleAuth = async (req, res) => {
    try{
        // user ka data chaiye
        const {name, email} = req.body

        // check user is already in db 
        let user = await User.findOne({email})

        if(!user) {
            // create mnew user
            user = await User.create({
                name, 
                email 
            }) 
        }

        // generate token 
        let token = await gentoken(user._id)

        // store into cookies
        res.cookie("token", token, {
            http:true,
            sameSite: "strict",
            secure: false,
            maxAge: 7*24*60*60*1000
        })

        // return user data 
        return res.status(200).json(user);
    }
    catch(err) {
        return res.status(500).json({message: `google auth error: ${err}`})
    }
} 


// LOGOUT 
export const logOut = async(req, res) => {
    try{
        // clear token from cookies
       await res.clearCookie("token")
       return res.status(200).json({message: 'Logout Successfully...'})
    }
    catch(err) {
        return res.status(500).json({message: `Logout error: ${err}`})
    }
}