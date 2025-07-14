# Parallel-Audio-Stream-Separation

Problem 2 – Parallel Audio Stream Separation (Browser)

Problem Statement:
Simultaneously capture system audio (via screen capture) and microphone audio in a Chrome browser.

The challenge is that when both are captured, audio bleed/echo occurs — microphone often picks up the system audio. You must design a solution that can separate these streams cleanly.

Hint:

* Use the MediaStream APIs in Chrome to get:

  * Microphone: getUserMedia({ audio: true })
  * System Audio: getDisplayMedia({ audio: true })
* The core issue is echo or overlap between the two sources.

Your Goal:

* Implement a solution that uses signal processing to distinguish and separate microphone and system audio tracks.
* Language of your choice (Python, JS, Rust, C++ etc.)
* To be done in real-time or near-real-time.

Expectations:

* Explain the root cause of echo/bleed-in.
* Suggest a concrete algorithmic approach:

* Example: Noise gating, spectral subtraction, adaptive filtering, cross-correlation echo cancellation, etc.
* Optional: Code demo to preprocess and extract clean streams.





# Audio Stream Separation

A web application for separating microphone and system audio streams in real-time.

## Prerequisites

- Node.js: Version 16 or later
- Chrome Browser: Required for getDisplayMedia audio capture support
- HTTPS: The app must run over HTTPS for getUserMedia and getDisplayMedia APIs

## Installation

1. Clone the Repository:
```
git clone https://github.com/SSCoderin/Parallel-Audio-Stream-Separation.git
cd audio-separation
```
2. Install Dependencies:
```
npm install
```

3. Configure HTTPS for Development:
Update package.json with:
```json
{
 "scripts": {
   "dev": "next dev --experimental-https",
   "build": "next build",
   "start": "next start"
 }
}
```

## Project Structure
```
audio-separation/
├── app/
│   └── page.jsx              # Main Next.js component for audio capture and UI
├── public/
│   └── audio-processor.js    # AudioWorklet processor for echo cancellation
├── package.json
└── README.md
```

## Usage

1. Start the Application:
```
npm run dev
```

2. Open https://localhost:3000 in Chrome

3. Grant Required Permissions:
  - Allow microphone access when prompted
  - Select audio source (tab/window/screen) for system audio capture

4. Recording Audio:
  - Click "Start Capture" to begin recording
  - Speak into microphone while playing system audio
  - Click "Stop Capture" to end recording

5. Output Files:
  - clean_microphone_audio_<timestamp>.wav: Processed microphone audio with echo removal
  - system_audio_<timestamp>.wav: Original system audio

## Features

- Real-time audio stream separation
- Echo cancellation between microphone and system audio
- Browser-based implementation using Web Audio API
- Downloadable separated audio tracks

## License

[Add your license here]