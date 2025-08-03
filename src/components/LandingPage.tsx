import { Button } from "@/components/ui/button";
import { ArrowRight, Network, Map, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/tech-landscape-hero.jpg";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Tech Landscape
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  {" "}Mapper
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Enter your sales, marketing and service tools to see a visual overview of your stack
              </p>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-card hover:bg-card/80 transition-colors">
                <div className="p-2 rounded-md bg-primary/10">
                  <Network className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-card-foreground">Visualize Connections</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-card hover:bg-card/80 transition-colors">
                <div className="p-2 rounded-md bg-primary/10">
                  <Map className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-card-foreground">Map Dependencies</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-card hover:bg-card/80 transition-colors">
                <div className="p-2 rounded-md bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-card-foreground">Analyze Stack</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link to="/add-tools">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                  Start Mapping Your Stack
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={heroImage} 
                alt="Tech stack visualization" 
                className="w-full h-auto animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-60"></div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-glow/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Understand Your Technology Ecosystem
            </h2>
            <p className="text-muted-foreground text-lg">
              Get clarity on tool overlaps, identify gaps, and optimize your tech investments with our interactive mapping platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;