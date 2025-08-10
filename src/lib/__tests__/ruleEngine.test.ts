import { describe, it, expect } from 'vitest';
import { analyzeStack } from '../ruleEngine';

describe('ruleEngine', () => {
  const mockCostsByName = {
    'salesforce': { cost_mo: 150, cost_basis: 'per user', source: 'tool' as const },
    'pipedrive': { cost_mo: 25, cost_basis: 'per user', source: 'tool' as const },
    'zendesk': { cost_mo: 49, cost_basis: 'per user', source: 'tool' as const },
    'intercom': { cost_mo: 99, cost_basis: 'per user', source: 'tool' as const },
  };

  it('should identify CRM overlaps', () => {
    const tools = [
      { name: 'Salesforce', category: 'Sales' },
      { name: 'Pipedrive', category: 'Sales' },
    ];

    const result = analyzeStack(tools, mockCostsByName);
    
    expect(result).toHaveLength(2);
    expect(result.some(item => item.action === 'Replace')).toBe(true);
    expect(result.some(item => item.action === 'Keep')).toBe(true);
  });

  it('should handle support tool overlaps', () => {
    const tools = [
      { name: 'Zendesk', category: 'Service' },
      { name: 'Intercom', category: 'Service' },
    ];

    const result = analyzeStack(tools, mockCostsByName);
    
    expect(result).toHaveLength(2);
    expect(result.some(item => item.action === 'Evaluate')).toBe(true);
  });

  it('should recommend keeping tools with no overlaps', () => {
    const tools = [
      { name: 'Salesforce', category: 'Sales' },
      { name: 'Google Analytics', category: 'Analytics' },
    ];

    const result = analyzeStack(tools, mockCostsByName);
    
    expect(result).toHaveLength(2);
    expect(result.every(item => item.action === 'Keep')).toBe(true);
  });

  it('should handle empty tool list', () => {
    const result = analyzeStack([], mockCostsByName);
    expect(result).toHaveLength(0);
  });

  it('should include cost information when available', () => {
    const tools = [
      { name: 'Salesforce', category: 'Sales' },
    ];

    const result = analyzeStack(tools, mockCostsByName);
    
    expect(result[0].cost_mo).toBe(150);
    expect(result[0].name).toBe('Salesforce');
  });

  it('should handle missing cost data gracefully', () => {
    const tools = [
      { name: 'Unknown Tool', category: 'Other' },
    ];

    const result = analyzeStack(tools, {});
    
    expect(result[0].cost_mo).toBe(null);
    expect(result[0].action).toBe('Keep');
  });
});