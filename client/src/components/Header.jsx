import { useContext } from "react"; // Importing React's useContext hook to access context values.
import { assets } from "../assets/assets"; // Importing assets like images from the assets folder.
import { AppContext } from "../context/AppContext"; // Importing the AppContext to retrieve shared data.

const Header = () => {
    // Extracting userData from the AppContext to personalize the greeting.
    const { userData } = useContext(AppContext);

    return (
        // Main container for the header, styled with flexbox for vertical alignment and center alignment.
        <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
            {/* Displaying the header image, styled as a rounded avatar. */}
            <img src={assets.header_img} alt="Header Avatar" className="w-36 h-36 rounded-full mb-6" />

            {/* Greeting section with the user's name or a default fallback. Includes a hand wave icon. */}
            <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
                Hey {userData ? userData.name : 'Developer'}!
                <img src={assets.hand_wave} alt="Wave Icon" className="w-8 aspect-square" />
            </h1>

            {/* Title section with a large font to welcome the user. */}
            <h2 className="text-3xl sm:text-5xl font-semibold mb-4">Welcome to Fight Club</h2>

            {/* A brief introductory message for the user. */}
            <p className="mb-8 max-w-md">Let&apos;s start with a quick product tour and we will have you up and running in no time!</p>

            {/* Call-to-action button with hover effects. */}
            <button className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all">
                Get Started
            </button>
        </div>
    );
};

export default Header; // Exporting the Header component for use in other parts of the application.
