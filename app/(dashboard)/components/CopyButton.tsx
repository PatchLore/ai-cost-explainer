"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "./Toast";

interface CopyButtonProps {
  codeString: string;
}

export function CopyButton({ codeString }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      toast("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback ignored
    }
  }, [codeString, toast]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute right-2 top-2 rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
