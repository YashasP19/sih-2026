import { useCallback, useRef, useState } from 'react';
import api from '../services/api';

function isSecureForMic() {
  if (typeof window === 'undefined') return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

/**
 * Records mic audio with MediaRecorder and sends it to the backend
 * (faster-whisper) for transcription — works in any browser, any language
 * the model supports, no reliance on the flaky Web Speech API.
 */
export function useSpeechToText() {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    typeof window !== 'undefined' && !!(window.MediaRecorder && navigator.mediaDevices?.getUserMedia)
  );
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const onResultRef = useRef(null);
  const streamRef = useRef(null);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = useCallback(async (onResult) => {
    setError(null);
    onResultRef.current = onResult;

    if (!isSecureForMic()) {
      setError('Voice needs a secure page. Open http://localhost:3000 (not http://192.x.x.x or a LAN IP).');
      return;
    }
    if (!supported) {
      setError('Voice recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cleanupStream();
        setListening(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        if (blob.size < 1000) return; // essentially empty recording

        try {
          const formData = new FormData();
          formData.append('audio', blob, 'speech.webm');
          const res = await api.post('/ai/transcribe/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const text = res.data?.text?.trim();
          if (text && onResultRef.current) {
            onResultRef.current({ finalText: text, interimText: '', isFinal: true });
          } else if (!text) {
            setError('No speech detected. Click Speak and try again.');
          }
        } catch (e) {
          setError(e.response?.data?.message || 'Could not transcribe audio. Check your connection.');
        }
      };

      recorder.start();
      setListening(true);
    } catch (e) {
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Microphone blocked. Allow mic access for this site.');
      } else if (name === 'NotFoundError') {
        setError('No microphone found. Plug in a mic and try again.');
      } else {
        setError('Could not start microphone.');
      }
      setListening(false);
    }
  }, [supported]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      cleanupStream();
      setListening(false);
    }
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
