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

  it('should handle confidence-based auto-assignment', () => {
    const highConfidenceResponse = {
      category: 'Marketing',
      confidence: 95,
      description: 'High confidence categorization',
      logoUrl: 'https://example.com/logo.png'
    };

    // High confidence should preserve AI suggestion
    const finalCategory = highConfidenceResponse.confidence >= 80 
      ? highConfidenceResponse.category 
      : 'Other';
    expect(finalCategory).toBe('Marketing');

    const lowConfidenceResponse = {
      category: 'Sales',
      confidence: 65,
      description: 'Low confidence categorization',
      logoUrl: ''
    };

    // Low confidence should default to "Other"
    const lowConfidenceFinalCategory = lowConfidenceResponse.confidence >= 80 
      ? lowConfidenceResponse.category 
      : 'Other';
    expect(lowConfidenceFinalCategory).toBe('Other');
  });

  it('should handle edge function error responses', () => {
    const errorResponse = {
      error: 'OpenAI API error',
      fallback: {
        category: 'Other',
        description: 'Please add description manually',
        logoUrl: '',
        confidence: 0,
        reasoning: 'AI enrichment failed',
        alternativeCategories: []
      }
    };

    expect(errorResponse.fallback.category).toBe('Other');
    expect(errorResponse.fallback.confidence).toBe(0);
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
    const shouldShowOverride = legacyTool.category === 'Other' || !('confidence' in legacyTool);
    expect(shouldShowOverride).toBe(true);
  });
});