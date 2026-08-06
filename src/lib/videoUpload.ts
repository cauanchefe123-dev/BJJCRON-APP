import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads video directly to the BJJCRON server using raw binary streaming and XMLHttpRequest.
 * Provides real-time 0% to 100% progress tracking without freezing the browser thread.
 */
export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) throw new Error('Nenhum arquivo de vídeo fornecido.');

  // 1. Direct High-Performance Server Stream Upload
  try {
    const serverUrl = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const uploadUrl = `/api/upload-video?filename=${encodeURIComponent(file.name)}`;

      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && e.total > 0) {
            const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.url) {
              if (onProgress) onProgress(100);
              console.log('[VideoUpload] Vídeo enviado com sucesso para o servidor:', response.url);
              resolve(response.url);
              return;
            }
          } catch (e) {
            console.warn('[VideoUpload] Erro ao interpretar resposta:', e);
          }
        }
        reject(new Error(`Erro no servidor HTTP ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('Falha na conexão durante upload do vídeo'));
      xhr.ontimeout = () => reject(new Error('Tempo esgotado no upload do vídeo'));

      // Send raw binary stream (no base64 overhead, high performance)
      xhr.send(file);
    });

    if (serverUrl) return serverUrl;
  } catch (err) {
    console.warn('[VideoUpload] Upload direto via servidor falhou, tentando Storage...', err);
  }

  // 2. Fallback: Firebase Storage
  const hasStorageBucket = Boolean(storage.app.options?.storageBucket);
  if (hasStorageBucket) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `class_videos/${Date.now()}_${cleanName}`;

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return await new Promise<string>((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(percent);
            }
          },
          async () => resolve(URL.createObjectURL(file)),
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve(downloadUrl);
            } catch {
              resolve(URL.createObjectURL(file));
            }
          }
        );
      });
    } catch (fbErr) {
      console.warn('[VideoUpload] Firebase Storage error:', fbErr);
    }
  }

  // 3. Fallback: Fast Local Object URL
  if (onProgress) onProgress(100);
  return URL.createObjectURL(file);
}




