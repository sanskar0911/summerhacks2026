import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Shield, Zap, BarChart, ChevronRight, Sparkles } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { motion } from "framer-motion";

export const Route = createFileRoute("/sanskar/chatbot")({
  head: () => ({
    meta: [
      { title: "Agent Oracle · AgentOS" },
      { name: "description", content: "Deep intelligence knowledge base and system workflow oracle." },
    ],
  }),
  component: Chatbot,
});

function Chatbot() {
  const sections = [
    {
      id: "tech",
      label: "The Engine Room",
      desc: "How we build the magic",
      icon: Shield,
      color: "text-primary",
      grad: "bg-primary/5 border-primary/20",
      items: [
        { q: "What engine powers AgentOS?", a: "We use Node.js—the same super-fast technology that powers giants like Netflix and LinkedIn—ensuring your business stays snappy." },
        { q: "How does the system remember my data?", a: "We use a secure digital filing cabinet (Database) that keeps your client details and projects organized and ready at a moment's notice." },
        { q: "Is my login actually secure?", a: "Absolutely. We use 'Lock-and-Key' digital tokens (JWT) to ensure that only you can walk through the front door of your account." },
        { q: "Which 'Brain' does the AI use?", a: "We're powered by Google’s Gemini Flash—one of the fastest and most advanced AI brains in existence today." },
        { q: "Why does it feel so smooth?", a: "Our interface is built with React, a modern design framework that makes the site feel alive and responsive on any device." },
        { q: "How are my emails sent?", a: "Through a reliable digital postman called Nodemailer, which connects to your email service to deliver proposals professionally." },
        { q: "What's with the 'Glass' look?", a: "It’s a premium design style called Glassmorphism. It makes your workspace feel clean, modern, and easy on the eyes." }
      ]
    },
    {
      id: "features",
      label: "System Talents",
      desc: "Your AI companion's skills",
      icon: Zap,
      color: "text-cool",
      grad: "bg-cool/5 border-cool/20",
      items: [
        { q: "What is the 'Command Centre'?", a: "Think of it as your personal flight deck. it spots potential business risks and tells you exactly what to do next to succeed." },
        { q: "How does 'Drift' detection help me?", a: "It's like a sixth sense—it whispers to you when a client has gone quiet so you can reach out before the relationship fades." },
        { q: "Can the AI really write my proposals?", a: "Yes! It takes the job details and drafts a persuasive proposal in seconds, saving you hours of tedious typing." },
        { q: "What is a 'Market Signal'?", a: "It’s a 24/7 scout that listens to the global market and brings you high-paying job opportunities that fit your specific skills." },
        { q: "Why trust 'Next Best Action'?", a: "It looks at your entire business 'big picture' to prioritize the single most important task you should focus on right now." },
        { q: "Can I see my total business value?", a: "Yes! Your Roster keeps a steady eye on your 'Lifetime Value' so you can watch your business grow over time." },
        { q: "How do I change my writing tone?", a: "Simply click a button to tell the AI to be 'Friendly', 'Formal', or 'Persuasive' depending on the client." }
      ]
    },
    {
      id: "workflow",
      label: "Daily Flow",
      desc: "Getting things done",
      icon: BarChart,
      color: "text-warm",
      grad: "bg-warm/5 border-warm/20",
      items: [
        { q: "How do I get started?", a: "Just register, tell us your skills, and let our scouts find your first deal. The system guides you through every single step." },
        { q: "How do I win a new client?", a: "Find a lead you like, let our AI 'architect' your proposal, and hit Send. We handle the formatting and delivery for you." },
        { q: "How do I manage my partners?", a: "Your Roster is your home base. It’s where you track every client, their value, and how healthy your relationship is." },
        { q: "How often are new jobs found?", a: "Every time you enter the portal, the AI performs a fresh scan of the globe to find you new opportunities." },
        { q: "Can I add my own existing clients?", a: "Of course! Use the 'Add Partner' protocol to bring your current network into the AgentOS ecosystem." },
        { q: "What if I'm not a 'Tech Person'?", a: "Perfect! We built AgentOS to handle the techy stuff so you can focus on doing the work you actually love." },
        { q: "How do I change my 'Persona'?", a: "Visit the Insights page to switch between 'Professional', 'Student', or 'Creator' modes in a single click." }
      ]
    },
    {
      id: "security",
      label: "Vault & Safety",
      desc: "Your data is sacred",
      icon: Cpu,
      color: "text-primary",
      grad: "bg-primary/5 border-primary/20",
      items: [
        { q: "Is my business data private?", a: "Yes. Your data is your own. We use high-level encryption to ensure your clients and project details stay between us." },
        { q: "Do you save my passwords?", a: "No. We 'scramble' your password into a secret code (Hashing) so that even we can’t see what your actual password is." },
        { q: "Can I delete my information?", a: "You are the boss. If you remove a partner or a project, it's purged from the active roster immediately." }
      ]
    },
    {
      id: "help",
      label: "Support Hub",
      desc: "Answers for every turn",
      icon: Sparkles,
      color: "text-cool",
      grad: "bg-cool/5 border-cool/20",
      items: [
        { q: "What if the AI gets it wrong?", a: "No problem! You can always 'Refine' any AI output or edit the text manually to make it sound exactly like you." },
        { q: "How do I grow my earnings?", a: "Follow the 'Growth Insights'—they analyze the market to tell you when it’s time to raise your rates or try a new skill." },
        { q: "Still have questions?", a: "The Command Centre is always here to guide you. When in doubt, follow the 'Next Best Action' recommendation!" }
      ]
    }
  ];

  return (
    <div className="space-y-10 pb-10">
      <PageHeader
        eyebrow="Intelligence Oracle"
        title="Agent Knowledge Base"
        description="Every answer you need to master your autonomous workspace, written for humans, not just machines."
      />

      <section className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={section.id} 
              className="space-y-4"
            >
              <div className={`p-6 rounded-[2rem] border glass-strong relative overflow-hidden group hover:bg-white/[0.05] transition-all`}>
                <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${section.grad.split(' ')[0]} opacity-5 blur-2xl group-hover:opacity-15 transition-opacity`} />
                
                <div className="flex items-center gap-4 mb-6">
                  <div className={`h-12 w-12 rounded-2xl ${section.grad} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight">{section.label}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{section.desc}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {section.items.map((item, i) => (
                    <details key={i} className="group glass rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                      <summary className="list-none p-4 cursor-pointer flex justify-between items-center text-xs font-bold tracking-tight">
                        {item.q}
                        <ChevronRight className={`h-3 w-3 group-open:rotate-90 transition-transform ${section.color}`} />
                      </summary>
                      <div className="px-4 pb-4 text-[11px] leading-relaxed text-muted-foreground font-medium">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* FOOTER CALLOUT */}
      <section className="glass-strong rounded-[2.5rem] p-12 border border-white/10 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
         <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <Cpu className="h-10 w-10 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold tracking-tight">Need deeper assistance?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
               Our neural networks are constantly learning. If your query isn't addressed here, use the Command Centre to trigger a manual intelligence report.
            </p>
         </div>
      </section>
    </div>
  );
}
