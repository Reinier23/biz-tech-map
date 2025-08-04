import { Button } from "@/components/ui/button";
import { ArrowRight, Network, Map, BarChart3, Users, Shield, Zap, Target, Eye, Puzzle, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/tech-landscape-hero.jpg";

const LandingPage = () => {
  const stats = [
    { label: "Tools Mapped", value: "10,000+" },
    { label: "Companies", value: "500+" },
    { label: "Cost Savings", value: "$2M+" },
    { label: "Time Saved", value: "40hrs/week" }
  ];

  const features = [
    {
      icon: <Network className="w-6 h-6" />,
      title: "Smart Connection Mapping",
      description: "Automatically detect data flows and integrations between your tools"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Visual Stack Overview",
      description: "See your entire technology ecosystem in one interactive dashboard"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Redundancy Detection",
      description: "Identify overlapping tools and consolidation opportunities"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Cost Analysis",
      description: "Track spending patterns and optimize your tech budget"
    },
    {
      icon: <Puzzle className="w-6 h-6" />,
      title: "Gap Identification",
      description: "Discover missing pieces in your technology stack"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security Assessment",
      description: "Monitor data security across your entire tool ecosystem"
    }
  ];

  const benefits = [
    {
      title: "Reduce Tool Sprawl",
      description: "Eliminate duplicate tools and streamline your tech stack for maximum efficiency",
      metric: "Average 30% cost reduction"
    },
    {
      title: "Improve Data Flow",
      description: "Understand how data moves through your organization and optimize integrations",
      metric: "2x faster onboarding"
    },
    {
      title: "Strategic Planning",
      description: "Make informed decisions about future technology investments",
      metric: "ROI increases by 45%"
    },
    {
      title: "Team Alignment",
      description: "Get everyone on the same page about which tools to use and when",
      metric: "50% less tool confusion"
    }
  ];

  const testimonials = [
    {
      quote: "TechMap helped us identify $200k in redundant software costs in just one week.",
      author: "Sarah Chen",
      role: "CTO, GrowthCorp",
      rating: 5
    },
    {
      quote: "Finally, we can see our entire tech stack in one place. Game changer for our operations team.",
      author: "Mike Rodriguez",
      role: "Operations Director, ScaleUp Inc",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How long does it take to map my tech stack?",
      answer: "Most teams complete their initial mapping in 15-30 minutes. The platform automatically enriches your data with integrations and cost information."
    },
    {
      question: "What types of tools can I map?",
      answer: "Any software tool used in your business - from CRM and marketing automation to HR systems and development tools. We support 10,000+ popular business applications."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade security with SOC 2 compliance. Your data is encrypted in transit and at rest, and we never share it with third parties."
    },
    {
      question: "Can I export my tech map?",
      answer: "Yes! Export your maps as PDFs, share interactive links with stakeholders, or integrate with your existing documentation tools."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-sm text-primary font-medium">
                <Users className="w-4 h-4" />
                <span>Trusted by 500+ companies</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Stop Flying Blind with Your
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  {" "}Tech Stack
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Map, analyze, and optimize your entire technology ecosystem. Eliminate redundancy, reduce costs, and make strategic decisions with complete visibility.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/add-tools">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                  Start Free Mapping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                View Demo
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={heroImage} 
                alt="Tech stack visualization dashboard" 
                className="w-full h-auto animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-60"></div>
            </div>
            {/* Floating elements */}
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
              Your Tech Stack is Costing You More Than You Think
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="text-4xl font-bold text-destructive">47%</div>
                <p className="text-muted-foreground">of companies have redundant tools doing the same job</p>
              </div>
              <div className="space-y-4">
                <div className="text-4xl font-bold text-destructive">$18M</div>
                <p className="text-muted-foreground">average annual waste on unused or duplicate software</p>
              </div>
              <div className="space-y-4">
                <div className="text-4xl font-bold text-destructive">67%</div>
                <p className="text-muted-foreground">of IT leaders lack visibility into their full tech stack</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Master Your Tech Stack
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features designed to give you complete control and visibility over your technology ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 rounded-xl bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg border">
                <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-card/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get from chaos to clarity in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-foreground">Add Your Tools</h3>
              <p className="text-muted-foreground">Simply enter the tools your team uses. We'll automatically enrich the data with logos, categories, and integration information.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-foreground">Generate Your Map</h3>
              <p className="text-muted-foreground">Our AI analyzes your stack and creates an interactive visualization showing connections, dependencies, and data flows.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-foreground">Optimize & Save</h3>
              <p className="text-muted-foreground">Get actionable insights on consolidation opportunities, cost savings, and strategic recommendations for your stack.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Transform Your Technology Investment
            </h2>
            <p className="text-muted-foreground text-lg">
              See immediate impact on your operations, costs, and strategic decision-making
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-8 rounded-xl bg-card border">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground mb-3">{benefit.description}</p>
                    <div className="text-sm font-medium text-primary">{benefit.metric}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-card/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Loved by Teams Worldwide
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-xl bg-card border">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
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

      {/* FAQ */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 rounded-xl bg-card border">
                <h3 className="text-lg font-semibold text-card-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Ready to Take Control of Your Tech Stack?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of companies saving time and money with complete tech stack visibility
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/add-tools">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                  Start Your Free Map
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • 5-minute setup • Free forever
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;