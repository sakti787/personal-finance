// npm install browser-image-compression
// Helper untuk kompres gambar sebelum upload ke Cloudinary
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File, maxSizeMB = 0.5, maxWidthOrHeight = 800): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    throw error;
  }
}
