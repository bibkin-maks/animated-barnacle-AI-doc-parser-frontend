
import { useState, useEffect, useCallback } from 'react';

const useVoiceInput = (language = 'en-US') => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = language;

            recognitionInstance.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
                setError(null);
            };

            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setError(event.error);
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                // If we want it to always listen until manually stopped, we might restart here.
                // But for now, let's sync state.
                if (isListening) {
                    // Optional: auto-restart logic or just sync state
                }
            };

            setRecognition(recognitionInstance);
        } else {
            console.warn("Speech Recognition not supported in this browser.");
            setError("not-supported");
        }
    }, [language]);

    const startListening = useCallback(() => {
        setError(null);
        if (recognition) {
            try {
                // Ensure correct language is set before starting
                recognition.lang = language;
                recognition.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
                setError("start-failed");
            }
        }
    }, [recognition, language]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        transcript,
        error,
        toggleListening,
        startListening,
        stopListening,
        hasSupport: !!recognition
    };
};

export default useVoiceInput;
