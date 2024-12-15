import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';

// Login component handles both login and signup functionalities
const Login = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext); // Context for backend URL, login state, and user data fetch
  const [state, setState] = useState('Sign up'); // State to toggle between 'Sign up' and 'Login'
  const [name, setName] = useState(''); // State for user's full name
  const [email, setEmail] = useState(''); // State for user's email
  const [password, setPassword] = useState(''); // State for user's password

  // Event handler for form submission
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault(); // Prevent the default form submission
      axios.defaults.withCredentials = true; // Allow credentials (e.g., cookies) to be sent with requests

      if (state === 'Sign up') {
        // Handle user registration
        const { data } = await axios.post(backendUrl + '/api/auth/register', { name, email, password });
        if (data.success) {
          setIsLoggedIn(true); // Update login state
          getUserData(); // Fetch and update user data
          navigate('/'); // Navigate to the home page
        } else {
          toast.error(data.message); // Show error message if registration fails
        }
      } else {
        // Handle user login
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password });
        if (data.success) {
          setIsLoggedIn(true); // Update login state
          getUserData(); // Fetch and update user data
          navigate('/'); // Navigate to the home page
        } else {
          toast.error(data.message); // Show error message if login fails
        }
      }
    } catch (error) {
      toast.error(error.message); // Show error message in case of exceptions
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      {/* Logo, clicking it navigates back to the home page */}
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt=""
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      {/* Form container */}
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'Sign up' ? 'Create Account' : 'Login'}
        </h2>
        <p className='text-center text-sm mb-6'>
          {state === 'Sign up' ? 'Create your account' : 'Login to your account'}
        </p>

        {/* Form for signup or login */}
        <form onSubmit={onSubmitHandler}>
          {/* Render name field only for signup */}
          {state === 'Sign up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt="" />
              <input
                onChange={e => setName(e.target.value)}
                value={name}
                type="text"
                placeholder='Full Name'
                required
                className='bg-transparent outline-none'
              />
            </div>
          )}

          {/* Email input field */}
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={e => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder='Email'
              required
              className='bg-transparent outline-none'
            />
          </div>

          {/* Password input field */}
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={e => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder='Password'
              required
              className='bg-transparent outline-none'
            />
          </div>

          {/* Link to reset password */}
          <p onClick={() => navigate('/reset-password')} className='mb-4 text-indigo-500 cursor-pointer'>
            Forgot Password?
          </p>

          {/* Submit button */}
          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>
            {state}
          </button>
        </form>

        {/* Toggle between signup and login */}
        {state === 'Sign up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-blue-400 cursor-pointer underline'
            >
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don&apos;t have an account?{' '}
            <span
              onClick={() => setState('Sign up')}
              className='text-blue-400 cursor-pointer underline'
            >
              Sign up here
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
