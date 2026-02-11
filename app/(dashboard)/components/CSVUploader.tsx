"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, Loader2 } from "lucide-react";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

interface CSVUploaderProps {
  userId: string;
  onComplete: (uploadId: string) => void;
}

export function CSVUploader({ userId, onComplete }: CSVUploaderProps) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const disabled = !userId || uploading || processing;

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_FILE_BYTES) {
        setError("File must be 10MB or smaller.");
        return;
      }
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        const uploadId = data.uploadId;
        
        if (uploadId) {
          // Show processing state
          setProcessing(true);
          setUploading(false);
          
          // Simulate processing time
          setTimeout(() => {
            onComplete(uploadId);
            router.push(`/dashboard/upload/${uploadId}`);
          }, 2000);
        }
      } catch (e) {
        console.error("Upload error:", e);
        setError(e instanceof Error ? e.message : "Upload failed");
        setUploading(false);
        setProcessing(false);
      }
    },
    [userId, onComplete, router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".csv")) uploadFile(file);
      else setError("Please upload a CSV file.");
    },
    [uploadFile]
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile]
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Upload Your OpenAI Usage CSV</h2>
        <p className="text-slate-300">Get instant cost analysis and optimization recommendations</p>
      </div>

      {!processing ? (
        <div
          className={`drag-drop-zone rounded-2xl p-6 sm:p-8 text-center transition-all ${
            dragging ? 'drag-over' : ''
          } ${disabled ? "pointer-events-none opacity-70" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              {uploading ? (
                <Loader2 className="w-12 h-12 text-violet-400 animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-slate-300 font-medium">
                {uploading ? 'Uploading file...' : 'Drag and drop your CSV file here'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {uploading ? `Processing ${uploadProgress}%` : 'or click to browse'}
              </p>
            </div>
            {!uploading && (
              <>
                <input
                  type="file"
                  accept=".csv"
                  onChange={onFileInput}
                  disabled={disabled}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="magnetic-btn inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white font-semibold rounded-lg hover:from-violet-400 hover:to-violet-500 transition-all cursor-pointer"
                >
                  Choose File
                </label>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-strong p-8 rounded-xl border border-emerald-500/30 shadow-2xl shadow-black/50 text-center">
          <div className="flex justify-center mb-4">
            <div className="processing-spinner"></div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Analyzing 50,000 rows...</h3>
          <p className="text-slate-300 mb-4">Our AI is processing your data to find cost optimization opportunities</p>
          <div className="flex justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 success-check" />
          </div>
        </div>
      )}

      {uploading && !processing && (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-300">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
