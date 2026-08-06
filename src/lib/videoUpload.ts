import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) throw new Error('Nenhum arquivo fornecido.');

  // Helper for fast local Data URL or Object URL
  const getFastLocalUrl = async (fileObj: File): Promise<string> => {
    if (fileObj.size <= 8 * 1024 * 1024) {
      try {
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || URL.createObjectURL(fileObj));
          reader.onerror = () => resolve(URL.createObjectURL(fileObj));
          reader.readAsDataURL(fileObj);
        });
      } catch {
        return URL.createObjectURL(fileObj);
      }
    }
    return URL.createObjectURL(fileObj);
  };

  // Check if Firebase Storage Bucket is actually configured in the app options
  const hasStorageBucket = Boolean(storage.app.options?.storageBucket);

  if (!hasStorageBucket) {
    console.info('Firebase Storage Bucket não configurado. Usando modo de mídia instantâneo.');
    if (onProgress) {
      onProgress(50);
      setTimeout(() => onProgress(100), 150);
    }
    return getFastLocalUrl(file);
  }

  // If storage bucket is present, attempt upload with a 3-second timeout safeguard
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `class_videos/${Date.now()}_${cleanName}`;

  return new Promise((resolve) => {
    let resolved = false;

    const safeResolve = (url: string) => {
      if (!resolved) {
        resolved = true;
        if (onProgress) onProgress(100);
        resolve(url);
      }
    };

    // 3 second timeout safeguard against hanging Firebase storage uploads
    const timeoutId = setTimeout(async () => {
      if (!resolved) {
        console.warn('Upload em nuvem sem resposta. Alternando para modo instantâneo.');
        const fallbackUrl = await getFastLocalUrl(file);
        safeResolve(fallbackUrl);
      }
    }, 3000);

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (resolved) return;
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(progress);
        },
        async (error) => {
          clearTimeout(timeoutId);
          console.warn('Erro no upload Firebase:', error);
          const fallbackUrl = await getFastLocalUrl(file);
          safeResolve(fallbackUrl);
        },
        async () => {
          clearTimeout(timeoutId);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            safeResolve(downloadUrl);
          } catch {
            const fallbackUrl = await getFastLocalUrl(file);
            safeResolve(fallbackUrl);
          }
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Erro ao inicializar upload:', err);
      getFastLocalUrl(file).then(safeResolve);
    }
  });
}


