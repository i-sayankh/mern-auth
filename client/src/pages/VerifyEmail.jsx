import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

// Component to handle email verification via OTP
const VerifyEmail = () => {
  // Set axios to include credentials with requests
  axios.defaults.withCredentials = true;

  // Hook for navigation
  const navigate = useNavigate();

  // Ref array to handle OTP input fields
  const inputRefs = React.useRef([]);

  // Context values from AppContext
  const { backendUrl, isLoggedIn, userData, getUserData } = useContext(AppContext);

  // Function to handle input in OTP fields, automatically focusing the next field
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  // Function to handle backspace navigation to the previous field
  const handleKeyDown = (e, index) => {
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

  // Function to handle form submission and OTP verification
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      // Collect OTP from input fields
      const otpArray = inputRefs.current.map(e => e.value);
      const otp = otpArray.join('');

      // API call to verify the OTP
      const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp });

      // If verification is successful
      if (data.success) {
        toast.success(data.message); // Show success message
        getUserData(); // Update user data in context
        navigate('/'); // Navigate to home page
      } else {
        toast.error(data.message); // Show error message
      }
    } catch (error) {
      toast.error(error.message); // Handle API errors
    }
  }

  // Effect to redirect verified users to the home page
  useEffect(() => {
    if (isLoggedIn && userData && userData.isAccountVerfied) {
      navigate('/');
    }
  }, [isLoggedIn, userData]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      {/* Logo: Clicking it navigates back to the home page */}
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt=""
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      {/* OTP Verification Form */}
      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verification OTP</h1>
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
        <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Verify Email</button>
      </form>
    </div>
  );
}

export default VerifyEmail;
