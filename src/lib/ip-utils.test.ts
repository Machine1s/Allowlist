import { describe, it, expect } from 'vitest';
import { splitIpRange, cidrToRange, ipToLong, longToIp, normalizeIpInput } from './ip-utils';

describe('IP Utilities', () => {
    describe('Basic Conversions', () => {
        it('converts IP to Long correctly', () => {
            expect(ipToLong('0.0.0.0')).toBe(0);
            expect(ipToLong('255.255.255.255')).toBe(4294967295);
            expect(ipToLong('192.168.1.1')).toBe(3232235777);
        });

        it('converts Long to IP correctly', () => {
            expect(longToIp(0)).toBe('0.0.0.0');
            expect(longToIp(4294967295)).toBe('255.255.255.255');
            expect(longToIp(3232235777)).toBe('192.168.1.1');
        });
    });

    describe('CIDR to Range', () => {
        it('converts /24 correctly', () => {
            const result = cidrToRange('192.168.1.0/24');
            expect(result).toEqual({ start: '192.168.1.0', end: '192.168.1.255' });
        });

        it('converts /30 correctly', () => {
            const result = cidrToRange('192.168.1.0/30');
            expect(result).toEqual({ start: '192.168.1.0', end: '192.168.1.3' });
        });

        it('converts single IP /32 correctly', () => {
            const result = cidrToRange('10.0.0.1/32');
            expect(result).toEqual({ start: '10.0.0.1', end: '10.0.0.1' });
        });
    });

    describe('Split IP Range Logic', () => {
        it('does not split if count is within limit', () => {
            // 10 IPs (1-10)
            const input = { start: '1.1.1.1', end: '1.1.1.10' };
            const chunks = splitIpRange(input.start, input.end, 20);
            expect(chunks.length).toBe(1);
            expect(chunks[0]).toEqual(input);
        });

        it('splits correctly when count exceeds limit', () => {
            // 25 IPs (1-25), limit 20
            // Expected: 1-20 (20 IPs), 21-25 (5 IPs)
            const chunks = splitIpRange('1.1.1.1', '1.1.1.25', 20);
            expect(chunks.length).toBe(2);
            expect(chunks[0]).toEqual({ start: '1.1.1.1', end: '1.1.1.20' });
            expect(chunks[1]).toEqual({ start: '1.1.1.21', end: '1.1.1.25' });
        });

        it('splits large ranges into multiple chunks', () => {
            // 45 IPs (1-45), limit 20
            // Expected: 1-20, 21-40, 41-45
            const chunks = splitIpRange('1.1.1.1', '1.1.1.45', 20);
            expect(chunks.length).toBe(3);
            expect(chunks[0]).toEqual({ start: '1.1.1.1', end: '1.1.1.20' });
            expect(chunks[1]).toEqual({ start: '1.1.1.21', end: '1.1.1.40' });
            expect(chunks[2]).toEqual({ start: '1.1.1.41', end: '1.1.1.45' });
        });

        it('handles boundary conditions exactly', () => {
            // 40 IPs (1-40), limit 20
            // Expected: 1-20, 21-40 (exactly 2 chunks)
            const chunks = splitIpRange('1.1.1.1', '1.1.1.40', 20);
            expect(chunks.length).toBe(2);
            expect(chunks[0]).toEqual({ start: '1.1.1.1', end: '1.1.1.20' });
            expect(chunks[1]).toEqual({ start: '1.1.1.21', end: '1.1.1.40' });
        });
    });

    describe('Network/Broadcast Address Exclusion', () => {

        it('excludes .0 and .255 from /24 range', () => {
            // 192.168.1.0/24 -> 192.168.1.0 to 192.168.1.255
            // Splitting logic should only produce IPs from .1 to .254
            // Since max count is 20, we expect chunks.
            // Let's verify the first and last chunk bounds
            const result = cidrToRange('192.168.1.0/24');
            const chunks = splitIpRange(result.start, result.end, 20);

            // First chunk should start at .1, NOT .0
            expect(chunks[0].start).toBe('192.168.1.1');

            // Last chunk should end at .254, NOT .255
            const lastChunk = chunks[chunks.length - 1];
            expect(lastChunk.end).toBe('192.168.1.254');
        });

        it('skips .0 and .255 when crossing octet boundary', () => {
            // Range: 192.168.0.250 - 192.168.1.5
            // Valid IPs: 
            // .0.250, .0.251, .0.252, .0.253, .0.254 (5 IPs)
            // (Skip .0.255, Skip .1.0)
            // .1.1, .1.2, .1.3, .1.4, .1.5 (5 IPs)
            // Total 10 IPs. Should be 1 chunk if limit is 20.
            // But since we skip IPs, let's see how splitIpRange handles it. 
            // It might return multiple chunks because of the gap, OR one chunk that visually looks like it spans across (but that would encompass the forbidden IPs).
            // Actually, "splitIpRange" returns a list of {start, end}. 
            // If a range includes forbidden IPs in the middle, it MUST be split into two ranges.
            // You cannot express "1 - 10 without 5" as a single Start-End range.
            // So this creates a new requirement: The range 192.168.0.250 - 192.168.1.5 MUST be at least 2 chunks:
            // Chunk 1: ... - 192.168.0.254
            // Chunk 2: 192.168.1.1 - ...

            const chunks = splitIpRange('192.168.0.250', '192.168.1.5', 20);

            expect(chunks.length).toBeGreaterThanOrEqual(2);

            // Verify no chunk ends in .255 or .0
            chunks.forEach(c => {
                expect(c.start).not.toMatch(/\.0$/);
                expect(c.start).not.toMatch(/\.255$/);
                expect(c.end).not.toMatch(/\.0$/);
                expect(c.end).not.toMatch(/\.255$/);
            });

            // Specifically check the gap
            // One chunk should end at .0.254
            // Next chunk should start at .1.1
            const chunkBeforeGap = chunks.find(c => c.end === '192.168.0.254');
            const chunkAfterGap = chunks.find(c => c.start === '192.168.1.1');
            expect(chunkBeforeGap).toBeDefined();
            expect(chunkAfterGap).toBeDefined();
        });
    });

    describe('Input Normalization', () => {

        it('validates correct IPs', () => {
            expect(() => normalizeIpInput('192.168.1.1')).not.toThrow();
            expect(() => normalizeIpInput('10.0.0.0/24')).not.toThrow();
            expect(() => normalizeIpInput('1.1.1.1-1.1.1.5')).not.toThrow();
        });

        it('throws for incomplete IP addresses', () => {
            expect(() => normalizeIpInput('1')).toThrow();
            expect(() => normalizeIpInput('213')).toThrow();
            expect(() => normalizeIpInput('192.168')).toThrow();
            expect(() => normalizeIpInput('1.1.1.256')).toThrow();
        });
    });
});
