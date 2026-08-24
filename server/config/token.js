import jwt from 'jsonwebtoken'

// create token 
const gentoken = async(userId) => {
    try {
        const token = jwt.sign({userId}, process.env.JWT_SECRET, 
            {expiresIn: "7d"}
        )
        return token;
    }
    catch(err) {
        console.log(err)
    }
}

export default gentoken