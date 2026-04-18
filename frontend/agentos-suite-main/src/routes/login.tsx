import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!isLogin) {
        await register(formData.email, formData.password, formData.name);
      } else {
        await login(formData.email, formData.password);
      }
      navigate({ to: "/onboarding" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Authentication failed. Check your signals.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/google", {
        email: "demo.freelancer@gmail.com",
        name: "Demo Freelancer",
        googleId: "google_12345"
      });
      localStorage.setItem("token", res.data.token);
      navigate({ to: "/onboarding" });
    } catch (err) {
      setError("Google Auth failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#030303] relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-primary mb-6 shadow-glow-primary">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic">JobMatch <span className="text-primary tracking-tighter not-italic">AI</span></h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Autonomous Opportunity Matching</p>
        </div>

        <div className="glass-strong rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl">
          <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleManualAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-2">Email Signal</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-white"
                  placeholder="name@nexus.io"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-2">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-[10px] text-destructive font-black uppercase text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary py-4 rounded-2xl text-white font-bold uppercase tracking-[0.2em] text-[10px] mt-4 hover:brightness-110 active:scale-[0.98] transition-all shadow-glow-primary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? 'Initiate Session' : 'Create Identity'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-muted-foreground tracking-widest bg-transparent px-4">
              <span className="bg-[#0f1115] px-4 rounded-full border border-white/10 py-1">Secure Bridge</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleAuth}
            className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/[0.07] transition-all group"
          >
            <div className="h-5 w-5 bg-white rounded-md flex items-center justify-center p-0.5">
              <svg viewBox="0 0 24 24" className="h-full w-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest group-hover:tracking-[0.15em] transition-all">Sign in with Google</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
