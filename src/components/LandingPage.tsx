import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Star, AlertTriangle } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/tech-stack-consolidation-hero.jpg";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Integrate with waitlist backend
      console.log("Email submitted to waitlist:", email);
      setIsSubmitted(true);
      setEmail("");
    }
  };

  const problems = [
    "Redundant tools doing the same job",
    "No visibility across teams or departments", 
    "Unused licenses piling up",
    "Surprise renewals and shadow IT"
  ];

  const steps = [
    {
      title: "Add Your Tools",
      description: "Input the tools your team uses. We enrich them automatically with logos, categories, and integration info."
    },
    {
      title: "Visualize Your Stack", 
      description: "See your entire stack in a clear visual layout — including connections, overlaps, and gaps."
    },
    {
      title: "Optimize & Save",
      description: "Get AI-powered suggestions to consolidate tools, reduce costs, and strengthen your tech setup."
    }
  ];

  const testimonials = [
    {
      quote: "We saved $200k in redundant software within the first week.",
      author: "Sarah Chen",
      role: "CTO, GrowthCorp"
    },
    {
      quote: "Game-changer. We finally have a clear view of our entire stack.",
      author: "Mike Rodriguez", 
      role: "Ops Director, ScaleUp Inc."
    }
  ];

  const futureFeatures = [
    "AI Stack Architect – Your personalized GPT agent for building an ideal, efficient stack",
    "Autopilot Optimization – Continuous suggestions as your stack evolves", 
    "Integration Mapping – Visualize real data flows between tools",
    "ROI & Usage Insights – Spot underperforming tools in seconds",
    "Slack + Email Alerts – Never miss a contract renewal or cost spike",
    "Benchmarking – Compare your stack to similar companies",
    "One-Click Consolidation – Deactivate or migrate tools directly from the platform (coming later)"
  ];

  const EmailForm = () => (
    <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
      />
      <Button type="submit" variant="hero" className="px-6">
        {isSubmitted ? "Thanks!" : "Get Early Access"}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Optimize Your SaaS Stack. Save Money.
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  {" "}Instantly.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Biz Tech Map helps you visualize your tech stack, eliminate redundant tools, and cut costs — all powered by AI.
              </p>
            </div>

            {/* Email Form */}
            <EmailForm />
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={heroImage} 
                alt="Tech stack optimization dashboard" 
                className="w-full h-auto animate-float"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-glow/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="bg-card/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Your Tech Stack Is Costing You More Than You Think
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {problems.map((problem, index) => (
                <div key={index} className="flex items-center space-x-3 text-left">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <span className="text-muted-foreground">{problem}</span>
                </div>
              ))}
            </div>
            <p className="text-lg text-primary font-medium">
              Most companies waste up to 30% of their SaaS budget. Let's fix that.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-card/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Early Feedback
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-xl bg-card border">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="text-lg text-card-foreground mb-4">"{testimonial.quote}"</blockquote>
                <div>
                  <div className="font-semibold text-card-foreground">{testimonial.author}</div>
                  <div className="text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Coming Soon: Even Smarter Stack Management
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {futureFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-card/50 border">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-card-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Now Callout */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Why Now?
            </h2>
            <div className="text-lg text-muted-foreground space-y-2">
              <p className="flex items-center justify-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span>48% of companies plan to optimize their software spend this year.</span>
              </p>
              <p>Don't miss the moment. SaaS sprawl is costing companies time and money — and you don't need to be one of them.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Get Early Access
            </h2>
            <p className="text-xl text-muted-foreground">
              Be the first to optimize your stack and cut costs with AI. No credit card required.
            </p>
            <EmailForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card/30 py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-muted-foreground">
            <span>© 2025 Biz Tech Map</span>
            <div className="flex space-x-6">
              <span>Contact: hello@biztechmap.com</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;