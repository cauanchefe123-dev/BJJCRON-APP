import React from 'react';
import { X, Video, ExternalLink, Sparkles, Play } from 'lucide-react';

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
  if (!isOpen) return null;

  const parseEmbedUrl = (url?: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // YouTube regex (supports shorts, watch, embed, youtu.be)
    const ytMatch = cleanUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&playsinline=1&enablejsapi=1`;
    }

    // Vimeo regex
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Google Drive file
    const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    // Instagram Reel / Post
    const instaMatch = cleanUrl.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/);
    if (instaMatch && instaMatch[1]) {
      return `https://www.instagram.com/p/${instaMatch[1]}/embed`;
    }

    return null;
  };

  const embedUrl = parseEmbedUrl(videoUrl);
  const isDirectVideo =
    videoUrl?.startsWith('data:video') ||
    videoUrl?.startsWith('blob:') ||
    videoUrl?.match(/\.(mp4|webm|ogg|mov|m4v|3gp)(\?.*)?$/i);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-3xl w-full text-white shadow-2xl overflow-hidden relative flex flex-col my-auto max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                Player do Tatame — Vídeo da Posição
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Fechar Vídeo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {focusText && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-amber-400 block">Técnica em Destaque:</span>
                <p className="text-xs text-slate-200 font-medium">{focusText}</p>
              </div>
            </div>
          )}

          {/* Video Container */}
          <div className="bg-black rounded-xl overflow-hidden border border-slate-800 aspect-video relative flex items-center justify-center shadow-inner min-h-[220px]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Vídeo: ${title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : isDirectVideo && videoUrl ? (
              <video
                src={videoUrl}
                controls
                playsInline
                preload="auto"
                controlsList="nodownload"
                className="w-full h-full object-contain"
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/quicktime" />
                Seu celular/navegador não suporta a reprodução direta deste formato de vídeo.
              </video>
            ) : videoUrl ? (
              /* Fallback iframe player attempting to load generic link or player fallback */
              <div className="w-full h-full flex flex-col">
                <iframe
                  src={videoUrl}
                  title={`Vídeo Integrado: ${title}`}
                  className="w-full h-full border-0 flex-1"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-2 text-slate-500">
                <Video className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs">Nenhum vídeo foi anexado para esta posição.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir Vídeo em Nova Aba / App Externo
            </a>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all ml-auto"
          >
            Fechar Player
          </button>
        </div>

      </div>
    </div>
  );
};
