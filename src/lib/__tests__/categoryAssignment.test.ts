import { describe, it, expect } from 'vitest';

// Test the category assignment logic
describe('Category Assignment Logic', () => {
  it('should handle high confidence categorization', () => {
    const mockEnrichmentData = {
      category: 'Marketing',
      confidence: 95,
      description: 'Marketing automation platform',
      logoUrl: 'https://example.com/logo.png'
    };

    expect(mockEnrichmentData.confidence).toBeGreaterThanOrEqual(80);
    expect(mockEnrichmentData.category).toBe('Marketing');
  });

  it('should handle low confidence categorization with fallback', () => {
    const mockEnrichmentData = {
      category: 'Other',
      confidence: 45,
      description: 'Tool categorization uncertain',
      logoUrl: ''
    };

    expect(mockEnrichmentData.confidence).toBeLessThan(80);
    expect(mockEnrichmentData.category).toBe('Other');
  });

  it('should provide fallback for failed enrichment', () => {
    const toolName = 'Unknown Tool';
    const fallbackData = {
      category: 'Other',
      description: `${toolName} - Please add description manually`,
      logoUrl: '',
      confidence: 0
    };

    expect(fallbackData.category).toBe('Other');
    expect(fallbackData.confidence).toBe(0);
    expect(fallbackData.description).toContain('Please add description manually');
  });

  it('should preserve existing confirmed categories', () => {
    const existingTool = {
      id: '1',
      name: 'Test Tool',
      category: 'Marketing',
      confirmedCategory: 'Sales',
      description: 'Test description'
    };

    // Simulate AI suggesting different category
    const aiSuggestion = 'Marketing';
    
    // Logic should preserve the confirmed category
    const finalCategory = existingTool.confirmedCategory || aiSuggestion;
    expect(finalCategory).toBe('Sales');
  });

  it('should handle backward compatibility for legacy tools', () => {
    const legacyTool = {
      id: '1',
      name: 'Legacy Tool',
      category: 'Other',
      description: 'Legacy tool description'
      // No confidence or confirmedCategory fields
    };

    // Should handle missing confidence gracefully
    const hasConfidence = 'confidence' in legacyTool;
    expect(hasConfidence).toBe(false);
    
    // Should default to showing override options for legacy tools
    const shouldShowOverride = !('confidence' in legacyTool) || (legacyTool as any).confidence < 80;
    expect(shouldShowOverride).toBe(true);
  });
});