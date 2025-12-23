import React, { useState } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useNavigate } from 'react-router-dom';
import { serverUrl } from "../App";
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

const ForgetPassword = () => {
  const [step, setStep] = useState(1)
  const [email , setEmail]=useState("");
  const [otp , setOtp] = useState("");
  const [newPassword , setNewPassword] = useState("")
  const [confirmPassword , setConfirmPassword] = useState("")
  const [err,setError]=useState("")
  const [loading , setLoading] = useState(false)
  const navigate = useNavigate()
  
  const handleSendOtp = async () =>{
    setLoading(true)
    try{
      const result = await  axios.post(`${serverUrl}/api/auth/send-otp`,{email},
        {withCredentials:true})
      console.log(result.data);
      setError("")
      setStep(2);
      setLoading(false)
    }
    catch(error){
      setError(error?.response?.data?.message);
      setLoading(false)
    }
  }

   const handleVerifyOtp = async () =>{
    setLoading(true)
    try{
      const result = await  axios.post(`${serverUrl}/api/auth/verify-otp`,{email,otp},
        {withCredentials:true})
      console.log(result.data);
      setError("")
      setStep(3);
      setLoading(false)
    }
    catch(error){
     setError(error?.response?.data?.message);
     setLoading(false)
    }
  }

   const handleResetPassword = async () =>{
    if(newPassword!=confirmPassword){
      return null
    }
    setLoading(true)
    try{
      const result = await  axios.post(`${serverUrl}/api/auth/reset-password`,{email,newPassword},
        {withCredentials:true})
        setError("")
      console.log(result.data);
      navigate("/signin")
      setLoading(false)
    }
    catch(error){
      setError(error?.response?.data?.message);
      setLoading(false)
    }
  }

  return (
    <div className=' flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8'>
        <div className='flex items-center gap-4 mb-4'>
          <IoIosArrowRoundBack size={30} className='text-[#ff4d2d] cursor-pointer' onClick={()=>navigate("/signin")} />
          <h1 className='text-2xl font-bold text-center text-[#ff4d2d]'>
            Forget PassWord{' '}
          </h1>
        </div>

        {/* step 1 for eneter a email */}
        {step == 1 && (
          <div>
            {/* Email */}
            <div className='mb-4'>
              <label
                htmlFor='email'
                className='block text-gray-700 font font-medium mb-1'
              >
                Email
              </label>
              <input
                type='email'
                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500'
                placeholder='Enter your Email'
               
                onChange={e => setEmail(e.target.value)}
                value={email} required
              />
            </div>

            <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e5310d] cursor-pointer `}  onClick={handleSendOtp}  disabled={loading}>
              {loading ? <ClipLoader size={20} color='white'/> : "Send Otp"}
          </button>
                    {err &&  <p className='text-red-500 text-center my-[10px]'>{"*"+err}</p>}

          </div>
        )}
         
         {/* step 2 for verify your otp  */}
         {step == 2 && (
          <div>
            {/* Verify Otp */}
            <div className='mb-4'>
              <label
                htmlFor='otp'
                className='block text-gray-700 font font-medium mb-1'
              >
                 OTP
              </label>
              <input
                type='email'
                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500'
                placeholder='Enter your Otp'
               
                onChange={e => setOtp(e.target.value)}
                value={otp}
              />
            </div>

            <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e5310d] cursor-pointer `} onClick={handleVerifyOtp} disabled={loading} >
              {loading ? <ClipLoader size={20} color='white'/> : "Verify"}
          </button>
                      {err &&  <p className='text-red-500 text-center my-[10px]'>{"*"+err}</p>}

          </div>
        )}

        {/* step 3 change your passWord */}

        {step == 3 && (
          <div>
            {/* new password*/}
            <div className='mb-4'>
              <label
                htmlFor='newPassword'
                className='block text-gray-700 font font-medium mb-1'
              >
                 New Password
              </label>
              <input
                type='email'
                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500'
                placeholder='Enter New PassWord'
               
                onChange={e => setNewPassword(e.target.value)}
                value={newPassword}
              />
            </div>
             
             {/* for conform passWord Section */}
             <div className='mb-4'>
              <label
                htmlFor='confirmPassword'
                className='block text-gray-700 font font-medium mb-1'
              >
                 Confirm Password
              </label>
              <input
                type='email'
                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500'
                placeholder=' Confirm PassWord'
               
                onChange={e => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
            </div>

            <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e5310d] cursor-pointer `}  onClick={handleResetPassword} disabled={loading}>
               {loading ? <ClipLoader size={20} color='white'/> : "Reset password"}
          </button>
                     {err &&  <p className='text-red-500 text-center my-[10px]'>{"*"+err}</p>}

          </div>
        )}
        


      </div>
    </div>
  )
}

export default ForgetPassword
