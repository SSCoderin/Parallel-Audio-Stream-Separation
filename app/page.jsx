"use client";

import { useState, useRef } from "react";

export default function AudioSeparation() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  let audioContext = useRef(null);
  let micSource = useRef(null);
  let systemSource = useRef(null);
  let processor = useRef(null);
  let micRecorder = useRef(null);
  let systemRecorder = useRef(null);
  let micAudioChunks = useRef([]);
  let systemAudioChunks = useRef([]);

  const startCapture = async () => {
    try {
      // Capture microphone and system audio
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const systemStream = await navigator.mediaDevices.getDisplayMedia({ audio: true });

      // Check for audio tracks
      if (micStream.getAudioTracks().length === 0) {
        throw new Error("Microphone stream has no audio track");
      }
      if (systemStream.getAudioTracks().length === 0) {
        console.warn("No system audio detected. Recording microphone audio only.");
        setError("No system audio detected. Please select a tab or application with audio.");
      }

      // Initialize Web Audio API
      audioContext.current = new AudioContext();
      micSource.current = audioContext.current.createMediaStreamSource(micStream);
      systemSource.current = systemStream.getAudioTracks().length
        ? audioContext.current.createMediaStreamSource(systemStream)
        : null;

      // Load AudioWorklet processor for echo cancellation
      await audioContext.current.audioWorklet.addModule("/audio-processor.js");
      processor.current = new AudioWorkletNode(audioContext.current, "echo-cancellation-processor");

      // Connect nodes for microphone audio (with echo cancellation)
      micSource.current.connect(processor.current);
      if (systemSource.current) {
        systemSource.current.connect(processor.current);
      }

      // Create MediaStreamDestination for processed microphone audio
      const micDestination = audioContext.current.createMediaStreamDestination();
      processor.current.connect(micDestination);

      // Initialize MediaRecorder for microphone audio
      micRecorder.current = new MediaRecorder(micDestination.stream);
      micAudioChunks.current = [];
      micRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          micAudioChunks.current.push(event.data);
        }
      };
      micRecorder.current.start();

      // Initialize MediaRecorder for system audio (if available)
      if (systemSource.current) {
        const systemDestination = audioContext.current.createMediaStreamDestination();
        systemSource.current.connect(systemDestination);
        systemRecorder.current = new MediaRecorder(systemDestination.stream);
        systemAudioChunks.current = [];
        systemRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            systemAudioChunks.current.push(event.data);
          }
        };
        systemRecorder.current.start();
      }

      setIsCapturing(true);
      setError(null);
    } catch (err) {
      console.error("Error capturing audio:", err);
      setError(err.message);
      audioContext.current?.close();
    }
  };

  const stopCapture = () => {
    // Stop and save microphone audio
    if (micRecorder.current) {
      micRecorder.current.stop();
      micRecorder.current.onstop = () => {
        const blob = new Blob(micAudioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `clean_microphone_audio_${new Date().toISOString()}.wav`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    // Stop and save system audio (if available)
    if (systemRecorder.current) {
      systemRecorder.current.stop();
      systemRecorder.current.onstop = () => {
        const blob = new Blob(systemAudioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `system_audio_${new Date().toISOString()}.wav`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    // Clean up audio context and nodes
    micSource.current?.disconnect();
    systemSource.current?.disconnect();
    processor.current?.disconnect();
    audioContext.current?.close();
    setIsCapturing(false);
    setError(null);
  };

  return (
    <div className="p-20">
      <h1 className="text-3xl mb-10 font-bold ">Parallel Audio Stream Separation</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <p >Select a tab or application with audio (e.g., a video or music player) and ensure your microphone is enabled.</p>
      <div className="flex flex-row items-center  gap-10 my-4">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer" onClick={startCapture} disabled={isCapturing}>
        Start Capture
      </button>
      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer" onClick={stopCapture} disabled={!isCapturing}>
        Stop Capture
      </button>
      </div>
    </div>
  );
}