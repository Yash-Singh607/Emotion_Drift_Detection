import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface ToastProps {
  message: string;
  kind?: "info" | "success" | "warning";
}

export default function Toast({ message, kind = "info" }: ToastProps) {
  const icon =
    kind === "success" ? (
      <CheckCircle2 className="w-4 h-4 text-primary" />
    ) : kind === "warning" ? (
      <AlertTriangle className="w-4 h-4 text-error" />
    ) : (
      <Info className="w-4 h-4 text-on-surface-variant" />
    );

  return (
    <div className="fixed bottom-5 right-5 z-[80] max-w-md px-4 py-3 rounded-xl premium-card border border-white/15 shadow-2xl animate-fadeIn">
      <div className="flex items-start gap-2.5">
        {icon}
        <p className="text-sm text-on-surface leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

