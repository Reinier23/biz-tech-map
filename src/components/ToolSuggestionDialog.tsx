import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Lightbulb, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ToolSuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialToolName?: string;
}

export const ToolSuggestionDialog: React.FC<ToolSuggestionDialogProps> = ({
  isOpen,
  onClose,
  initialToolName = ''
}) => {
  const [toolName, setToolName] = useState(initialToolName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = toolName.trim();

    if (!cleaned) {
      toast({
        title: "Tool name required",
        description: "Please enter a tool name before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (cleaned.length > 120) {
      toast({
        title: "Name too long",
        description: "Please keep the tool name under 120 characters.",
        variant: "destructive"
      });
      return;
    }

    if (!/^[A-Za-z0-9][A-Za-z0-9 .+_/()&'-]{0,119}$/.test(cleaned)) {
      toast({
        title: "Invalid characters",
        description: "Use letters, numbers, spaces and basic punctuation only.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tool_suggestions')
        .insert({
          name: cleaned
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Suggestion submitted!",
        description: `Thank you for suggesting "${toolName}". We'll review it and add it to our catalog if appropriate.`,
        variant: "default"
      });

      setToolName('');
      onClose();
    } catch (error) {
      console.error('Error submitting tool suggestion:', error);
      toast({
        title: "Failed to submit suggestion",
        description: "There was an error submitting your suggestion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setToolName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Suggest a Tool
          </DialogTitle>
          <DialogDescription>
            Can't find the tool you're looking for? Let us know and we'll consider adding it to our catalog.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool-name">Tool Name</Label>
            <Input
              id="tool-name"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g., Monday.com, Airtable, Zapier..."
              className="w-full"
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !toolName.trim()}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Suggestion
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};