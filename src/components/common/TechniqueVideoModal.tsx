import React, { useState, useEffect, useRef } from 'react';
import { X, Video, ExternalLink, Sparkles, Play, ShieldAlert } from 'lucide-react';

interface TechniqueVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  focusText?: string;
  videoUrl?: string;
}

export const TechniqueVideoModal: React.FC<TechniqueVideoModalProps> = ({
  isOpen,
  onClose,
  title,
  focusText,
  videoUrl,
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isPlayingDirect, setIsPlayingDirect] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setVideoError(false);
    setIsPlayingDirect(false);
  }, [videoUrl, isOpen]);

  if (!isOpen) return null;

  const cleanUrl = videoUrl?.trim() || '';

  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(cleanUrl);
  const isGoogleDrive = /(?:drive\.google\.com|docs\.google\.com)/i.test(cleanUrl);
  const isInstagram = /instagram\.com/i.test(cleanUrl);
  const isTikTok = /tiktok\.com/i.test(cleanUrl);
  const isVimeo = /vimeo\.com/i.test(cleanUrl);

  const isBlob = cleanUrl.startsWith('blob:');
  const isDataUrl = cleanUrl.startsWith('data:video');
  const isFirebaseStorage = cleanUrl.includes('firebasestorage.googleapis.com');
  const isDirectFile =
    isDataUrl ||
    isBlob ||
    isFirebaseStorage ||
    /\.(mp4|webm|ogg|mov|m4v|3gp)(\?.*)?$/i.test(cleanUrl);

  // Extract ID / Direct Link for Native App launch
  const getDirectNativeUrl = (url: string) => {
    if (!url) return '';

    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
    }

    // Google Drive
    const driveMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/i);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/view`;
    }

    // Instagram
    const instaMatch = url.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/i);
    if (instaMatch && instaMatch[1]) {
      return `https://www.instagram.com/reel/${instaMatch[1]}/`;
    }

    return url;
  };

  const directNativeUrl = getDirectNativeUrl(cleanUrl);

  // Generate Embed URL
  const parseEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&playsinline=1&enablejsapi=1&modestbranding=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?playsinline=1`;
    }

    // Google Drive (Only use preview if valid ID)
    const driveMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/i);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    // Instagram
    const instaMatch = url.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/i);
    if (instaMatch && instaMatch[1]) {
      return `https://www.instagram.com/p/${instaMatch[1]}/embed/captioned/`;
    }

    // TikTok
    const tiktokMatch = url.match(/tiktok\.com\/.*\/video\/([0-9]+)/i);
    if (tiktokMatch && tiktokMatch[1]) {
      return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
    }

    return null;
  };

  const embedUrl = parseEmbedUrl(cleanUrl);

  const getButtonLabel = () => {
    if (isYouTube) return 'Assistir no App do YouTube 📱';
    if (isGoogleDrive) return 'Abrir no Google Drive 📱';
    if (isInstagram) return 'Abrir no Instagram 📱';
    if (isTikTok) return 'Abrir no TikTok 📱';
    if (isVimeo) return 'Abrir no Vimeo 📱';
    return 'Assistir Vídeo 📱';
  };

  const handlePlayDirectVideo = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlayingDirect(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          setVideoError(true);
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-2xl w-full text-white shadow-2xl overflow-hidden relative flex flex-col my-auto max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block truncate">
                Player do Tatame — BJJCRON
              </span>
              <h3 className="font-extrabold text-xs sm:text-base text-slate-100 truncate">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1">
          {/* Technique Focus Badge */}
          {focusText && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-amber-400 block">Foco Técnico da Posição:</span>
                <p className="text-xs text-slate-200 font-medium">{focusText}</p>
              </div>
            </div>
          )}

          {/* Warning for outdated local blob URLs */}
          {isBlob && (
            <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2.5 text-xs text-amber-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-[11px]">
                Vídeo gravado localmente neste navegador. Para disponibilizar aos alunos em qualquer celular, recomende ao professor colar o link do YouTube na edição da turma.
              </p>
            </div>
          )}

          {/* Main Player Box */}
          <div className="bg-black rounded-xl overflow-hidden border border-slate-800 aspect-video relative flex items-center justify-center shadow-2xl min-h-[220px]">
            {videoError ? (
              /* Error fallback - Single Clean Gold Action Button */
              <div className="p-6 text-center space-y-4 my-auto">
                <Video className="w-12 h-12 text-amber-400 mx-auto opacity-90" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-100">Vídeo da Posição</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Toque no botão abaixo para reproduzir diretamente no celular.
                  </p>
                </div>
                {cleanUrl && (
                  <a
                    href={directNativeUrl || cleanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-xl active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{getButtonLabel()}</span>
                  </a>
                )}
              </div>
            ) : embedUrl ? (
              /* Embed Player (YouTube, Vimeo, Drive, Insta) */
              <div className="w-full h-full relative bg-black">
                <iframe
                  src={embedUrl}
                  title={`Vídeo: ${title}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  onError={() => setVideoError(true)}
                />
              </div>
            ) : isDirectFile && cleanUrl ? (
              /* Direct HTML5 Video Player */
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={cleanUrl}
                  controls
                  playsInline
                  // @ts-ignore
                  webkit-playsinline="true"
                  preload="metadata"
                  controlsList="nodownload"
                  onError={() => setVideoError(true)}
                  onPlay={() => setIsPlayingDirect(true)}
                  className="w-full h-full object-contain max-h-[60vh] rounded-xl"
                >
                  <source src={cleanUrl} type="video/mp4" />
                  <source src={cleanUrl} type="video/quicktime" />
                  <source src={cleanUrl} type="video/webm" />
                </video>

                {!isPlayingDirect && (
                  <button
                    onClick={handlePlayDirectVideo}
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-amber-400 hover:text-amber-300 transition-all group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-amber-500 group-hover:bg-amber-400 flex items-center justify-center shadow-2xl text-slate-950 pl-1 transform group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-slate-950 text-slate-950" />
                    </div>
                    <span className="text-xs font-black bg-slate-950/90 px-3.5 py-1.5 rounded-full text-white border border-amber-500/40 shadow-md">
                      Toque para Iniciar o Vídeo
                    </span>
                  </button>
                )}
              </div>
            ) : cleanUrl ? (
              /* Direct Action Player Box */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950">
                <Video className="w-12 h-12 text-amber-400 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-100">Vídeo Disponível</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Clique no botão abaixo para abrir e assistir ao vídeo.
                  </p>
                </div>
                <a
                  href={directNativeUrl || cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{getButtonLabel()}</span>
                </a>
              </div>
            ) : (
              /* No video attached */
              <div className="text-center p-8 space-y-2 text-slate-500 my-auto">
                <Video className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs">Nenhum vídeo anexado para esta posição.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            Fechar Player
          </button>
        </div>

      </div>
    </div>
  );
};
