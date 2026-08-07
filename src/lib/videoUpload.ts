import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads video files directly to Google Cloud / Firebase Storage for global student access.
 * Returns a permanent, cross-platform public HTTPS URL.
 */
export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) throw new Error('Nenhum arquivo de vídeo foi selecionado.');

  const finishProgress = (url: string) => {
    if (onProgress) onProgress(100);
    return url;
  };

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `class_videos/${Date.now()}_${cleanName}`;

  // 1. PRIMARY STRATEGY: Firebase Cloud Storage (Google Cloud Storage)
  if (storage) {
    try {
      console.log('[VideoUpload] Enviando para a nuvem do Firebase Storage...', storagePath);
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        // 10 minutes timeout for larger videos on mobile network
        const timeoutTimer = setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Tempo limite excedido no envio para o Firebase Storage.'));
        }, 600000);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const percent = Math.min(99, Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
              onProgress(percent);
            }
          },
          (error) => {
            clearTimeout(timeoutTimer);
            console.warn('[VideoUpload] Erro no Firebase Storage:', error);
            reject(error);
          },
          async () => {
            clearTimeout(timeoutTimer);
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('[VideoUpload] Vídeo salvo na nuvem com SUCESSO:', url);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      if (downloadUrl) {
        return finishProgress(downloadUrl);
      }
    } catch (firebaseErr) {
      console.warn('[VideoUpload] Falha no Firebase Storage, tentando servidor de retaguarda...', firebaseErr);
    }
  }

  // 2. SECONDARY STRATEGY: Direct Server Backend Endpoint (/api/upload-video)
  try {
    console.log('[VideoUpload] Tentando upload no servidor da aplicação...');
    const serverUrl = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const uploadUrl = `/api/upload-video?filename=${encodeURIComponent(file.name)}`;

      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.timeout = 180000; // 3 minutes

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
              // Convert relative path to absolute URL if needed
              const fullUrl = response.url.startsWith('http')
                ? response.url
                : `${window.location.origin}${response.url}`;
              resolve(fullUrl);
              return;
            }
          } catch (e) {}
        }
        reject(new Error(`Servidor respondeu com código ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('Erro de conexão com o servidor.'));
      xhr.ontimeout = () => reject(new Error('Tempo limite do servidor excedido.'));

      xhr.send(file);
    });

    if (serverUrl) {
      return finishProgress(serverUrl);
    }
  } catch (serverErr) {
    console.warn('[VideoUpload] Servidor da aplicação indisponível para upload:', serverErr);
  }

  // 3. TERTIARY STRATEGY: Base64 Data URL (only for small video files < 2MB to fit in database)
  if (file.size <= 2 * 1024 * 1024) {
    console.log('[VideoUpload] Convertendo vídeo pequeno para Data URL Base64...');
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        finishProgress(result);
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Falha ao processar arquivo de vídeo.'));
      reader.readAsDataURL(file);
    });
  }

  // If all cloud methods failed and file is too large for Base64 in Firestore
  throw new Error(
    'Não foi possível salvar o vídeo na nuvem. Verifique sua conexão com a internet ou cole o link direto do YouTube/Instagram/Drive.'
  );
}
