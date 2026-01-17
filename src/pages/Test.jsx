
import React from 'react';
// import CatGridBackground from '../components/CatGridBackground'; // Removed, now global
import { useNavigate } from 'react-router-dom';

const Test = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full h-screen overflow-hidden text-white font-montserrat">
            {/* <CatGridBackground /> Global background handled in App.jsx */}

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center pointer-events-auto">
                    <h1 className="text-4xl font-bold mb-4 text-orange-300">Cat Grid Test</h1>
                    <p className="text-slate-300 mb-6 max-w-md">
                        This is the experimental hexagon grid background with custom "Cat" colors (Orange/White/Brown).
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/20"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Test;
