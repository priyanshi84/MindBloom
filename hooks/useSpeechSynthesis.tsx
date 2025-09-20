import { useState, useEffect, useCallback, useRef } from 'react';

// To store the preferred voice globally so we don't search every time
let preferredVoice: SpeechSynthesisVoice | null = null;

export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0 && !preferredVoice) {
                // Heuristic to find a calm, standard voice.
                preferredVoice = availableVoices.find(voice => /en-US/.test(voice.lang) && /female/i.test(voice.name) && !/Google/i.test(voice.name)) ||
                                availableVoices.find(voice => /en-GB/.test(voice.lang) && /female/i.test(voice.name)) ||
                                availableVoices.find(voice => /en-IN/.test(voice.lang) && /female/i.test(voice.name)) ||
                                availableVoices.find(voice => /female/i.test(voice.name)) ||
                                null;
            }
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();

        return () => {
            isMounted.current = false;
            // Only cancel if speech is happening to prevent cutting off other sounds
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speak = useCallback((text: string) => {
        if (!text || !isMounted.current) return;
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            if (isMounted.current) setIsSpeaking(true);
        };
        utterance.onend = () => {
            if (isMounted.current) setIsSpeaking(false);
        };
        utterance.onerror = () => {
            if (isMounted.current) setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
    }, []);

    const cancel = useCallback(() => {
        if(isMounted.current) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return { speak, cancel, isSpeaking };
};
