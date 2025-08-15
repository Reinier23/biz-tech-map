import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Star, AlertTriangle, Lightbulb, RefreshCw, TrendingDown, BarChart3, Brain, Zap, Mail, Gauge, Globe, HelpCircle, ArrowRight, Sparkles, Shield, Rocket } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/tech-stack-consolidation-hero.jpg";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ 
          email: email.toLowerCase().trim(),
          source: 'landing_page'
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already signed up!",
            description: "This email is already on our waitlist. We'll be in touch soon!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome to the waitlist!",
          description: "Thanks for signing up. We'll notify you when early access is available.",
        });
        setIsSubmitted(true);
      }
      
      setEmail("");
    } catch (error) {
      console.error('Error submitting email:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later or contact hello@biztechmap.com",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logos = ["HubSpot", "Slack", "Notion", "Intercom", "Asana"];

  const features = [
    { icon: Lightbulb, text: "Visualize your entire SaaS stack in one dashboard" },
    { icon: RefreshCw, text: "Detect redundant or overlapping tools" },
    { icon: TrendingDown, text: "Identify cost-saving opportunities automatically" },
    { icon: BarChart3, text: "Understand how tools are connected — and where gaps exist" },
    { icon: Brain, text: "Get AI-powered suggestions to consolidate or improve" }
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
      answer: "We analyze your SaaS stack to identify redundancies, cost-saving opportunities, and optimization suggestions. Our AI-powered platform provides actionable insights to streamline your tech stack."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade security and never store sensitive information. Your data is encrypted and protected with industry-standard practices."
    },
    {
      question: "How much can I save?",
      answer: "Most companies save 20-40% on their SaaS spend by eliminating redundant tools and optimizing their stack. We'll show you exactly where the opportunities are."
    },
    {
      question: "What integrations do you support?",
      answer: "We integrate with popular SaaS platforms and can automatically discover tools through SSO providers, expense systems, and direct integrations."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <Helmet>
        <title>Biz Tech Map - Optimize Your SaaS Stack</title>
        <meta name="description" content="Visualize, analyze, and optimize your SaaS stack with AI-powered insights. Save money and eliminate redundant tools." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <div className="container relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                <Sparkles className="h-4 w-4" />
                AI-Powered SaaS Optimization
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6"
            >
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Optimize Your
              </span>
              <br />
              <span className="text-foreground">
                SaaS Stack
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Visualize your entire tech stack, identify redundancies, and save up to 40% on SaaS costs with AI-powered insights.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button 
                size="xl" 
                variant="premium" 
                className="group"
                onClick={() => window.location.href = '/add-tools'}
              >
                <span className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                onClick={() => window.location.href = '/mapper'}
              >
                <span>View Demo</span>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-blue-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Free forever plan</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Everything you need to optimize your stack
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From visualization to AI-powered recommendations, we've got you covered.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-elegant transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-lg font-medium leading-relaxed">{feature.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to optimize your tech stack
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={itemVariants} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Features */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Coming soon
            </h2>
            <p className="text-xl text-muted-foreground">
              We're building the future of SaaS management
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {comingFeatures.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-dashed hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-muted">
                        <feature.icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Get early access
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the waitlist and be the first to know when we launch
            </p>

            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                variant="premium" 
                loading={isLoading}
                disabled={isSubmitted}
              >
                {isSubmitted ? "Signed Up!" : "Join Waitlist"}
              </Button>
            </form>

            <p className="mt-3 text-xs text-muted-foreground">
              No spam • Cancel anytime • Priority for first 1,000 signups
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Frequently asked questions
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="card-premium">
                  <AccordionTrigger className="text-left px-6 py-4 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Biz Tech Map. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Built with ❤️ for modern teams
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;