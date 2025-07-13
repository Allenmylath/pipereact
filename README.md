# Pipecat React UI

A complete React application for Pipecat voice and video AI interactions, built with TypeScript and Tailwind CSS.

## Features

- 🎥 **Video Panel** - Local and bot video feeds
- 🎙️ **Audio Controls** - Mute/unmute microphone
- 📹 **Camera Controls** - Turn camera on/off
- 📱 **Connection Management** - Connect/disconnect to Pipecat backend
- 💬 **Real-time Chat** - Text and voice transcription
- 🔄 **RTVI Events** - Real-time voice interface integration

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the Pipecat API URL:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_PIPECAT_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Set Environment Variables** in Vercel dashboard:
- `VITE_PIPECAT_API_URL`: Your production Pipecat backend URL

### Manual Deployment

1. **Build for production**:
```bash
npm run build
```

2. **Deploy the `dist` folder** to your hosting provider

## Configuration

### Backend Integration

The app connects to a Pipecat backend via the `/connect` endpoint. Make sure your backend:

1. Supports RTVI protocol
2. Has CORS configured for your frontend domain
3. Implements the expected `/connect` endpoint

### Customization

All components are in `src/App.tsx` for easy modification:

- **VideoPanel**: Modify video layout and styling
- **ControlPanel**: Add/remove control buttons
- **ChatInterface**: Customize chat UI and message handling
- **ConnectionStatus**: Update status indicators

## Environment Variables

- `VITE_PIPECAT_API_URL`: Your Pipecat backend URL (required)

## Tech Stack

- **React 18** with TypeScript
- **Pipecat React SDK** for voice/video AI
- **Daily Transport** for WebRTC
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Lucide React** for icons

## Project Structure

```
├── src/
│   ├── App.tsx          # Main component with all UI components
│   ├── main.tsx         # React app entry point
│   └── index.css        # Global styles and Tailwind imports
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment configuration
```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Key Components

All components are defined in `src/App.tsx`:

1. **VideoPanel**: Displays local and bot video streams
2. **ControlPanel**: Camera, microphone, and connection controls
3. **ChatInterface**: Real-time chat with voice transcription
4. **ConnectionStatus**: Shows current connection state

### RTVI Events Handled

- `RTVIEvent.UserTranscription`: User speech-to-text
- `RTVIEvent.BotLLMText`: Bot text responses
- `RTVIEvent.TransportStateChanged`: Connection status updates

## Troubleshooting

### Common Issues

1. **Connection fails**: Check `VITE_PIPECAT_API_URL` and backend availability
2. **No video/audio**: Ensure camera/microphone permissions are granted
3. **Chat not working**: Verify RTVI events are properly configured in backend

### Browser Requirements

- Modern browser with WebRTC support
- Camera and microphone permissions
- Secure context (HTTPS) for production

## License

MIT License - see LICENSE file for details
