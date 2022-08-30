import { useEffect, useState } from 'react';

const useSpeechSynthesis = (props = {}) => {
  const { onEnd = () => {} } = props;
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  const processVoices = (voiceOptions) => {
    setVoices(voiceOptions);
  };

  const getVoices = () => {
    // Firefox seems to have voices upfront and never calls the
    // voiceschanged event
    let voiceOptions = window.speechSynthesis.getVoices();
    if (voiceOptions.length > 0) {
      processVoices(voiceOptions);
      return;
    }

    window.speechSynthesis.onvoiceschanged = (event) => {
      voiceOptions = event.target.getVoices();
      processVoices(voiceOptions);
    };
  };

  const handleEnd = () => {
    setSpeaking(false);
    onEnd();
  };

  const chunkSubstr = (str, size) => {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);

    // eslint-disable-next-line no-plusplus
    for (let i = 0, o = 0; i < numChunks; i++, o += size) {
      chunks[i] = str.substr(o, size);
    }

    return chunks;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      getVoices();
    }
  }, []);

  const speak = (args = {}) => {
    const { voice = null, text = '', rate = 1, pitch = 1, volume = 1 } = args;
    if (!supported) return;
    setSpeaking(true);

    // Firefox won't repeat an utterance that has been
    // spoken, so we need to create a new instance each time

    const smallChunks =
      text.length < 250 ? new Array(text) : chunkSubstr(text, 225);

    smallChunks.forEach((chunk) => {
      // console.log('chunk::', chunk.length);
      const utterance = new window.SpeechSynthesisUtterance();
      utterance.text = chunk;
      utterance.voice = voice;
      utterance.onend = handleEnd;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      window.speechSynthesis.speak(utterance);
    });
  };

  const cancel = () => {
    if (!supported) return;
    setSpeaking(false);
    window.speechSynthesis.cancel();
  };

  return {
    supported,
    speak,
    speaking,
    cancel,
    voices,
  };
};

export default useSpeechSynthesis;
