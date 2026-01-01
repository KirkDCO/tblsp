import { useMutation } from '@tanstack/react-query';

interface UploadResponse {
  imageUrl: string;
  filename: string;
  size: number;
}

async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

export function useUploadImage() {
  return useMutation({
    mutationFn: uploadImage,
  });
}
