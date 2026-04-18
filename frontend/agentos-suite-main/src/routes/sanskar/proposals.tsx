import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Send, Sparkles, FileText, Briefcase, Tag, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { TypingDots } from "../../components/TypingDots";
import ReactMarkdown from 'react-markdown';
import api from "../../lib/api";

export const Route = createFileRoute("/sanskar/proposals")({
  head: () => ({
    meta: [
      { title: "Proposal Architect · AgentOS" },
      { name: "description", content: "AI-drafted proposals you can edit and send in seconds." },
    ],
  }),
  component: Proposals,
});

const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Engineer for Trading Platform",
    description: "Looking for an experienced React developer to build a real-time crypto trading dashboard. Must have experience with websockets and performance optimization."
  },
  {
    id: 2,
    title: "Fullstack Dev for AI SaaS",
    description: "Need a developer to help integrate OpenAI/Gemini models into our Next.js backend. Should be comfortable with responsive Tailwind UI."
  },
  {
    id: 3,
    title: "UI/UX Developer for E-commerce",
    description: "Seeking a frontend developer with an eye for design to revamp our Shopify store's custom headless React storefront."
  }
];

const AVAILABLE_TAGS = ["#React", "#Tailwind", "#AI-Integration", "#Next.js", "#Websockets", "#Performance"];

function Proposals() {
  const [text, setText] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [tone, setTone] = useState("Confident");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [injectedJob, setInjectedJob] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data && res.data.user) {
          setUserProfile(res.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    
    // Check for context from the Apply redirect
    const contextStr = localStorage.getItem("agentos_draft_context");
    if (contextStr) {
      try {
        const context = JSON.parse(contextStr);
        setInjectedJob({
          id: 'injected',
          title: context.title,
          description: context.description,
          clientEmail: context.clientEmail
        });
        setSelectedJobId('injected' as any);
      } catch (e) {
        console.error("Context parse error", e);
      }
    }

    fetchProfile();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerate = async () => {
    const selectedJob = injectedJob && selectedJobId === 'injected' ? injectedJob : SAMPLE_JOBS.find(j => j.id === selectedJobId);
    if (!selectedJob) return;

    setText("");
    setIsGenerating(true);
    setIsPreview(false);

    try {
      // Calling the secure backend bridge to bypass frontend 404 errors
      const res = await api.post("/proposals/generate", {
        jobTitle: selectedJob.title,
        jobDescription: selectedJob.description,
        tags: selectedTags,
        tone: tone
      });
      
      if (res.data && res.data.text) {
        setText(res.data.text);
      }
    } catch (error: any) {
      console.error("Architecture Error:", error);
      setText(`Error generating proposal: ${error.response?.data?.error || error.message}. Please verify backend synchronization.`);
    } finally {
      setIsGenerating(false);
      setIsPreview(true);
    }
  };

  const handleSend = async () => {
    if (!text || sending) return;
    setSending(true);
    try {
      const selectedJob = injectedJob && selectedJobId === 'injected' ? injectedJob : SAMPLE_JOBS.find(j => j.id === selectedJobId);
      const res = await api.post("/send-email", {
        subject: `Proposal Architect: ${selectedJob?.title || "Project Pitch"}`,
        message: text,
        to: selectedJob?.clientEmail || undefined // If injected, use specific client email
      });
      
      if (res.data.success) {
        setSent(true);
        localStorage.removeItem("agentos_draft_context"); // Clear context after sending
        setTimeout(() => setSent(false), 5000);
      }
    } catch (err) {
      console.error("Transmission Failure", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ops Agent"
        title="Proposal Architect"
        description="Select a job, tags, and tone, then let AgentOS architect a flawless proposal."
        actions={
          <>
            <button
              onClick={handleGenerate}
              disabled={!selectedJobId || isGenerating}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium glass hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-pulse" : ""}`} />
              {isGenerating ? "Generating..." : "Generate Proposal"}
            </button>
            <button 
              onClick={handleSend}
              disabled={sending || !text || isGenerating}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                sent ? "bg-success text-success-foreground" : "bg-gradient-primary text-primary-foreground glow-primary shadow-glow-primary hover:brightness-110 active:scale-[0.98]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : sent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {sent ? "Sent Successfully" : sending ? "Sending..." : "Send Email"}
            </button>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-strong rounded-2xl p-2 border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.03]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold tracking-widest uppercase">
              <FileText className="h-3.5 w-3.5" />
              <span>Drafting Canvas</span>
            </div>

            <div className="flex items-center gap-3">
              {isGenerating && (
                <div className="text-xs text-primary inline-flex items-center gap-2 font-bold uppercase tracking-widest">
                  <TypingDots /> Intelligence is thinking…
                </div>
              )}
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 shadow-inner">
                <button
                  onClick={() => setIsPreview(false)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!isPreview ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                >
                  EDIT
                </button>
                <button
                  onClick={() => setIsPreview(true)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${isPreview ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                >
                  PREVIEW
                </button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[500px]">
            {isPreview ? (
              <div className="w-full h-full bg-transparent p-8 text-sm leading-relaxed font-sans text-foreground/90 overflow-y-auto prose prose-invert prose-p:leading-relaxed max-w-none">
                <ReactMarkdown>{text || "_No proposal generated yet. Select a job and click Generate to begin._"}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Architecting your master proposal..."
                className="w-full min-h-[500px] h-full bg-transparent resize-none p-8 text-sm leading-relaxed focus:outline-none font-sans text-foreground/90 selection:bg-primary/30"
              />
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              Pulse Signals
            </div>
            <div className="space-y-3">
              {injectedJob && (
                <button
                  onClick={() => setSelectedJobId('injected' as any)}
                  className={`w-full text-left p-4 rounded-xl border transition-all bg-gradient-to-br from-primary/10 to-transparent border-primary/30 shadow-glow-primary/10`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground tracking-tight">{injectedJob.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 font-medium leading-relaxed">{injectedJob.description}</p>
                    </div>
                  </div>
                </button>
              )}
              {SAMPLE_JOBS.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedJobId === job.id
                    ? "bg-primary/10 border-primary/30 shadow-glow-primary/10"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                    } ${injectedJob && selectedJobId === 'injected' && job.id === 1 ? 'hidden' : ''}`} // Small hack to avoid crowding if needed
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {selectedJobId === job.id ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground tracking-tight">{job.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 font-medium leading-relaxed">{job.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              <Tag className="h-3.5 w-3.5 text-primary" />
              Strategic Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-[10px] px-3 py-1.5 rounded-full border font-bold transition-all ${isSelected
                      ? "bg-gradient-primary text-primary-foreground border-transparent shadow-lg"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-foreground/70"
                      }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 border border-white/10 relative overflow-hidden group bg-gradient-to-br from-primary/5 to-transparent">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Tone Transformer
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["Confident", "Friendly", "Concise", "Persuasive"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-[11px] px-3 py-3 rounded-lg border transition-all font-bold tracking-tight ${tone === t
                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow-primary scale-[1.03] z-10"
                    : "bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 text-[10px] leading-relaxed text-muted-foreground font-bold italic">
              Strategy: <span className="text-foreground">{tone}</span> tone optimized for deal closure.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}