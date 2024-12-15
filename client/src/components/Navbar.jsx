import { useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// Navbar component
const Navbar = () => {
  // Hook to navigate between routes
  const navigate = useNavigate();
  // Destructure values from the global AppContext
  const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext);

  // Function to handle user logout
  const logout = async () => {
    try {
      // Configure axios to include credentials (cookies)
      axios.defaults.withCredentials = true;

      // Send logout request to the backend
      const { data } = await axios.post(backendUrl + '/api/auth/logout');

      // If logout is successful, update context and navigate to the home page
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(false);
        navigate('/');
      }
    } catch (error) {
      // Display an error message using toast notifications
      toast.error(error.message);
    }
  };

  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
      {/* Logo */}
      <img src={assets.logo} alt="Logo" className='w-28 sm:w-32' />

      {/* Conditional rendering based on user authentication status */}
      {userData ? (
        // When user is logged in, display their initials in a profile menu
        <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group'>
          {/* Display the first letter of the user's name */}
          {userData.name[0].toUpperCase()}

          {/* Profile dropdown menu */}
          <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
            <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
              {/* Option to verify email if the account is not verified */}
              {!userData.isAccountVerfied && (
                <li className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Verify Email</li>
              )}
              {/* Logout option */}
              <li
                onClick={logout}
                className='py-1 px-2 pr-10 hover:bg-gray-200 cursor-pointer'
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        // When user is not logged in, display a login button
        <button
          onClick={() => navigate('/login')}
          className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all'
        >
          Login
          <img src={assets.arrow_icon} alt="Arrow Icon" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
