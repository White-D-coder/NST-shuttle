import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
            {/* Navbar */}
            <nav className="flex flex-col md:flex-row justify-between items-center p-6 max-w-7xl mx-auto gap-4">
                <div className="text-2xl font-bold text-blue-700 tracking-tight">
                    NST Shuttle
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto items-center">
                    <Link to="/login" className="w-full sm:w-auto text-center px-5 py-2.5 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition border border-blue-200">
                        Passenger Login
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto text-center px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">
                        Driver Login
                    </Link>
                    <Link to="/signup" className="w-full sm:w-auto text-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-0.5">
                        Sign Up
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="flex flex-col items-center justify-center text-center mt-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                    Track Your Campus Shuttle <br />
                    <span className="text-blue-600">In Real-Time</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mb-10">
                    Never miss a shuttle again. Live tracking, accurate ETAs, and route maps for students and faculty.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/login" className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-xl hover:bg-blue-700 transition transform hover:-translate-y-1">
                        Track Now
                    </Link>
                    <a href="#features" className="px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl shadow-md hover:bg-gray-50 transition border border-gray-100">
                        Learn More
                    </a>
                </div>
            </header>

            {/* Promotional / Advertising Video Section */}
            <section className="mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black aspect-video">
                    {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white/50 text-lg font-medium">Advertising Video Placeholder</span>
                    </div> */}
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        playsInline
                        poster="/ad_placeholder.png"
                    // poster="https://via.placeholder.com/1280x720/1e40af/ffffff?text=NST+Shuttle+Promo"
                    >
                        {/* Replace with your actual video source */}
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </section>

            {/* Features (Visuals) */}
            <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Live GPS Tracking</h3>
                        <p className="text-gray-600">See exactly where the shuttle is on the map with real-time updates.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accurate Schedules</h3>
                        <p className="text-gray-600">Know when the next bus arrives with updated timetables.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Reliable</h3>
                        <p className="text-gray-600">Exclusive access for students and faculty with secure login.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
