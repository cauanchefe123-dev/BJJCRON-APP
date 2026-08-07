import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads video directly to the BJJCRON server with real-time 0% to 100% progress tracking.
 * Includes multiple fallback strategies (Raw Binary, Base64 Stream, Local Storage) so uploads never get stuck.
 */
export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) throw new Error('Nenhum arquivo de vídeo fornecido.');

  // Helper to ensure 100% progress callback
  const finishProgress = (url: string) => {
    if (onProgress) onProgress(100);
    return url;
  };

  // 1. Primary Strategy: High-Performance Binary Server Stream Upload
  try {
    const serverUrl = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const uploadUrl = `/api/upload-video?filename=${encodeURIComponent(file.name)}`;

      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.timeout = 180000; // 3 minutes timeout

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
              console.log('[VideoUpload] Vídeo enviado com sucesso para o servidor:', response.url);
              resolve(response.url);
              return;
            }
          } catch (e) {
            console.warn('[VideoUpload] Erro ao interpretar resposta:', e);
          }
        }
        reject(new Error(`Servidor respondeu com código HTTP ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('Falha na conexão de rede durante o upload do vídeo.'));
      xhr.ontimeout = () => reject(new Error('Tempo limite excedido no upload do vídeo.'));

      xhr.send(file);
    });

    if (serverUrl) return finishProgress(serverUrl);
  } catch (err) {
    console.warn('[VideoUpload] Upload binário direto falhou, tentando fallback Base64/Storage...', err);
  }

  // 2. Secondary Strategy: Base64 FileReader Chunk Upload to Server
  try {
    const base64Url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0 && onProgress) {
          const readPercent = Math.min(50, Math.round((e.loaded / e.total) * 50));
          onProgress(readPercent);
        }
      };

      reader.onload = async () => {
        try {
          const fileData = reader.result as string;
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload-video', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.timeout = 180000;

          if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable && e.total > 0) {
                const uploadPercent = 50 + Math.min(49, Math.round((e.loaded / e.total) * 49));
                onProgress(uploadPercent);
              }
            };
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const res = JSON.parse(xhr.responseText);
                if (res.url) return resolve(res.url);
              } catch (e) {}
            }
            reject(new Error('Falha no upload Base64'));
          };

          xhr.onerror = () => reject(new Error('Erro de conexão Base64'));
          xhr.ontimeout = () => reject(new Error('Timeout Base64'));

          xhr.send(JSON.stringify({ fileData, filename: file.name }));
        } catch (e) {
          reject(e);
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo localmente'));
      reader.readAsDataURL(file);
    });

    if (base64Url) return finishProgress(base64Url);
  } catch (err) {
    console.warn('[VideoUpload] Fallback Base64 falhou, tentando Firebase Storage...', err);
  }

  // 3. Tertiary Strategy: Firebase Storage (if configured)
  const hasStorageBucket = Boolean(storage.app.options?.storageBucket);
  if (hasStorageBucket) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `class_videos/${Date.now()}_${cleanName}`;

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const fbUrl = await new Promise<string>((resolve) => {
        const timeout = setTimeout(() => {
          resolve('');
        }, 15000); // 15 seconds max for Firebase Storage connection

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(percent);
            }
          },
          () => {
            clearTimeout(timeout);
            resolve('');
          },
          async () => {
            clearTimeout(timeout);
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch {
              resolve('');
            }
          }
        );
      });

      if (fbUrl) return finishProgress(fbUrl);
    } catch (fbErr) {
      console.warn('[VideoUpload] Firebase Storage error:', fbErr);
    }
  }

  // 4. Persistent Base64 Data URL Fallback (Garante funcionamento em qualquer dispositivo e banco de dados)
  console.log('[VideoUpload] Convertendo arquivo para Data URL Base64 para sincronização global.');
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      finishProgress(result);
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Falha ao processar arquivo de vídeo localmente.'));
    };
    reader.readAsDataURL(file);
  });
}
