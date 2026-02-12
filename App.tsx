import React, { useState, useEffect, useCallback } from 'react';
import { RefractiveButton } from './components/RefractiveButton';
import { PromptDisplay } from './components/PromptDisplay';

type CameraStatus = 'idle' | 'loading' | 'active' | 'error';

const App: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const enableCamera = useCallback(async () => {
    setCameraStatus('loading');
    setError(null);
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: "user" 
        },
        audio: false 
      });
      setStream(userStream);
      setCameraStatus('active');
    } catch (err: any) {
      console.error("Error accessing webcam:", err);
      setCameraStatus('error');
      if (err.name === 'NotAllowedError') {
        setError("Access denied. Please enable camera permissions in your browser settings.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera device found.");
      } else {
        setError("Failed to access camera. Please try again.");
      }
    }
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden p-6 bg-slate-50">
      {/* Soft Top Lighting */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none" />
      
      {/* UI Elements */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-16 z-10 w-full">
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black tracking-[0.6em] uppercase text-zinc-400">
            {cameraStatus === 'active' ? 'Surface Mapping Active' : 'Optical Sensors Offline'}
          </p>
          <div className={`h-[1px] w-8 mx-auto transition-colors duration-500 ${cameraStatus === 'active' ? 'bg-emerald-400' : 'bg-zinc-300'}`} />
        </div>
        
        <div className="relative py-20 px-32 flex flex-col items-center justify-center gap-12">
          {/* Floor Shadow */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[240px] h-[60px] bg-black/10 blur-[40px] rounded-full" />
          
          <RefractiveButton mouseX={mousePos.x} mouseY={mousePos.y} stream={stream} />

          {cameraStatus !== 'active' && (
            <button 
              onClick={enableCamera}
              disabled={cameraStatus === 'loading'}
              className="relative group px-8 py-3 bg-[#0f172a] text-white rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="relative flex items-center gap-3">
                {cameraStatus === 'loading' ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${cameraStatus === 'error' ? 'bg-red-500' : 'bg-emerald-400'} animate-pulse`} />
                )}
                <span className="text-[11px] font-black tracking-[0.2em] uppercase">
                  {cameraStatus === 'loading' ? 'Initializing...' : cameraStatus === 'error' ? 'Retry Connection' : 'Initialize Reflection'}
                </span>
              </div>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-[10px] font-bold px-6 py-3 rounded-full flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            {error}
          </div>
        )}
      </div>

      {/* Build Prompt Section */}
      {/* <div className="w-full max-w-4xl bg-white/40 backdrop-blur-3xl border border-white p-8 rounded-[48px] shadow-2xl mb-8 transform transition-transform hover:scale-[1.01]">
        <PromptDisplay />
      </div> */}

      <footer className="mb-6 flex items-center gap-12 text-zinc-400 text-[10px] font-black tracking-[0.3em] uppercase opacity-60">
        <span>MADE BY LUCKYY</span>
        <span>GITHUB - Jitendrarajputt</span>
      </footer>
    </div>
  );
};

export default App;