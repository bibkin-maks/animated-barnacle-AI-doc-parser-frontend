
import React from 'react';
import { motion } from 'framer-motion';

const VoiceVisualizer = ({ isListening }) => {
    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Central glow */}
            <motion.div
                animate={{
                    scale: isListening ? [1, 1.2, 1] : 1,
                    opacity: isListening ? [0.5, 0.8, 0.5] : 0.3,
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute inset-0 bg-purple-500 rounded-full blur-xl"
            />

            {/* Rotating rings */}
            <motion.div
                animate={{
                    rotate: isListening ? 360 : 0,
                    scale: isListening ? [1, 1.1, 1] : 1,
                }}
                transition={{
                    rotate: {
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                    },
                    scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                }}
                className="absolute inset-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400"
            />

            <motion.div
                animate={{
                    rotate: isListening ? -360 : 0,
                    scale: isListening ? [1, 1.05, 1] : 1,
                }}
                transition={{
                    rotate: {
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear",
                    },
                    scale: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    },
                }}
                className="absolute inset-8 rounded-full border-2 border-purple-400/30 border-b-purple-400"
            />

            {/* Sound waves (simulated for simplicity) */}
            {isListening && (
                <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: ["10%", "60%", "10%"],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatDelay: Math.random() * 0.5,
                                ease: "easeInOut",
                                delay: i * 0.1,
                            }}
                            className="w-1 bg-white/50 rounded-full"
                            style={{ height: '20%' }}
                        />
                    ))}
                </div>
            )}

            {/* Mic Icon Container (Pass-through for click on parent button, but visual here) */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg border border-white/20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            </div>

        </div>
    );
};

export default VoiceVisualizer;
