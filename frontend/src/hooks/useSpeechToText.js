import { useCallback, useEffect, useRef, useState } from 'react';

function friendlySpeechError(code) {
  const map = {
    'not-allowed':
      'Microphone blocked. Allow mic for this site, or open the app at http://localhost:3000 (not a network IP).',
    'service-not-allowed':
      'Speech service blocked. Use Chrome/Edge at http://localhost:3000 and allow the microphone.',
    'audio-capture': 'No microphone found. Plug in a mic and try again.',
    'network': 'Speech service needs network access. Check your internet connection.',
    'no-speech': 'No speech detected. Click Speak and try again.',
    aborted: null,
    'language-not-supported': 'This language is not supported. Try again in English.',
  };
  if (code in map) return map[code];
  return code ? `Voice error: ${code}` : 'Could not start voice input.';
}

function isSecureForMic() {
  if (typeof window === 'undefined') return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

async function ensureMicPermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('not-allowed');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((t) => t.stop());
}

/**
 * Browser Web Speech API (Chrome/Edge).
 */
export function useSpeechToText({ lang = 'en-IN', continuous = true } = {}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(null);
  const intentionalStopRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += transcript;
        else interimChunk += transcript;
      }
      if (onResultRef.current) {
        onResultRef.current({
          finalText: finalChunk,
          interimText: interimChunk,
          isFinal: Boolean(finalChunk),
        });
      }
    };

    recognition.onerror = (event) => {
      const code = event.error || '';
      // aborted / no-speech are common when stopping — don't scare the user
      if (code === 'aborted' || (code === 'no-speech' && intentionalStopRef.current)) {
        setListening(false);
        return;
      }
      const msg = friendlySpeechError(code);
      if (msg) setError(msg);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      intentionalStopRef.current = false;
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    };
  }, [lang, continuous]);

  const start = useCallback(async (onResult) => {
    setError(null);
    onResultRef.current = onResult;
    intentionalStopRef.current = false;

    if (!isSecureForMic()) {
      setError(
        'Voice needs a secure page. Open http://localhost:3000 (not http://192.x.x.x or a LAN IP).'
      );
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) {
      setError('Speech recognition is not supported. Use Chrome or Edge.');
      return;
    }

    try {
      await ensureMicPermission();
    } catch (e) {
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError(friendlySpeechError('not-allowed'));
      } else if (name === 'NotFoundError') {
        setError(friendlySpeechError('audio-capture'));
      } else {
        setError(friendlySpeechError('not-allowed'));
      }
      setListening(false);
      return;
    }

    try {
      recognition.start();
      setListening(true);
    } catch (e) {
      // Already started — restart cleanly
      if (String(e?.message || e).toLowerCase().includes('already')) {
        try {
          recognition.stop();
          setTimeout(() => {
            try {
              recognition.start();
              setListening(true);
            } catch (err) {
              setError(err.message || 'Could not start microphone');
              setListening(false);
            }
          }, 200);
          return;
        } catch {
          /* fall through */
        }
      }
      setError(e.message || 'Could not start microphone');
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const toggle = useCallback(
    (onResult) => {
      if (listening) stop();
      else start(onResult);
    },
    [listening, start, stop]
  );

  return { listening, supported, error, start, stop, toggle, clearError: () => setError(null) };
}
