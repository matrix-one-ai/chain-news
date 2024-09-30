import React, { useEffect, useRef, useState } from 'react';

const AudioPlayer = ({ audioBlob }: { audioBlob: Blob }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioBlob) {
      const objectUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = objectUrl;
        audioRef.current.play(); // Autoplay the audio
      }

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [audioBlob]);

  return (
    <div style={{ display: 'none' }}>
      <audio ref={audioRef} />
    </div>
  );
};

const TTS = () => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>('Hello, world!');

  const fetchAudio = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      setAudioBlob(blob);
    } catch (error) {
      console.error('Error fetching audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchAudio();
  };

  return (
    <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
    }}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          cols={50}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      {audioBlob && <AudioPlayer audioBlob={audioBlob} />}
    </div>
  );
};

export default TTS;