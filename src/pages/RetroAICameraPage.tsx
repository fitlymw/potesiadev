import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/context/GamificationContext';
import { Camera, Upload, X, RefreshCw, Loader2, ArrowLeft, Download, Monitor, CameraOff } from 'lucide-react';

// ==================== HELPER ====================
/**
 * Fungsi Helper untuk memastikan jalur aset benar di GitHub Pages.
 */
const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL.slice(0, -1);
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

// ==================== TYPES ====================
interface CapturedImage {
  before: string | null;
  after: string | null;
}

// ==================== CONSTANTS ====================
const GOOGLE_DRIVE_FOLDER_ID = '1XVTOJRmn-HR1pBwJFDjHoCRdJVOe_AcQ';
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxcSzDxFiNCy8qCf1ydjuUnstlemniOHqJ1ulTB_tleGyUvaaMxzBJQFbGUqTVmpzC-0Q/exec';

const GENDER_MESSAGES = {
  female: ['BEATIFUL!@!@ 💋💍💖', 'Holly Cute 💅✨🥰'],
  male: ['SO HANDSOME!@ 🗿🔥', 'Holly SIGMA 🥶🐺'],
};

// ==================== RETRO AI CAMERA PAGE ====================
export function RetroAICameraPage() {
  const navigate = useNavigate();
  const { startPlaying, stopPlaying, addExp } = useGamification();
  
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<CapturedImage>({ before: null, after: null });
  const [showResult, setShowResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [showCameraSelect, setShowCameraSelect] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getAvailableCameras = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.getTracks().forEach(track => track.stop());
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      setPermissionDenied(false);
      
      if (cameras.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(cameras[0].deviceId);
      }
      return cameras;
    } catch (err: any) {
      console.error('Error getting cameras:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      }
      return [];
    }
  }, [selectedDeviceId]);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      setShowResult(false);

      if (availableCameras.length === 0) {
        await getAvailableCameras();
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
      };

      if (selectedDeviceId) {
        constraints.video = {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };
      } else {
        constraints.video = {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
          setIsActive(true);
          startPlaying?.();
        } catch (playErr) {
          console.error('Play error:', playErr);
          setError('Could not start video playback');
        }
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
        setPermissionDenied(true);
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  }, [selectedDeviceId, startPlaying, getAvailableCameras, availableCameras.length]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    stopPlaying?.();
  }, [stopPlaying]);

  const handleCameraSelect = useCallback(async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setShowCameraSelect(false);
    
    stopCamera();
    await new Promise(resolve => setTimeout(resolve, 100));
    await startCamera();
  }, [stopCamera, startCamera]);

  const getCameraName = (camera: MediaDeviceInfo) => {
    const label = camera.label || `Camera ${camera.deviceId.slice(0, 8)}`;
    if (label.toLowerCase().includes('front') || label.toLowerCase().includes('fac')) {
      return '📱 Front Camera';
    } else if (label.toLowerCase().includes('back') || label.toLowerCase().includes('rear')) {
      return '📷 Back Camera';
    } else if (label.toLowerCase().includes('webcam')) {
      return '💻 Webcam';
    }
    return `📷 ${label.slice(0, 25)}`;
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setError('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0);
      const beforeImage = canvas.toDataURL('image/jpeg', 0.9);
      
      const smallCanvas = document.createElement('canvas');
      const smallCtx = smallCanvas.getContext('2d');
      if (!smallCtx) return;
      
      const pixelSize = 8;
      smallCanvas.width = Math.floor(canvas.width / pixelSize);
      smallCanvas.height = Math.floor(canvas.height / pixelSize);
      
      ctx.imageSmoothingEnabled = false;
      smallCtx.imageSmoothingEnabled = false;
      
      smallCtx.drawImage(video, 0, 0, smallCanvas.width, smallCanvas.height);
      ctx.drawImage(smallCanvas, 0, 0, canvas.width, canvas.height);
      
      const detectedGender: 'male' | 'female' = Math.random() > 0.5 ? 'female' : 'male';
      setGender(detectedGender);
      
      const messages = GENDER_MESSAGES[detectedGender];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMessage);
      
      ctx.font = `bold ${Math.floor(canvas.width / 15)}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      
      const textY = canvas.height * 0.15;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, textY - canvas.height * 0.08, canvas.width, canvas.height * 0.12);
      
      ctx.strokeStyle = detectedGender === 'female' ? '#ff69b4' : '#00bfff';
      ctx.lineWidth = 3;
      ctx.strokeText(randomMessage, canvas.width / 2, textY);
      
      ctx.fillStyle = detectedGender === 'female' ? '#ffb6c1' : '#87ceeb';
      ctx.fillText(randomMessage, canvas.width / 2, textY);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillRect(0, i, canvas.width, 2);
      }
      
      const afterImage = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage({ before: beforeImage, after: afterImage });
      
      stopCamera();
      setShowResult(true);
      addExp?.(15);
      
    } catch (err) {
      console.error('Processing error:', err);
      setError('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [addExp, stopCamera]);

  const saveToDevice = useCallback(async (type: 'before' | 'after' | 'both') => {
    if (!capturedImage.before || !capturedImage.after) return;

    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      
      const saveImage = (dataUrl: string, suffix: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `retro-photo-${timestamp}-${suffix}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      if (type === 'before') {
        saveImage(capturedImage.before, 'before');
      } else if (type === 'after') {
        saveImage(capturedImage.after, 'after');
      } else {
        saveImage(capturedImage.after, 'retro');
        setTimeout(() => {
          saveImage(capturedImage.before!, 'original');
        }, 500);
      }
      
      addExp?.(10);
    } catch (err) {
      console.error('Save error:', err);
      setError('Error saving image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [capturedImage, addExp]);

  const uploadToDrive = useCallback(async () => {
    if (!capturedImage.before || !capturedImage.after) return;

    setIsUploading(true);
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: GOOGLE_DRIVE_FOLDER_ID,
          beforeImage: capturedImage.before,
          afterImage: capturedImage.after,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        addExp?.(25);
        alert('✅ Images uploaded to Google Drive successfully! 🎉');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      addExp?.(25);
      alert('⚠️ Google Drive upload unavailable.');
    } finally {
      setIsUploading(false);
    }
  }, [capturedImage, addExp]);

  const reset = useCallback(() => {
    setCapturedImage({ before: null, after: null });
    setGender(null);
    setMessage('');
    setError('');
    setShowResult(false);
  }, []);

  const handleBack = useCallback(() => {
    stopCamera();
    reset();
    navigate('/games');
  }, [stopCamera, reset, navigate]);

  useEffect(() => {
    getAvailableCameras();
  }, [getAvailableCameras]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // PERBAIKAN: Jalur background sekarang menggunakan getAssetUrl dan nama file snake_case
          backgroundImage: `url(${getAssetUrl('/images/castle_retro.gif')})`,
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="absolute inset-0 scanlines pointer-events-none z-10" />
      <div className="absolute inset-0 vignette pointer-events-none z-20" />

      <div className="relative z-30 flex flex-col min-h-screen">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-hound-panel/80 border-b border-amber-500/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <h2 className="text-lg sm:text-xl text-white font-bold retro-glow">Retro AI Camera</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {availableCameras.length > 0 && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCameraSelect(!showCameraSelect)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </motion.button>
                
                {showCameraSelect && (
                  <div className="absolute right-0 top-12 bg-hound-panel border border-amber-500/50 rounded-lg py-2 min-w-[220px] z-50 shadow-lg max-h-[200px] overflow-y-auto">
                    <p className="text-white/60 text-xs px-3 py-1 border-b border-white/10 mb-1 sticky top-0 bg-hound-panel">
                      Select Camera:
                    </p>
                    {availableCameras.map((camera) => (
                      <button
                        key={camera.deviceId}
                        onClick={() => handleCameraSelect(camera.deviceId)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                          selectedDeviceId === camera.deviceId ? 'text-amber-400 bg-amber-500/10' : 'text-white'
                        }`}
                      >
                        {getCameraName(camera)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={getAvailableCameras}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </motion.button>
            
            <button
              onClick={() => { stopCamera(); reset(); }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
          <AnimatePresence mode="wait">
            {showResult && capturedImage.after ? (
              <motion.div
                key="result"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 20
                }}
                className="relative w-full max-w-2xl"
              >
                <div className="relative bg-black border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                  <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-amber-400 z-10" />
                  <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-amber-400 z-10" />
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-amber-400 z-10" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-amber-400 z-10" />
                  
                  <div className="bg-gradient-to-r from-amber-900 to-purple-900 px-6 py-3 text-center">
                    <h3 
                      className="text-amber-400 font-bold"
                      style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.9rem' }}
                    >
                      ⚔️ RESULT ⚔️
                    </h3>
                  </div>
                  
                  <div className="overflow-hidden">
                    <img
                      src={capturedImage.after}
                      alt="Processed"
                      className="w-full aspect-[4/3] object-contain"
                    />
                  </div>
                  
                  <div className="bg-black/80 px-4 py-2 text-center border-t border-amber-500/30">
                    <p 
                      className="text-cyan-400 font-bold"
                      style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.7rem' }}
                    >
                      {message}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={uploadToDrive}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded border-2 border-purple-400 hover:bg-purple-700 disabled:opacity-50"
                    style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.6rem' }}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    UPLOAD
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => saveToDevice('after')}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded border-2 border-green-400 hover:bg-green-700 disabled:opacity-50"
                    style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.6rem' }}
                  >
                    <Download className="w-4 h-4" />
                    SAVE RETRO
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { reset(); startCamera(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold rounded border-2 border-amber-400 hover:bg-amber-600"
                    style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.6rem' }}
                  >
                    <Camera className="w-4 h-4" />
                    NEW PHOTO
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full max-w-2xl aspect-[4/3] sm:aspect-video bg-black border-4 border-amber-500/50 rounded-lg overflow-hidden"
              >
                {isActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/50 p-4 text-center">
                    {permissionDenied ? (
                      <>
                        <CameraOff className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 text-red-400" />
                        <p className="text-sm sm:text-base text-red-400 mb-2">Camera Access Denied</p>
                        <p className="text-xs sm:text-sm text-white/40 mb-4">
                          Please allow camera access in your browser settings.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={getAvailableCameras}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold rounded text-sm"
                        >
                          <Camera className="w-4 h-4" />
                          Try Again
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">Click "Start Camera" to begin</p>
                        {availableCameras.length > 0 && (
                          <p className="text-xs sm:text-sm text-white/30 mt-2">
                            {availableCameras.length} camera(s) detected
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-spin" />
                      <p className="text-amber-400 font-pixel text-sm">Processing...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-3 sm:p-4 bg-hound-panel/80 border-t border-amber-500/30">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {!isActive && !showResult && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCamera}
                disabled={permissionDenied}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-amber-500 text-black font-bold rounded text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                Start Camera
              </motion.button>
            )}

            {isActive && !showResult && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white font-bold rounded text-sm sm:text-base hover:bg-red-600 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  Capture
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopCamera}
                  className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white font-bold rounded text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Stop
                </motion.button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded text-sm max-w-[90%] text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}