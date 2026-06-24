import { FormEvent, useState } from "react";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";

type AuthMode = "login" | "register" | "forgot" | "reset" | "verify";
type AuthRole = "admin" | "agent" | "viewer";

interface AuthScreenProps {
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onRegister: (payload: { email: string; password: string; role: AuthRole }) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  onResetPassword: (payload: { token: string; newPassword: string }) => Promise<void>;
  onVerifyEmail: (token: string) => Promise<void>;
  onResendVerification: (email: string) => Promise<void>;
  oauthGoogleUrl: string;
  oauthGithubUrl: string;
  loading?: boolean;
  error?: string | null;
}

export default function AuthScreen({
  onLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
  onVerifyEmail,
  onResendVerification,
  oauthGoogleUrl,
  oauthGithubUrl,
  loading = false,
  error = null,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthRole>("viewer");
  const [verificationToken, setVerificationToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "login") {
      await onLogin({ email, password });
      return;
    }
    if (mode === "register") {
      await onRegister({ email, password, role });
      return;
    }
    if (mode === "forgot") {
      await onForgotPassword(email);
      return;
    }
    if (mode === "reset") {
      await onResetPassword({ token: resetToken, newPassword });
      return;
    }
    await onVerifyEmail(verificationToken);
  };

  return (
    <div className="min-h-screen app-shell-bg flex items-center justify-center px-4">
      <div className="premium-card w-full max-w-md rounded-2xl p-6 md:p-7">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Sign in to Emotion Assist</h1>
        </div>

        <div className="inline-flex w-full bg-white/5 border border-white/10 rounded-xl p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "login" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "register" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === "login" || mode === "register" || mode === "forgot") && (
            <label className="block">
              <span className="text-xs text-on-surface-variant mb-1 block">Email</span>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/12 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                  placeholder="you@example.com"
                />
              </div>
            </label>
          )}

          {(mode === "login" || mode === "register") && (
            <label className="block">
              <span className="text-xs text-on-surface-variant mb-1 block">Password</span>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant/70" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-white/5 border border-white/12 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                  placeholder="At least 8 characters"
                />
              </div>
            </label>
          )}

          {mode === "register" && (
            <label className="block">
              <span className="text-xs text-on-surface-variant mb-1 block">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AuthRole)}
                className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="viewer">Viewer</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          {mode === "verify" && (
            <label className="block">
              <span className="text-xs text-on-surface-variant mb-1 block">Verification Token</span>
              <input
                type="text"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                placeholder="Paste token from email/debug message"
              />
            </label>
          )}

          {mode === "reset" && (
            <>
              <label className="block">
                <span className="text-xs text-on-surface-variant mb-1 block">Reset Token</span>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                  placeholder="Paste reset token"
                />
              </label>
              <label className="block">
                <span className="text-xs text-on-surface-variant mb-1 block">New Password</span>
                <div className="relative">
                  <LockKeyhole className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant/70" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-white/5 border border-white/12 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                    placeholder="At least 8 characters"
                  />
                </div>
              </label>
            </>
          )}

          {error && (
            <div className="text-sm text-error bg-error/10 border border-error/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-inverse-primary to-secondary-container text-white font-semibold hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : mode === "register"
                  ? "Create Account"
                  : mode === "forgot"
                    ? "Send Reset Link"
                    : mode === "reset"
                      ? "Reset Password"
                      : "Verify Email"}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode("forgot")} className="text-xs text-on-surface-variant hover:text-white">
              Forgot password?
            </button>
            <button type="button" onClick={() => setMode("reset")} className="text-xs text-on-surface-variant hover:text-white text-center">
              Use reset token
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode("verify")} className="text-xs text-on-surface-variant hover:text-white text-right">
              Verify email token
            </button>
            <button
              type="button"
              onClick={() => onResendVerification(email)}
              className="text-xs text-on-surface-variant hover:text-white text-left"
            >
              Resend verification
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
          <a
            href={oauthGoogleUrl}
            className="block w-full text-center py-2 rounded-xl bg-white/8 border border-white/15 hover:bg-white/12 text-sm"
          >
            Continue with Google
          </a>
          <a
            href={oauthGithubUrl}
            className="block w-full text-center py-2 rounded-xl bg-white/8 border border-white/15 hover:bg-white/12 text-sm"
          >
            Continue with GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

