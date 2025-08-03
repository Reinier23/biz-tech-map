import LandingPage from "@/components/LandingPage";
import { SampleDataLoader } from "@/components/SampleDataLoader";
import { useTools } from "@/contexts/ToolsContext";

const Index = () => {
  const { tools } = useTools();
  
  return (
    <div className="relative">
      <LandingPage />
      {/* Sample Data Loader for Development */}
      <div className="fixed bottom-4 right-4 z-50">
        <SampleDataLoader />
      </div>
    </div>
  );
};

export default Index;
