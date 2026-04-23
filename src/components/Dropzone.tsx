import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X, Loader2, CheckCircle } from 'lucide-react';

interface DropzoneProps {
  onUpload?: (url: string) => void;
  accept?: string;
  maxSize?: number;
}

export default function Dropzone({ 
  onUpload, 
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024 
}: DropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  }, []);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    if (file.size > maxSize) {
      setError(`File too large. Max ${maxSize / 1024 / 1024}MB allowed.`);
      return;
    }

    setUploading(true);

    try {
      // Create object URL for preview (in production, upload to Supabase Storage)
      const url = URL.createObjectURL(file);
      setUploadedUrl(url);
      onUpload?.(url);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setUploadedUrl(null);
    setError(null);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
        dragActive 
          ? 'border-violet-500 bg-violet-500/10' 
          : uploadedUrl
            ? 'border-teal-500 bg-teal-500/5'
            : 'border-white/10 hover:border-violet-500/50 bg-white/5'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {uploading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 size={40} className="text-violet-400 animate-spin mb-4" />
          <p className="text-sm font-medium text-white">Uploading...</p>
        </div>
      ) : uploadedUrl ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
            <img 
              src={uploadedUrl} 
              alt="Uploaded" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={clearUpload}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-teal-400">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Ready for processing</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            dragActive ? 'bg-violet-500/20' : 'bg-white/5'
          }`}>
            <Upload size={28} className={dragActive ? 'text-violet-400' : 'text-white/40'} />
          </div>
          <p className="text-sm font-medium text-white mb-1">
            Drop image or click to upload
          </p>
          <p className="text-xs text-white/40">
            PNG, JPG up to {maxSize / 1024 / 1024}MB
          </p>
        </div>
      )}

      {error && (
        <p className="text-center text-red-400 text-sm mt-4">{error}</p>
      )}
    </motion.div>
  );
}