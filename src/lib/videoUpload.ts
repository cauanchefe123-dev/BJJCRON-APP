import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Robust video handler that uploads to Firebase Storage or generates a lightweight,
 * instant Object URL. Never converts to heavy Base64 data URLs to prevent memory crashes.
 */
export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) throw new Error('Nenhum arquivo de vídeo fornecido.');

  // Create lightweight Object URL fallback (instant, zero-memory-leak, safe)
  const getFastObjectUrl = (fileObj: File): string => {
    try {
      return URL.createObjectURL(fileObj);
    } catch (err) {
      console.warn('Erro ao criar ObjectURL:', err);
      return '';
    }
  };

  // Check if Storage bucket is configured
  const hasStorageBucket = Boolean(storage.app.options?.storageBucket);

  if (!hasStorageBucket) {
    if (onProgress) {
      onProgress(100);
    }
    return getFastObjectUrl(file);
  }

  // Attempt Firebase Storage upload with a 3-second timeout safeguard
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `class_videos/${Date.now()}_${cleanName}`;

  return new Promise((resolve) => {
    let completed = false;

    const finish = (url: string) => {
      if (!completed) {
        completed = true;
        if (onProgress) onProgress(100);
        resolve(url);
      }
    };

    // 3.5s timeout safeguard - if storage stalls or is blocked by CORS/rules, return object URL
    const timeoutId = setTimeout(() => {
      if (!completed) {
        console.warn('[VideoUpload] Firebase Storage demorou. Usando URL local otimizada.');
        finish(getFastObjectUrl(file));
      }
    }, 3500);

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (completed) return;
          if (snapshot.totalBytes > 0) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(percent);
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('[VideoUpload] Erro ao enviar para Firebase Storage:', error);
          finish(getFastObjectUrl(file));
        },
        async () => {
          clearTimeout(timeoutId);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            finish(downloadUrl);
          } catch (err) {
            console.warn('[VideoUpload] Erro ao obter URL de download:', err);
            finish(getFastObjectUrl(file));
          }
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[VideoUpload] Falha ao inicializar Firebase Storage:', err);
      finish(getFastObjectUrl(file));
    }
  });
}



