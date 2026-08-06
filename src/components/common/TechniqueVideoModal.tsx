import React, { useState, useEffect, useRef } from 'react';
import { X, Video, ExternalLink, Sparkles, Play, AlertTriangle, RefreshCw } from 'lucide-react';

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

  // Detect Video Source Types
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

  // Generate Embed URL
  const parseEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube (Shorts, Watch, Embed, Youtu.be, Mobile)
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      // Avoid autoplay=1 on mobile as mobile browsers block unmuted iframe autoplay and cause black screen
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&playsinline=1&enablejsapi=1&modestbranding=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?playsinline=1`;
    }

    // Google Drive
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

  // Helper for direct external application launch
  const getExternalLinkText = () => {
    if (isYouTube) return 'Abrir no App do YouTube 📲';
    if (isGoogleDrive) return 'Abrir no Google Drive 📲';
    if (isInstagram) return 'Abrir no Instagram 📲';
    if (isTikTok) return 'Abrir no TikTok 📲';
    if (isVimeo) return 'Abrir no Vimeo 📲';
    return 'Abrir em Tela Cheia / App 📲';
  };

  const handlePlayDirectVideo = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlayingDirect(true))
        .catch((err) => {
          console.warn('Mobile play error:', err);
          setVideoError(true);
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-3xl w-full text-white shadow-2xl overflow-hidden relative flex flex-col my-auto max-h-[95vh]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block truncate">
                Player de Vídeo — BJJCRON
              </span>
              <h3 className="font-extrabold text-xs sm:text-base text-slate-100 truncate">{title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {cleanUrl && (
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                title="Abrir diretamente no celular"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{getExternalLinkText()}</span>
                <span className="sm:hidden">Abrir App</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Fechar Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {focusText && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-amber-400 block">Foco Técnico da Posição:</span>
                <p className="text-xs text-slate-200 font-medium">{focusText}</p>
              </div>
            </div>
          )}

          {/* Local Blob Warning (when video was recorded/attached locally on teacher device) */}
          {isBlob && (
            <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Prévia Local de Vídeo</span>
              </div>
              <p className="text-[11px] text-amber-200/90">
                Este vídeo está armazenado temporariamente na memória deste aparelho. Se não rodar no celular dos alunos, solicite ao professor colar o link do YouTube ou Google Drive.
              </p>
            </div>
          )}

          {/* Main Video Container */}
          <div className="bg-black rounded-xl overflow-hidden border border-slate-800 aspect-video relative flex items-center justify-center shadow-2xl min-h-[220px]">
            {videoError ? (
              <div className="p-6 text-center space-y-3 my-auto">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-100">Proteção de Reprodução Celular</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Seu navegador móvel ou conexão bloqueou o player embutido. Toque no botão abaixo para assistir diretamente no app nativo em alta qualidade.
                  </p>
                </div>
                {cleanUrl && (
                  <a
                    href={cleanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{getExternalLinkText()}</span>
                  </a>
                )}
              </div>
            ) : embedUrl ? (
              <div className="w-full h-full relative">
                <iframe
                  src={embedUrl}
                  title={`Vídeo: ${title}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : isDirectFile && cleanUrl ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={cleanUrl}
                  controls
                  playsInline
                  preload="metadata"
                  controlsList="nodownload"
                  onError={() => setVideoError(true)}
                  onPlay={() => setIsPlayingDirect(true)}
                  className="w-full h-full object-contain max-h-[60vh]"
                >
                  <source src={cleanUrl} type="video/mp4" />
                  <source src={cleanUrl} type="video/webm" />
                  <source src={cleanUrl} type="video/quicktime" />
                  Seu celular não suporta a exibição direta deste formato de vídeo.
                </video>

                {/* Big Touch Play Overlay for Mobile browsers if paused */}
                {!isPlayingDirect && (
                  <button
                    onClick={handlePlayDirectVideo}
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 text-amber-400 hover:text-amber-300 transition-all group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-amber-500/90 group-hover:bg-amber-400 flex items-center justify-center shadow-xl text-slate-950 pl-1 transform group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-slate-950 text-slate-950" />
                    </div>
                    <span className="text-xs font-black bg-slate-950/80 px-3 py-1 rounded-full text-white border border-amber-500/30">
                      Toque para Iniciar o Vídeo no Celular
                    </span>
                  </button>
                )}
              </div>
            ) : cleanUrl ? (
              /* Generic URL fallback iframe */
              <div className="w-full h-full flex flex-col">
                <iframe
                  src={cleanUrl}
                  title={`Vídeo: ${title}`}
                  className="w-full h-full border-0 flex-1"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-2 text-slate-500">
                <Video className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs">Nenhum vídeo anexado para esta posição.</p>
              </div>
            )}
          </div>

          {/* Quick Direct Access Banner for Mobile Users */}
          {cleanUrl && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-[11px] text-slate-400">Dificuldades no navegador do celular?</span>
              </div>
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-center text-xs flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{getExternalLinkText()}</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between shrink-0">
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

