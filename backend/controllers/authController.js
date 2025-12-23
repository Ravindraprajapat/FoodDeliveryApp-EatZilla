import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import genToken from '../utils/token.js'
import { sendOtpMail } from '../utils/mail.js'

// sign up controller
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: 'User Already exist.' })
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password Must be at least 6 characters.' })
    }
    if (mobile.length < 10) {
      return res
        .status(400)
        .json({ message: 'mobile number length must be 10 digits.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    user = await User.create({
      fullName,
      email,
      role,
      mobile,
      password: hashedPassword
    })

    const token = await genToken(user._id)
    res.cookie('token', token, {
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    })

    return res.status(201).json(user)
  } catch (error) {
    return res.status(500).json(`sign up error ${error}`)
  }
}

//  sign in controller
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body
   // console.log("SIGNIN BODY =>", req.body);

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User Does not exist.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password.' })
    }

    const token = await genToken(user._id)
    res.cookie('token', token, {
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    })

    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json(`sign up error ${error}`)
  }
}

// sign out controller
export const signOut = async (req, res) => {
  try {
    res.clearCookie('token')
    return res.status(200).json({ message: 'Log out SuccessFully' })
  } catch (error) {
    return res.status(500).json(`sign out error ${error}`)
  }
}

// send the Otp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User Does not exist.' })
    }
    // generate otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    user.resetOtp = otp
    user.otpExpires = Date.now() + 5 * 60 * 1000
    user.isOtpVerified = false
    await user.save()

    await sendOtpMail(email, otp)
    return res.status(200).json({ message: 'OTP sent SuccessFully.' })
  } catch (error) {
    return res.status(500).json(`send otp error ${error}`)
  }
}

// verify the otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    
    const user = await User.findOne({ email })
   
    if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid/expired OTP' })
    }
    user.isOtpVerified = true
    user.resetOtp = undefined
    user.otpExpires = undefined
    await user.save()
    return res.status(200).json({ message: 'OTP verified successfully.' })
  } catch (error) {
    return res.status(500).json(`verify otp error ${error} `)
  }
}


// reset the otp
export const resetPassword = async (req, res) => {

  try{
    const { email, newPassword } = req.body
    const user = await User.findOne({email})
    if(!user || !user.isOtpVerified){
      return res.status(400).json({message : "otp verification required."})
    }
    const hashedPassword = await bcrypt.hash(newPassword,10)
    user.password=hashedPassword;
    user.isOtpVerified = false
    await user.save()
    return res.status(200).json({ message: 'password SuccessFully change.' })
  }
  catch(error){
    return res.status(500).json(`reset password error ${error}`)
  }
}


export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body

    if (!email || !fullName || !mobile || !role) {
      return res.status(400).json({
        message: "Required fields missing"
      })
    }

    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        fullName,
        email,
        role,
        mobile
      })
    }

    const token = genToken(user._id)

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    })

    return res.status(200).json(user)

  } catch (error) {
    return res.status(500).json({
      message: "google auth error",
      error: error.message
    })
  }
}




// export const googleAuth = async (req,res) =>{
//   try{
//     const {fullName , email, mobile ,role} = req.body
//     let user = await User.findOne({email})
//     if(!user){
      
//       user = await User.create({
//         fullName,email,role ,mobile
//       })
//     }
//       const token = await genToken(user._id)
//     res.cookie('token', token, {
//       secure: false,
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       httpOnly: true
//     })

//     return res.status(200).json(user)
//   }
//   catch(error){
//     return res.status(500).json(`google auth error ${error}`)
//   }
// }