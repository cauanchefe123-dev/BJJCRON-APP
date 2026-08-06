import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) throw new Error('Nenhum arquivo fornecido.');

  // Clean filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `class_videos/${Date.now()}_${cleanName}`;

  const convertToDataUrl = (fileObj: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || URL.createObjectURL(fileObj));
      reader.onerror = () => resolve(URL.createObjectURL(fileObj));
      reader.readAsDataURL(fileObj);
    });
  };

  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(progress);
        },
        async (error) => {
          console.warn('Firebase storage upload error, using portable fallback:', error);
          if (file.size <= 10 * 1024 * 1024) {
            const dataUrl = await convertToDataUrl(file);
            resolve(dataUrl);
          } else {
            resolve(URL.createObjectURL(file));
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            console.warn('Error getting download URL, using portable fallback:', err);
            if (file.size <= 10 * 1024 * 1024) {
              const dataUrl = await convertToDataUrl(file);
              resolve(dataUrl);
            } else {
              resolve(URL.createObjectURL(file));
            }
          }
        }
      );
    });
  } catch (err) {
    console.warn('Cloud storage initialization failed, using portable fallback:', err);
    if (file.size <= 10 * 1024 * 1024) {
      return convertToDataUrl(file);
    }
    return URL.createObjectURL(file);
  }
}

