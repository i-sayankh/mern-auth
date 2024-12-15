// Import necessary libraries and hooks
import axios from "axios"; // HTTP client for making requests
import { createContext, useState } from "react"; // React hooks and context API
import { toast } from "react-toastify"; // Library for displaying toast notifications

// Create a context to manage and share global application state
export const AppContext = createContext();

// Define a provider component to wrap the application and provide shared state
export const AppContextProvider = (props) => {
    // Fetch the backend URL from environment variables
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // State variables to manage user authentication and user data
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks whether the user is logged in
    const [userData, setUserData] = useState(null); // Stores user data retrieved from the backend

    // Function to fetch user data from the backend
    const getUserData = async () => {
        try {
            // Make a GET request to the backend API for user data
            const { data } = await axios.get(backendUrl + '/api/user/data');

            // Check the response and update user data or show an error toast
            data.success ? setUserData(data.userData) : toast.error(data.message);
        } catch (error) {
            // Handle request errors and show an error toast
            toast.error(error.message);
        }
    }

    // Define the context value to be shared with the rest of the application
    const value = {
        backendUrl,       // Backend URL to be used throughout the app
        isLoggedIn,       // User login state
        setIsLoggedIn,    // Function to update login state
        userData,         // Retrieved user data
        setUserData,      // Function to update user data
        getUserData       // Function to fetch user data from the backend
    }

    // Return the context provider wrapping the application
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}