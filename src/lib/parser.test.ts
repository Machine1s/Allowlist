import { describe, it, expect } from 'vitest';
import { generateTxtFromPolicies, parseTxtToPolicies } from './parser';
import type { Policy } from './types';

describe('Parser Logic', () => {
    it('generates standard output for normal policies', () => {
        const policies: Policy[] = [{
            id: '1',
            description: 'TestPolicy',
            protocol: 'tcp',
            ipObjects: ['1.1.1.1'],
            portObjects: ['80'],
            isValid: true,
            validationErrors: [],
            portObjectsObjects: [],
            enableDualPlane: false
        } as any]; // Casting for simple mock

        const output = generateTxtFromPolicies(policies);
        expect(output).toBe('TestPolicy tcp 0 0 1.1.1.1 80');
    });

    it('generates interleaved A/B output when enableDualPlane is true', () => {
        const policies: Policy[] = [{
            id: '1',
            description: 'WebFarm',
            protocol: 'tcp',
            ipObjects: ['198.120.1.100'],
            portObjects: ['80'],
            isValid: true,
            validationErrors: [],
            enableDualPlane: true
        } as any];

        const output = generateTxtFromPolicies(policies);
        const lines = output.split('\n');

        // Expect 2 lines
        expect(lines).toHaveLength(2);

        // Line A
        expect(lines[0]).toBe('WebFarm tcp 0 0 198.120.1.100 80');

        // Line B (Auto generated)
        // Should have same description and mapped IP
        expect(lines[1]).toBe('WebFarm tcp 0 0 198.121.1.100 80');
    });

    it('handles range mapping correctly in dual plane', () => {
        const policies: Policy[] = [{
            id: '1',
            description: 'RangeMap',
            protocol: 'udp',
            ipObjects: ['198.120.1.10-198.120.1.20'],
            portObjects: ['53'],
            isValid: true,
            validationErrors: [],
            enableDualPlane: true
        } as any];

        const output = generateTxtFromPolicies(policies);
        const lines = output.split('\n');

        expect(lines[0]).toContain('198.120.1.10-198.120.1.20');
        expect(lines[1]).toContain('198.121.1.10-198.121.1.20');
        expect(lines[1]).toContain('RangeMap'); // Same name
    });

    it('handles custom mapping prefixes', () => {
        const policies: Policy[] = [{
            id: '1',
            description: 'CustomMap',
            protocol: 'tcp',
            ipObjects: ['198.160.0.0-198.160.0.255'],
            portObjects: ['80'],
            isValid: true,
            validationErrors: [],
            enableDualPlane: true
        } as any];

        // Pass custom config
        const output = generateTxtFromPolicies(policies, { fromPrefix: '198.160', toPrefix: '198.161' });
        const lines = output.split('\n');

        // Since range splitting logic removes .0 and .255, we just check if it mapped correctly to 198.161 prefix
        expect(lines[0]).toContain('198.160.');
        expect(lines[1]).toContain('198.161.');
        expect(lines[1]).toContain('CustomMap');
    });
});
