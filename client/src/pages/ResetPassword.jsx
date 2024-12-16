import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  // Retrieve the backend URL from AppContext
  const { backendUrl } = useContext(AppContext);

  // Set default axios configuration to include cookies
  axios.defaults.withCredentials = true;

  // Hook for navigation
  const navigate = useNavigate();

  // States for handling email, OTP, password, and form status
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState(0);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  // Ref array to handle OTP input fields
  const inputRefs = React.useRef([]);

  // Function to handle input in OTP fields, automatically focusing the next field
  const handleInput = (e, index) => {
    // Move focus to the next field when a value is entered
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  // Function to handle backspace navigation to the previous field
  const handleKeyDown = (e, index) => {
    // Move focus to the previous field when backspace is pressed
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  // Function to handle pasting of OTP into the input fields
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    })
  }

  // Function to handle email submission (request OTP)
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      // Send a request to the backend to send the OTP to the user's email
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email });
      // Show a success or error message based on the response
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSent(true); // If email is sent, enable OTP form
    } catch (error) {
      toast.error(error.message); // Handle error if request fails
    }
  }

  // Function to handle OTP submission
  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(e => e.value);
    setOtp(otpArray.join('')); // Combine OTP values into a single string
    setIsOtpSubmitted(true); // Move to the next form for new password input
  }

  // Function to handle new password submission
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      // Send a request to the backend to reset the password using the email, OTP, and new password
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword });
      // Show a success or error message based on the response
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate('/login'); // If successful, navigate to login page
    } catch (error) {
      toast.error(error.message); // Handle error if request fails
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      {/* Logo click navigation */}
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt=""
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      {/* Email form - displayed if email is not yet submitted */}
      {!isEmailSent &&
        <form onClick={onSubmitEmail} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter your registered email</p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-3 h-3" />
            <input type="email" placeholder="Email"
              className="bg-transparent outline-none text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      }

      {/* OTP form - displayed after email is sent and OTP is requested */}
      {!isOtpSubmitted && isEmailSent &&
        <form onSubmit={onSubmitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Password Reset OTP</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6 digit code sent to your email</p>

          {/* OTP Input Fields */}
          <div className='flex justify-between mb-8' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input
                type="text"
                maxLength='1'
                key={index}
                required
                className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                ref={e => inputRefs.current[index] = e} // Assign refs to input elements
                onInput={(e) => handleInput(e, index)} // Handle input changes
                onKeyDown={(e) => handleKeyDown(e, index)} // Handle backspace key
              />
            ))}
          </div>

          {/* Submit Button */}
          <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>
            Submit
          </button>
        </form>
      }

      {/* New password form - displayed after OTP is successfully submitted */}
      {isOtpSubmitted && isEmailSent &&
        <form onClick={onSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the new password below</p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-3 h-3" />
            <input type="password" placeholder="New Password"
              className="bg-transparent outline-none text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      }
    </div >
  )
}

export default ResetPassword;
