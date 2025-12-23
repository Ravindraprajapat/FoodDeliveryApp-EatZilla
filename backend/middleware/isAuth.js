import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: "Unauthorized Access" })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized Access" })
    }

    const user = await User.findById(decodedToken.userId).select("-password")

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    req.userId = user._id

    next()
  } catch (error) {
    return res
      .status(401) // 🔥 FIX
      .json({ message: `Auth middleware error ${error.message}` })
  }
}

export default isAuth







// import jwt from "jsonwebtoken"

// const isAuth = async (req,res,next) =>{
//     try {
//         const token = req.cookies.token;
//         if(!token){
//             return res.status(401).json({message : "Unauthorized Access"})
//         }
//         const decodedToken  =  jwt.verify(token , process.env.JWT_SECRET )
//         if(!decodedToken){
//             return res.status(401).json({message : "Unauthorized Access"})
//         }
//         // console.log(decodedToken);
//         req.userId = decodedToken.userId; 
//         next();
//     }
//     catch (error) {
//         return res.status(500).json(`Auth middleware error ${error}`)
//     }
// }

// export default isAuth;


// import jwt from "jsonwebtoken"
// import User from "../models/userModel.js"

// const isAuth = async (req, res, next) => {
//   try {
//     const token = req.cookies.token

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized Access" })
//     }

//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

//     if (!decodedToken) {
//       return res.status(401).json({ message: "Unauthorized Access" })
//     }

//     // ✅ FIX: req.user set karo (NOT req.userId)
//     const user = await User.findById(decodedToken.userId).select("-password")

//     if (!user) {
//       return res.status(401).json({ message: "User not found" })
//     }

//     req.user = user   // 🔥 IMPORTANT
//     next()

//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: `Auth middleware error: ${error.message}` })
//   }
// }

// export default isAuth
