import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Send, RefreshCw, Sparkles, FileText, Loader2, Save, CheckCircle2, Mail, Target } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { TypingDots } from "../../components/TypingDots";
import api from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/sanskar/proposals")({
  head: () => ({
    meta: [
      { title: "Proposal Architect · AgentOS" },
      { name: "description", content: "AI-drafted proposals you can edit and send in seconds." },
    ],
  }),
  component: Proposals,
});

const initialDefault = `Hi there,

I'm interested in helping you with your project. With my expertise in full-stack development, I can deliver a high-quality solution that meets your needs.

Looking forward to hearing from you.

— Alex`;

function Proposals() {
  const [text, setText] = useState(initialDefault);
  const [regen, setRegen] = useState(false);
  const [savedProposals, setSavedProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tone, setTone] = useState("Confident");
  const [context, setContext] = useState<any>(null);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/proposals");
      setSavedProposals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    
    // Check for context from Opportunities page
    const storedContext = localStorage.getItem("agentos_draft_context");
    if (storedContext) {
      const job = JSON.parse(storedContext);
      setContext(job);
      setText(`Hi ${job.company} Team,

I saw your requirement for a ${job.title} and I'm confident I can help. ${job.description}

With my experience in this field, I can ensure a successful delivery for the ${job.rate} budget.

Would love to discuss how I can add value.

— Alex`);
      localStorage.removeItem("agentos_draft_context");
    }
  }, []);

  const handleAIRescan = async () => {
    setRegen(true);
    try {
      const res = await api.post("/proposals/refine", {
        text,
        tone
      });
      setText(res.data.text);
    } catch (err) {
      console.error("AI Refinement failed", err);
    } finally {
      setRegen(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.post("/proposals", {
        title: context ? `Bid: ${context.title}` : "AI Draft - " + new Date().toLocaleDateString(),
        clientName: context?.company || "New Prospect",
        value: context?.rate ? parseInt(context.rate.replace(/[^0-9]/g, "")) || 1000 : 1000,
        status: "Draft"
      });
      fetchProposals();
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    const emailTo = prompt("Enter recipient email address:", context?.company ? `${context.company.toLowerCase().replace(/\s/g, '')}@example.com` : "contact@client.com");
    if (!emailTo) return;

    setSending(true);
    try {
      // First save if not already in list or just to be safe
      const draft = await handleSave();
      
      const res = await api.post("/send-email", {
        to: emailTo,
        subject: `Proposal: ${context?.title || "Project Services"}`,
        message: text,
        proposalId: draft?.id
      });
      
      if (res.data.success) {
        setSent(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
        fetchProposals();
      }
    } catch (err) {
      alert("Email sending failed. Please check your backend configuration.");
      console.error(err);
    } finally {
      setSending(false);
      setTimeout(() => setSent(false), 5000);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Ops Agent"
        title="Proposal Architect"
        description="Edit your AI-drafted proposal. Execute with one click to send a real email via AgentOS."
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAIRescan}
              disabled={regen}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium glass hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
            >
              {regen ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <RefreshCw className="h-4 w-4" />}
              AI Refine
            </button>
            <button 
              onClick={handleSend}
              disabled={sending}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                sent ? "bg-success text-success-foreground" : "bg-gradient-primary text-primary-foreground shadow-glow-primary hover:brightness-110"
              }`}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : sent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {sent ? "Sent Successfully!" : sending ? "Sending…" : "Send Proposal"}
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-[2.5rem] overflow-hidden text-left border border-white/10 shadow-2xl relative"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.03]">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                   <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Draft Status</div>
                   <div className="text-sm font-bold flex items-center gap-2">
                      {sent ? "Dispatched" : "Editing Mode"} 
                      <div className={`h-1.5 w-1.5 rounded-full ${sent ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                   </div>
                </div>
              </div>
              <AnimatePresence>
                {regen && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-xs text-primary inline-flex items-center gap-2 font-bold px-4 py-2 rounded-xl bg-primary/10 border border-primary/20"
                  >
                    <TypingDots /> Intelligence is refining…
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[550px] bg-transparent resize-none p-10 text-lg leading-relaxed focus:outline-none font-sans text-foreground/90 selection:bg-primary/30"
              placeholder="Start drafting your master proposal..."
            />
            
            {sent && (
              <motion.div 
                 initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                 animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                 className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"
              >
                  <div className="glass-strong rounded-3xl p-8 border border-success/30 text-center space-y-4">
                     <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto text-success">
                        <CheckCircle2 className="h-10 w-10" />
                     </div>
                     <h2 className="text-xl font-bold tracking-tight">Email Dispatched</h2>
                     <p className="text-sm text-muted-foreground font-medium">Proposal for {context?.company} has been sent successfully.</p>
                     <button onClick={() => setSent(false)} className="text-xs font-bold text-primary uppercase tracking-widest mt-4">Close View</button>
                  </div>
              </motion.div>
            )}
          </motion.div>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Proposal History & Analytics</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
               {loading ? (
                 <div className="col-span-2 py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
               ) : savedProposals.length === 0 ? (
                 <div className="col-span-2 p-12 text-center glass rounded-3xl border border-white/5">
                   <p className="text-sm text-muted-foreground italic font-medium">No archived records found.</p>
                 </div>
               ) : savedProposals.map((p, i) => (
                 <motion.div 
                   layout
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   key={p.id} 
                   className="glass rounded-2xl p-6 flex items-center justify-between hover:bg-white/10 transition-all border border-white/5 text-left group"
                 >
                    <div className="space-y-1">
                      <div className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">{p.title}</div>
                      <div className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{p.clientName} • ₹{p.value?.toLocaleString()}</div>
                    </div>
                    <div className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                      p.status === 'Sent' ? 'bg-success/15 text-success border-success/20' : 
                      p.status === 'Accepted' ? 'bg-primary/15 text-primary border-primary/20' :
                      'bg-white/5 text-muted-foreground border-white/10'
                    } uppercase tracking-widest shadow-lg`}>
                      {p.status}
                    </div>
                 </motion.div>
               ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 text-left">
          <div className="glass-strong rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-primary/5 to-transparent shadow-xl">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              Strategic Cues
            </div>
            <ul className="space-y-6 text-xs text-muted-foreground">
               <li className="flex gap-4 group">
                  <div className="h-6 w-6 rounded-full glass border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">1</div>
                  <p className="leading-relaxed font-medium">Reference your <span className="text-foreground font-bold underline decoration-primary/30">React + UI</span> expertise to align with market trends.</p>
               </li>
               <li className="flex gap-4 group">
                  <div className="h-6 w-6 rounded-full glass border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">2</div>
                  <p className="leading-relaxed font-medium">Incorporate the <span className="text-foreground font-bold">"Growth Hack"</span> timeline for faster delivery.</p>
               </li>
               <li className="flex gap-4 group">
                  <div className="h-6 w-6 rounded-full glass border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">3</div>
                  <p className="leading-relaxed font-medium">Attach a <span className="text-foreground font-bold">₹1.2k Performance Audit</span> as a first-step hook.</p>
               </li>
            </ul>
          </div>

          <div className="glass-strong rounded-3xl p-8 border border-white/10 relative overflow-hidden group shadow-xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Tone Transformer
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Confident", "Friendly", "Concise", "Persuasive"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-xs px-4 py-4 rounded-xl border transition-all font-bold tracking-tight ${
                    tone === t
                      ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow-primary scale-[1.03] z-10"
                      : "bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-[11px] leading-relaxed text-muted-foreground font-medium">
               <span className="text-primary font-bold">Insight:</span> <span className="text-foreground font-bold">Confident</span> tone correlates with 14% higher deal velocity in B2B SaaS.
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-success/5 to-transparent">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-success">Client Score</span>
                <Target className="h-4 w-4 text-success" />
             </div>
             <div className="text-2xl font-bold tracking-tight">Verified</div>
             <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">"Payment history reflects 100% on-time settlement."</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
