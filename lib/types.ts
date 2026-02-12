export type CsvUploadStatus =
  | "pending"
  | "analyzing"
  | "completed"
  | "concierge_queued";

export type CsvUploadTier = "self_serve" | "concierge_pending" | "concierge_delivered";
export type ConciergeStatus = CsvUploadTier | "none" | "pending";

export interface AnalysisData {
  total_spend: number;
  total_requests: number;
  top_models: { model: string; cost: number; tokens: number }[];
  spend_by_day: { date: string; cost: number }[] | null;
  recommendations: unknown[];
}

export interface CsvUpload {
  id: string;
  user_id: string;
  filename: string | null;
  storage_path: string | null;
  file_size: number | null;
  provider: string;
  status: CsvUploadStatus;
  raw_data: unknown;
  analysis_data: AnalysisData | null;
  created_at: string;
  tier: CsvUploadTier;
  concierge_status: 'none' | 'pending' | 'delivered';
  stripe_payment_intent_id: string | null;
  loom_video_url: string | null;
  consultant_notes: string | null;
  savings_estimate: number | null;
}

export interface AnalysisResult {
  id: string;
  upload_id: string;
  total_spend: number;
  total_requests: number;
  top_models: { model: string; cost: number; tokens: number }[];
  recommendations: unknown[];
  created_at: string;
}

export interface ConciergeDeliverable {
  id: string;
  upload_id: string;
  consultant_id: string;
  loom_video_url: string;
  written_report: string | null;
  code_snippets: { title: string; language: string; code: string }[] | null;
  top_savings: number | null;
  delivered_at: string;
}
