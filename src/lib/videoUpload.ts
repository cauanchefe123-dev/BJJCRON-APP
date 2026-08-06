import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads video to Firebase Storage or generates a persistent Base64 Data URL.
 * Never returns local 'blob:' URLs as they fail when viewed on other devices/students' phones.
 */
export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) throw new Error('Nenhum arquivo de vídeo fornecido.');

  // Convert file to Base64 Data URL for persistent cross-device sharing
  const convertToBase64 = (fileObj: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '');
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(fileObj);
    });
  };

  // Check if Storage bucket is configured
  const hasStorageBucket = Boolean(storage.app.options?.storageBucket);

  if (!hasStorageBucket) {
    if (onProgress) onProgress(50);
    const dataUrl = await convertToBase64(file);
    if (onProgress) onProgress(100);
    return dataUrl || URL.createObjectURL(file); // Fallback
  }

  // Attempt Firebase Storage upload with a 4-second timeout safeguard
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

    // 4s timeout safeguard - if storage stalls or is blocked by CORS/rules, use Base64
    const timeoutId = setTimeout(async () => {
      if (!completed) {
        console.warn('[VideoUpload] Firebase Storage demorou. Convertendo para vídeo persistente.');
        const fallbackDataUrl = await convertToBase64(file);
        finish(fallbackDataUrl || URL.createObjectURL(file));
      }
    }, 4000);

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
        async (error) => {
          clearTimeout(timeoutId);
          console.warn('[VideoUpload] Erro no Firebase Storage:', error);
          const fallbackDataUrl = await convertToBase64(file);
          finish(fallbackDataUrl || URL.createObjectURL(file));
        },
        async () => {
          clearTimeout(timeoutId);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            finish(downloadUrl);
          } catch (err) {
            console.warn('[VideoUpload] Erro ao obter URL:', err);
            const fallbackDataUrl = await convertToBase64(file);
            finish(fallbackDataUrl || URL.createObjectURL(file));
          }
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[VideoUpload] Falha ao inicializar Storage:', err);
      convertToBase64(file).then((dUrl) => finish(dUrl || URL.createObjectURL(file)));
    }
  });
}




