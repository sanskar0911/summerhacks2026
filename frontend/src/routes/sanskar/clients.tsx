import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus, Search, Filter, MoreVertical, Mail, Phone, MapPin, Loader2, Trash2, ArrowUpRight, BarChart3, Clock } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/sanskar/clients")({
  head: () => ({
    meta: [
      { title: "Roster · AgentOS" },
      { name: "description", content: "Active partner network and contract management." },
    ],
  }),
  component: Clients,
});

function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", contact: "", status: "Active" as any });
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const res = await api.post("/ai/analyze-business");
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = (client: any) => {
    setSelectedClient(client);
    setShowAnalyze(true);
  };

  const handleFollowUp = async (clientId: string) => {
    try {
      await api.post(`/clients/${clientId}/follow-up`);
      alert("✅ Follow-up sent effectively. Relationship signal restored.");
      setShowAnalyze(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDeliverable = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !selectedClient) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(`/clients/${selectedClient.id}/deliverable`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSelectedClient({ ...selectedClient, qualityReport: res.data.report, projectStatus: 'Submitted' });
      fetchClients(); // Refresh roster
    } catch (err) {
      alert("Analysis engine failure. Ensure logic is active.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchAnalysis();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/clients", newClient);
      setIsAdding(false);
      setNewClient({ name: "", email: "", contact: "", status: "Active" });
      fetchClients();
      fetchAnalysis(); // Refresh analysis after adding a client
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Remove this partner from your active roster?")) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
      fetchAnalysis(); // Refresh analysis after deleting a client
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Relationship Agent"
        title="Partner Roster"
        description="Autonomous management of your high-value client network and lifetime deal flow."
        actions={
          <button 
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow-primary hover:brightness-110 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Add Partner
          </button>
        }
      />

      {/* SEARCH AND KPI STRIP */}
      <div className="grid md:grid-cols-3 gap-4 items-center glass-strong p-3 rounded-[2rem] border border-white/10">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search roster signal…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2 h-full">
           <div className="flex-1 glass rounded-2xl border border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              {clients.length} Partners
           </div>
           <button className="px-4 glass rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
              <Filter className="h-4 w-4" />
           </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddClient} className="glass-strong rounded-[2.5rem] p-10 border border-primary/20 space-y-8 bg-gradient-to-br from-primary/10 to-transparent relative">
               <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">Onboard New Partner</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Initialization Protocol 4.2</p>
                 </div>
                 <button type="button" onClick={() => setIsAdding(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-4">Close Protocol</button>
               </div>
               
               <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary ml-1">Company Entity</label>
                   <input required value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="MetaScale Inc." />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary ml-1">Direct Email</label>
                   <input required type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="founder@client.com" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary ml-1">Decision Maker</label>
                   <input value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Full name" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary ml-1">Initial Status</label>
                   <select value={newClient.status} onChange={e => setNewClient({...newClient, status: e.target.value as any})} className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none appearance-none">
                       <option>Active</option>
                       <option>Pending</option>
                       <option>Inactive</option>
                   </select>
                 </div>
               </div>
               <button type="submit" className="w-full bg-gradient-primary text-primary-foreground font-bold py-5 rounded-2xl shadow-glow-primary hover:scale-[1.01] transition-transform">
                 Initialize Relationship
               </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="h-[320px] rounded-[2.5rem] glass animate-pulse border border-white/5" />
          ))
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border border-white/5">
             <p className="text-muted-foreground font-bold italic text-lg uppercase tracking-wider opacity-40">Zero Roster Signal Detected</p>
          </div>
        ) : filteredClients.map((client, i) => (
          <motion.div
            layout
            key={client.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group glass-strong rounded-[2.5rem] p-8 border border-white/5 hover:bg-white/[0.08] transition-all relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-white/15 to-transparent border border-white/10 flex items-center justify-center text-2xl font-black text-primary group-hover:scale-110 transition-transform shadow-xl">
                  {client.name[0]}
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${client.healthScore > 70 ? 'bg-success' : client.healthScore > 40 ? 'bg-warning' : 'bg-destructive'} animate-pulse`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Health: {client.healthScore}%</span>
                   </div>
                   <div className="text-[9px] font-black uppercase text-primary tracking-tighter bg-primary/10 px-2 py-0.5 rounded border border-primary/20 inline-block">
                      {client.projectStatus}
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {client.projectStatus === 'Submitted' && (
                  <div className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Zap className="h-2 w-2" /> AI Verified
                  </div>
                )}
                <button onClick={() => handleDeleteClient(client.id)} className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all border border-transparent hover:border-destructive/20">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight group-hover:text-gradient-primary transition-all leading-tight">{client.name}</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{client.contact || "Decision Maker Unknown"}</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground bg-white/5 rounded-2xl p-4 border border-white/5">
                <Mail className="h-4 w-4 text-primary" />
                <span className="truncate font-semibold tracking-tight">{client.email || "protocol-not-active@client.com"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="rounded-[1.25rem] glass p-4 border border-white/10 group-hover:bg-primary/5 transition-all text-center">
                    <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-[0.2em] mb-1">Unpaid</div>
                    <div className="text-sm font-bold text-destructive">₹{(client.pendingPayment * 82).toLocaleString()}</div>
                 </div>
                 <div className="rounded-[1.25rem] glass p-4 border border-white/10 group-hover:bg-primary/5 transition-all text-center">
                    <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-[0.2em] mb-1">Risk Level</div>
                    <div className={`text-sm font-bold ${client.riskLevel === 'Critical' || client.riskLevel === 'High' ? 'text-destructive' : 'text-success'}`}>
                      {client.riskLevel}
                    </div>
                 </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
               <button 
                 onClick={() => handleAnalyze(client)}
                 className="py-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all text-primary"
               >
                  Analyze Risk
               </button>
               <button 
                 onClick={() => { setSelectedClient(client); setShowSubmit(true); }}
                 className="py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
               >
                  Submit ZIP
               </button>
            </div>

            {/* HOVER GLOW */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
          </motion.div>
        ))}
      </div>

      {/* MODAL: ANALYZE CONSOLE */}
      <AnimatePresence>
        {showAnalyze && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAnalyze(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-2xl glass-strong rounded-[3rem] border border-primary/20 p-10 shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <Target size={300} className="text-primary" />
                </div>

                <div className="space-y-8 relative z-10">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <h2 className="text-2xl font-black text-white leading-tight">Diagnostic: {selectedClient.name}</h2>
                         <div className="flex items-center gap-3">
                           <p className="text-[10px] uppercase font-bold text-primary tracking-[0.2em]">Risk Intelligence Engine v9.4</p>
                           {analysis?.timestamp && (
                             <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">
                               Synced: {new Date(analysis.timestamp).toLocaleTimeString()}
                             </span>
                           )}
                         </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${selectedClient.riskLevel === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-success/10 text-success border-success/20'}`}>
                         {selectedClient.riskLevel} Risk
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                         <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Revenue at Risk</div>
                         <div className="text-3xl font-black text-destructive">₹{(selectedClient.pendingPayment * 82).toLocaleString()}</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                         <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Health Grade</div>
                         <div className="text-3xl font-black text-primary">{selectedClient.healthScore}%</div>
                      </div>
                   </div>

                   <div className="p-6 rounded-3xl bg-destructive/10 border border-destructive/20 animate-glow-pulse">
                      <div className="flex items-center gap-2 text-[10px] font-black text-destructive uppercase tracking-widest mb-3">
                         <AlertTriangle className="h-4 w-4" /> Revenue Shock Alert
                      </div>
                      <p className="text-sm text-white font-bold leading-relaxed">
                         "If no action is taken, this freelancer will likely lose ₹{(selectedClient.pendingPayment * 82).toLocaleString()} in the next 48 hours due to relationship drift with {selectedClient.name}."
                      </p>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recommended AI Action</label>
                        <span className="text-[10px] font-bold text-primary">Confidence: {analysis?.confidence_score || 87}%</span>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 italic text-sm font-medium text-foreground opacity-80 leading-relaxed">
                        "{analysis?.auto_message || "Initialize a priority sync to address pending technical deliverables and stabilize relationship signals."}"
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => handleFollowUp(selectedClient.id)} 
                        className="flex-1 bg-gradient-primary text-primary-foreground font-black py-5 rounded-2xl shadow-glow-primary hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
                      >
                         Send AI Follow-up
                      </button>
                      <button onClick={() => setShowAnalyze(false)} className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                         Dismiss
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SUBMISSION PORTAL */}
      <AnimatePresence>
        {showSubmit && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSubmit(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-xl glass-strong rounded-[3rem] border border-white/10 p-10 shadow-2xl"
             >
                <div className="space-y-8">
                   <div className="space-y-1 text-center">
                      <h2 className="text-2xl font-black">Digital Deliverable Portal</h2>
                      <p className="text-[10px] uppercase font-bold text-primary tracking-[0.2em]">{selectedClient.name} Protocol</p>
                   </div>

                   <div className="relative group">
                     <input 
                       type="file" 
                       accept=".zip" 
                       onChange={handleUploadDeliverable} 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                     />
                     <div className="py-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 group-hover:bg-white/5 transition-all group-hover:border-primary/30">
                        {isSubmitting ? (
                          <div className="space-y-4 text-center">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Running Code Analysis Pipeline...</p>
                          </div>
                        ) : (
                          <>
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                              <UserPlus className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold mb-1">Upload ZIP Archive</div>
                              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em]">Automated analysis will follow</div>
                            </div>
                          </>
                        )}
                     </div>
                   </div>

                   {selectedClient.qualityReport && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                 <Zap className="h-4 w-4" /> AI Quality Verified
                              </div>
                              <div className="text-2xl font-black text-white">{selectedClient.qualityReport.score}% Score</div>
                           </div>
                           <p className="text-xs text-indigo-100/70 font-medium leading-relaxed italic border-l-2 border-indigo-500/30 pl-4 py-1">
                             "{selectedClient.qualityReport.trustSummary}"
                           </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                           <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Security Flags</div>
                              <div className={`text-sm font-bold ${selectedClient.qualityReport.security_flags > 0 ? 'text-destructive' : 'text-success'}`}>{selectedClient.qualityReport.security_flags} Detected</div>
                           </div>
                           <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Code Readability</div>
                              <div className="text-sm font-bold text-white">{selectedClient.qualityReport.readability}</div>
                           </div>
                        </div>

                        {selectedClient.qualityReport.suggestions?.length > 0 && (
                          <div className="space-y-2">
                             <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Optimization Suggestions</div>
                             <div className="space-y-1.5">
                                {selectedClient.qualityReport.suggestions.map((s: string, i: number) => (
                                  <div key={i} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-medium text-foreground flex items-center gap-3">
                                     <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                     {s}
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                     </motion.div>
                   )}

                   <button onClick={() => setShowSubmit(false)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                      Dismiss Portal
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
