"use client";

import { useState, useCallback } from "react";
import { parseOpenAICSV } from "@/lib/csv-parser";

interface CSVUploaderProps {
  userId: string;
  onComplete: (uploadId: string) => void;
}

export function CSVUploader({ userId, onComplete }: CSVUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const disabled = !userId || uploading;

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        onComplete(data.uploadId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [userId, onComplete]
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
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-white hover:border-slate-400"
        } ${disabled ? "pointer-events-none opacity-70" : ""}`}
      >
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
          className="cursor-pointer text-slate-600 hover:text-slate-900"
        >
          {uploading
            ? "Uploading..."
            : userId
              ? "Drop your OpenAI usage CSV here, or click to browse"
              : "Sign in to upload"}
        </label>
      </div>
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
