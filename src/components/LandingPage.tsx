import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Star, AlertTriangle, Lightbulb, RefreshCw, TrendingDown, BarChart3, Brain, Zap, Mail, Gauge, Globe, HelpCircle } from "lucide-react";
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

  const logos = ["HubSpot", "Slack", "Notion", "Intercom", "Asana"];

  const features = [
    { icon: Lightbulb, text: "Visualize your entire SaaS stack in one dashboard" },
    { icon: RefreshCw, text: "Detect redundant or overlapping tools" },
    { icon: TrendingDown, text: "Identify cost-saving opportunities automatically" },
    { icon: BarChart3, text: "Understand how tools are connected — and where gaps exist" },
    { icon: Brain, text: "Get GPT-powered suggestions to consolidate or improve" }
  ];

  const steps = [
    {
      title: "Add Your Tools",
      description: "Input the software you use — or let us discover them automatically via integrations."
    },
    {
      title: "See Your Stack",
      description: "Get an interactive, visual map of your tools, grouped by category, function, and cost."
    },
    {
      title: "Optimize with AI",
      description: "Biz Tech Map shows where you can save money, eliminate waste, or improve performance — and why."
    }
  ];

  const comingFeatures = [
    { icon: Brain, text: "AI Stack Architect: Get a fully redesigned stack based on your goals, budget, and size" },
    { icon: TrendingDown, text: "ROI & Usage Tracking: Know what tools deliver value — and which don't" },
    { icon: Gauge, text: "Auto-Audit Mode: Ongoing suggestions as your stack evolves" },
    { icon: Globe, text: "Tool-to-Tool Mapping: See actual data flows across your stack" },
    { icon: Mail, text: "Slack & Email Alerts: Get notified before surprise renewals or waste builds up" }
  ];

  const faqs = [
    {
      question: "How does Biz Tech Map work?",
      answer: "You enter the tools you use, and our AI maps, analyzes, and suggests ways to optimize your stack based on usage, category, and redundancy."
    },
    {
      question: "Is it free?",
      answer: "Yes! You can start completely free. We're currently offering early access with no credit card required."
    },
    {
      question: "Who is it for?",
      answer: "Sales, marketing, and operations teams that want more control over their SaaS tools — and want to spend smarter."
    },
    {
      question: "Is my data secure?",
      answer: "Yes — we use encrypted transmission and storage. Your tool data is never sold or shared."
    }
  ];

  const EmailForm = ({ label = "Join Early Access", size = "default" }: { label?: string; size?: "default" | "large" }) => (
    <form onSubmit={handleEmailSubmit} className={`flex flex-col sm:flex-row gap-3 ${size === "large" ? "max-w-lg" : "max-w-md"} mx-auto`}>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={`flex-1 ${size === "large" ? "h-12 text-lg" : ""}`}
      />
      <Button type="submit" className={`${size === "large" ? "h-12 px-8 text-lg" : "px-6"} bg-primary hover:bg-primary/90 text-primary-foreground font-semibold`}>
        {isSubmitted ? "Thanks!" : label}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-7xl font-bold text-foreground leading-tight">
            Your Tech Stack Is Costing You
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {" "}More Than You Think.
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Biz Tech Map helps you map, analyze, and optimize your SaaS tools — powered by GPT. Cut redundant tools, reduce spend, and make smarter software decisions.
          </p>
          
          {/* Primary CTA */}
          <div className="pt-8">
            <EmailForm label="Join Early Access" size="large" />
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="border-t border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Built for modern SaaS teams
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
              {logos.map((logo, index) => (
                <div key={index} className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Callout Section */}
      <div className="py-20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              47% of companies have tools that do the same job.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Most teams use 100+ apps. Many of them are redundant, underused, or unmonitored. SaaS sprawl is costing businesses up to 30% of their budget — and most don't even know it.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              What Biz Tech Map Helps You Do
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-6 border-0 bg-card/50 hover:bg-card/70 transition-colors">
                  <CardContent className="p-0 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-card-foreground leading-relaxed">{feature.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              What's Coming Next
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {comingFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4 p-6 rounded-xl bg-card/30 border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-card-foreground leading-relaxed">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-semibold text-foreground">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
              Join 500+ businesses getting clarity on their tech stack.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Biz Tech Map helps you reduce waste, save money, and simplify your tools — using AI.
            </p>
            <div className="pt-4">
              <EmailForm label="Join the Early Access" size="large" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card/30 py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-muted-foreground">
            <span>© 2025 Biz Tech Map</span>
            <div className="flex space-x-8">
              <span className="hover:text-foreground cursor-pointer transition-colors">Contact: hello@biztechmap.com</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;