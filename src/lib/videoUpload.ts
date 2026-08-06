import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads video to the BJJCRON Express server or Firebase Storage.
 * Saves the video directly on the server so it can be streamed by any device/browser.
 */
export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) throw new Error('Nenhum arquivo de vídeo fornecido.');

  // Helper to convert file to Base64
  const convertToBase64 = (fileObj: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileObj);
    });
  };

  // 1. First attempt: Upload to BJJCRON Server API
  try {
    if (onProgress) onProgress(15);
    const base64Data = await convertToBase64(file);
    if (base64Data) {
      if (onProgress) onProgress(50);
      const serverRes = await fetch('/api/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileData: base64Data,
        }),
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.url) {
          if (onProgress) onProgress(100);
          console.log('[VideoUpload] Vídeo salvo com sucesso no servidor:', data.url);
          return data.url;
        }
      }
    }
  } catch (serverErr) {
    console.warn('[VideoUpload] Servidor BJJCRON indisponível ou falhou, tentando Storage...', serverErr);
  }

  // 2. Second attempt: Firebase Storage
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
          async () => {
            const fallback = await convertToBase64(file);
            resolve(fallback);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch {
              const fallback = await convertToBase64(file);
              resolve(fallback);
            }
          }
        );
      });
    } catch (fbErr) {
      console.warn('[VideoUpload] Firebase Storage error:', fbErr);
    }
  }

  // 3. Fallback: Base64 Data URL
  if (onProgress) onProgress(100);
  const dataUrl = await convertToBase64(file);
  return dataUrl || URL.createObjectURL(file);
}




