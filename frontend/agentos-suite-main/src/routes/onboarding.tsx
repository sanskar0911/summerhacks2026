import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import api from "../lib/api";
import { 
  User, 
  MapPin, 
  Phone, 
  Cpu, 
  Briefcase, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Loader2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingComponent,
});

const SKILLS_SUGGESTIONS = [
  "React", "Node.js", "TypeScript", "Python", "UI Design", 
  "Next.js", "SQL", "Cloud Architecture", "DevOps", "AI/ML"
];

function OnboardingComponent() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
    bio: "",
    skills: [] as string[],
    experienceLevel: "Intermediate",
    yearsOfExperience: 2,
    jobType: "Freelance",
    availability: 40,
    expectedSalary: "5000",
  });

  const [skillInput, setSkillInput] = useState("");

  const updateForm = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      updateForm({ skills: [...formData.skills, skill] });
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateForm({ skills: formData.skills.filter(s => s !== skill) });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/profile", formData);
      await refreshUser();
      navigate({ to: "/sanskar" });
    } catch (error) {
      console.error("Onboarding failed", error);
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Complete your profile</h1>
          <span className="text-xs font-medium text-muted-foreground">Step {step} of 3</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-gradient-primary"
          />
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={step}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">Tell us about yourself</h2>
                <p className="text-sm text-muted-foreground">Help others get to know you better</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3 w-3" /> Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => updateForm({ phone: e.target.value })}
                    className="w-full glass bg-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => updateForm({ location: e.target.value })}
                    className="w-full glass bg-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" /> Bio / Brief Description
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={e => updateForm({ bio: e.target.value })}
                  className="w-full glass bg-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  placeholder="I am a passionate developer with expertise in..."
                />
              </div>

              <button
                onClick={nextStep}
                className="w-full bg-white/5 hover:bg-white/10 text-foreground py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-6"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">Professional Skills</h2>
                <p className="text-sm text-muted-foreground">What do you bring to the table?</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Cpu className="h-3 w-3" /> High-Level Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddSkill(skillInput)}
                      className="flex-1 glass bg-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      placeholder="Type a skill..."
                    />
                    <button 
                      onClick={() => handleAddSkill(skillInput)}
                      className="px-4 bg-primary text-primary-foreground rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                        {skill}
                        <button onClick={() => removeSkill(skill)}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Experience Level</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={e => updateForm({ experienceLevel: e.target.value })}
                      className="w-full glass bg-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Expert</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Years Experience</label>
                    <input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={e => updateForm({ yearsOfExperience: parseInt(e.target.value) })}
                      className="w-full glass bg-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={nextStep}
                  className="flex-2 bg-gradient-primary text-primary-foreground py-3 px-10 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">Preferences & Rates</h2>
                <p className="text-sm text-muted-foreground">Final details before setting up your dashboard</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-3 w-3" /> Preferred Job Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Full-time", "Part-time", "Freelance"].map(type => (
                      <button
                        key={type}
                        onClick={() => updateForm({ jobType: type })}
                        className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                          formData.jobType === type 
                            ? "bg-primary text-primary-foreground shadow-glow-primary" 
                            : "glass bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Availability (Hours/Week)
                    </label>
                    <input
                      type="number"
                      value={formData.availability}
                      onChange={e => updateForm({ availability: parseInt(e.target.value) })}
                      className="w-full glass bg-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-3 w-3" /> Monthly Rate ($)
                    </label>
                    <input
                      type="text"
                      value={formData.expectedSalary}
                      onChange={e => updateForm({ expectedSalary: e.target.value })}
                      className="w-full glass bg-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-2 bg-gradient-primary text-primary-foreground py-3 px-10 rounded-xl flex items-center justify-center gap-2 transition-all glow-primary"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>Finish Onboarding <Check className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
