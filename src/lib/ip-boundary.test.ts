import { describe, it, expect } from 'vitest';
import { splitIpRange, ipToLong } from './ip-utils';

describe('Debugging Boundary Case: 198.120.0.1 - 198.120.1.0', () => {
    const startIP = '198.120.0.1';
    const endIP = '198.120.1.0';

    it('prints the long values for verification', () => {
        const startLong = ipToLong(startIP);
        const endLong = ipToLong(endIP);

        console.log(`Start: ${startIP} -> ${startLong}`);
        console.log(`End:   ${endIP}   -> ${endLong}`);
        console.log(`Diff: ${endLong - startLong}`);

        // Verify they are positive integers (unsigned)
        expect(startLong).toBeGreaterThan(0);
        expect(endLong).toBeGreaterThan(0);
        expect(endLong).toBeGreaterThan(startLong);
    });

    it('splits correctly across octet boundary', () => {
        // 跨越从 0.1 到 1.0，总共有 256 个 IP (0.1...0.255 + 1.0)
        // 应该切分成很多个 20 大小的块
        const chunks = splitIpRange(startIP, endIP, 20);

        console.log(`Generated ${chunks.length} chunks`);
        chunks.forEach((c, i) => console.log(`Chunk ${i}: ${c.start} - ${c.end}`));

        // Total IPs covered verification
        let covered = 0;
        chunks.forEach(c => {
            covered += (ipToLong(c.end) - ipToLong(c.start) + 1);
        });

        // Since valid IPs exclude .0 and .255
        // In this range: 198.120.0.1 -> 198.120.1.0
        // We encounter:
        // 198.120.0.255 (Broadcast, skipped)
        // 198.120.1.0 (Network, skipped)
        // So we expect 256 - 2 = 254 IPs covered.
        const expectedTotal = ipToLong(endIP) - ipToLong(startIP) + 1;
        expect(covered).toBe(expectedTotal - 2);
    });
});
