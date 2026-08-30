import { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface UploadedImage {
  url: string;
  publicId: string;
  previewUrl: string; // local blob URL for instant preview
}

export function useImageUpload(folder: 'posts' | 'avatars' | 'stories' = 'posts') {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const clearImage = () => {
    setImage(null);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image must be under 8 MB.');
      return;
    }

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setImage({ url: '', publicId: '', previewUrl });
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post<{ url: string; publicId: string }>(
        `${API_URL}/upload?folder=${folder}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setImage({ url: res.data.url, publicId: res.data.publicId, previewUrl });
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Upload failed. Try again.');
      setImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  return { image, isUploading, uploadError, openPicker, clearImage, handleFileChange, inputRef };
}
