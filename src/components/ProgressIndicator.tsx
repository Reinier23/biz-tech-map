import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Plus, BarChart } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8 p-6 bg-card border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
            currentStep >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
          }`}>
            <Plus className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-medium">{stepLabels[0]}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
            currentStep >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
          }`}>
            <BarChart className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-medium">{stepLabels[1]}</span>
          </div>
        </div>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="mt-2 text-center">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};