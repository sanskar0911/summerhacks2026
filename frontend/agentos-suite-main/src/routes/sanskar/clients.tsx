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
              <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-white/15 to-transparent border border-white/10 flex items-center justify-center text-2xl font-black text-primary group-hover:scale-110 transition-transform shadow-xl">
                {client.name[0]}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] border shadow-lg ${
                  client.status === 'Active' ? 'bg-success/15 text-success border-success/30' : 
                  client.status === 'Pending' ? 'bg-warning/15 text-warning border-warning/30' : 
                  'bg-white/10 text-muted-foreground border-white/20'
                }`}>
                  {client.status}
                </span>
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
                 <div className="rounded-[1.25rem] glass p-4 flex flex-col items-center justify-center border border-white/10 group-hover:bg-primary/5 transition-all">
                    <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">LTV Volume</div>
                    <div className="text-lg font-bold text-gradient-primary">₹{client.totalValue?.toLocaleString()}</div>
                 </div>
                 <div className="rounded-[1.25rem] glass p-4 flex flex-col items-center justify-center border border-white/10 group-hover:bg-primary/5 transition-all">
                    <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Engagement</div>
                    <div className="text-sm font-bold flex items-center gap-1.5">
                       High <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                    </div>
                 </div>
              </div>
            </div>

            {/* HOVER GLOW */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
          </motion.div>
        ))}
      </div>

      {/* RELATIONSHIP HEALTH INSIGHT */}
      <section className="glass rounded-[2rem] p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl ${analysis?.risk_level === 'Critical' || analysis?.risk_level === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-warning/10 text-warning border-warning/20'} flex items-center justify-center border`}>
               <Clock className="h-6 w-6" />
            </div>
            <div>
               <h4 className="text-base font-bold tracking-tight">{analysis?.risk_level ? `${analysis.risk_level} Risk Detected` : 'Monitoring Roster Signal...'}</h4>
               <p className="text-xs text-muted-foreground font-medium">{analysis?.reason || 'Scanning for relationship drift and engagement gaps.'}</p>
            </div>
         </div>
         <button 
           onClick={() => {
             if (analysis?.auto_message) {
               alert(`Auto-drafting re-engagement sequence:\n\n${analysis.auto_message}`);
             }
           }}
           className="whitespace-nowrap rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
         >
            Execute Re-Connect
         </button>
      </section>
    </div>
  );
}
