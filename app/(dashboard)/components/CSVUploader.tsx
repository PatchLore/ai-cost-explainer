"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const UPLOAD_TIMEOUT = 30000; // 30 seconds

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
  const [analysisProgress, setAnalysisProgress] = useState<string>("Analyzing your CSV...");
  const disabled = !userId || uploading || processing;

  // Client-side auth verification
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Authentication required. Please login to upload CSV files.");
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?redirectedFrom=/dashboard');
        }, 2000);
      }
    };

    checkAuth();
  }, [router]);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setAnalysisProgress("Analyzing your CSV...");
      
      if (file.size > MAX_FILE_BYTES) {
        setError("File must be 10MB or smaller.");
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      setProcessing(false);

      // Calculate actual row count for display
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim()).length;
      setAnalysisProgress(`Analyzing ${lines} rows...`);

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

      // Set up timeout protection
      const timeoutId = setTimeout(() => {
        if (uploading) {
          setError("Upload timed out. Please try again or contact support.");
          setUploading(false);
          setProcessing(false);
          clearInterval(progressInterval);
        }
      }, UPLOAD_TIMEOUT);

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
        clearTimeout(timeoutId);
        setUploadProgress(100);

        if (!res.ok) {
          // Handle free limit reached error
          if (data.error === 'FREE_LIMIT_REACHED') {
            setError(`Free analysis limit reached. ${data.message}`);
            setUploading(false);
            setProcessing(false);
            
            // Check if user has existing concierge audit before redirecting to pricing
            try {
              const supabase = createBrowserSupabaseClient();
              const { data: existingAudit } = await supabase
                .from('concierge_deliverables')
                .select('id, upload_id, status')
                .eq('user_id', userId)
                .in('status', ['pending', 'delivered'])
                .single();

              if (existingAudit) {
                // User has existing audit, redirect to their audit page
                router.push(`/dashboard/upload/${existingAudit.upload_id}`);
                return;
              }
            } catch (auditError) {
              console.error('Error checking existing audit:', auditError);
            }
            
            // No existing audit, redirect to pricing after 3 seconds
            setTimeout(() => {
              router.push('/pricing?reason=free-limit-reached');
            }, 3000);
            return;
          }
          throw new Error(data.error ?? "Upload failed");
        }
        
        const uploadId = data.uploadId;
        
        if (uploadId) {
          // Show processing state with real row count
          setProcessing(true);
          setUploading(false);
          setAnalysisProgress(`Processing ${lines} rows...`);
          
          // Redirect immediately after successful upload (no artificial delay)
          onComplete(uploadId);
          router.push(`/dashboard/upload/${uploadId}`);
        } else {
          throw new Error("No upload ID received from server");
        }
      } catch (e) {
        console.error("Upload error:", e);
        setError(e instanceof Error ? e.message : "Upload failed");
        setUploading(false);
        setProcessing(false);
        clearTimeout(timeoutId);
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
          <h3 className="text-lg font-semibold text-white mb-2">{analysisProgress}</h3>
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
