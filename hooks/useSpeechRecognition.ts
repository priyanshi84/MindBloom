import { useState, useEffect, useRef, useCallback } from 'react';

// Define the shape of the speech recognition object
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

// Check for browser support
// FIX: Cast window to `any` to access non-standard browser APIs `SpeechRecognition` and `webkitSpeechRecognition` without TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = (
    { onTranscriptChange, onError }: { onTranscriptChange: (transcript: string) => void; onError?: (error: string) => void }
) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      // FIX: Correctly handle continuous recognition by accumulating the final transcript
      // and only processing new results. The previous implementation reset the transcript
      // on every event, losing previous parts of the speech.
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      onTranscriptChange(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (onError) {
        onError(event.error);
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
        setIsListening(false);
        // On end, ensure the final transcript is set one last time.
        onTranscriptChange(finalTranscriptRef.current);
    };

    recognitionRef.current = recognition;

  }, [onTranscriptChange, onError]);

  const startListening = useCallback(() => {
    if (isListening || !recognitionRef.current) return;
    try {
        // Reset transcript for a new session.
        finalTranscriptRef.current = '';
        recognitionRef.current.start();
        setIsListening(true);
    } catch (err) {
        console.error("Error starting speech recognition:", err);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!isListening || !recognitionRef.current) return;
    recognitionRef.current.stop();
    // isListening will be set to false by the onend handler.
  }, [isListening]);
  
  return {
    isListening,
    isSupported: !!SpeechRecognition,
    startListening,
    stopListening,
  };
};
