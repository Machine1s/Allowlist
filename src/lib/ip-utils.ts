
export function ipToLong(ip: string): number {
    const parts = ip.split('.');
    if (parts.length !== 4) throw new Error(`Invalid IP address: ${ip}`);
    return (
        (parseInt(parts[0], 10) << 24) |
        (parseInt(parts[1], 10) << 16) |
        (parseInt(parts[2], 10) << 8) |
        parseInt(parts[3], 10)
    ) >>> 0;
}

export function longToIp(long: number): string {
    return [
        (long >>> 24) & 0xff,
        (long >>> 16) & 0xff,
        (long >>> 8) & 0xff,
        long & 0xff,
    ].join('.');
}

export function isCidr(str: string): boolean {
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(str);
}

export function isIpRange(str: string): boolean {
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}-\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str);
}

export function cidrToRange(cidr: string): { start: string; end: string } {
    const [ip, maskStr] = cidr.split('/');
    const mask = parseInt(maskStr, 10);
    if (isNaN(mask) || mask < 0 || mask > 32) {
        throw new Error(`Invalid CIDR mask: ${maskStr}`);
    }

    const ipLong = ipToLong(ip);
    const netmask = (0xffffffff << (32 - mask)) >>> 0;
    const startLong = (ipLong & netmask) >>> 0;
    const endLong = (startLong | ~netmask) >>> 0;

    return {
        start: longToIp(startLong),
        end: longToIp(endLong),
    };
}

export function splitIpRange(
    startIp: string,
    endIp: string,
    maxCount: number = 20
): { start: string; end: string }[] {
    const startLong = ipToLong(startIp);
    const endLong = ipToLong(endIp);

    if (startLong > endLong) {
        throw new Error(`Invalid range: Start IP ${startIp} is greater than End IP ${endIp}`);
    }

    const chunks: { start: string; end: string }[] = [];
    let current = startLong;

    // Helper to check if IP ends in .0 or .255
    const isRestricted = (val: number) => {
        const lastOctet = val & 0xff;
        return lastOctet === 0 || lastOctet === 255;
    };

    while (current <= endLong) {
        // 1. Skip leading restricted IPs
        // e.g., if we are at .0, move to .1
        while (current <= endLong && isRestricted(current)) {
            current++;
        }

        if (current > endLong) break;

        // 2. Build the chunk
        // We start at 'current' (which is valid), and try to find 'chunkEnd'
        // We can take at most 'maxCount' valid IPs.
        // But if we hit a restricted IP in the middle, we must stop immediately.

        let validCount = 1;      // We already have 'current'
        let probe = current + 1; // Probe next candidate
        let chunkEnd = current;  // Init end to current

        while (validCount < maxCount && probe <= endLong) {
            if (isRestricted(probe)) {
                // We hit a wall (e.g. .255), so this chunk must end at previous valid IP.
                // The next loop iteration will handle skipping this bad IP via step 1.
                break;
            }
            // Valid IP, extend chunk
            chunkEnd = probe;
            validCount++;
            probe++;
        }

        chunks.push({
            start: longToIp(current),
            end: longToIp(chunkEnd),
        });

        // Next iteration starts after this chunk
        current = chunkEnd + 1;
    }

    return chunks;
}

export function isValidIp(ip: string): boolean {
    // Simple regex for format: d.d.d.d, each part 0-255 handled by logic or regex
    // This regex ensures 4 parts
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return false;

    // Validate each part is 0-255
    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
}

export function normalizeIpInput(input: string): { start: string; end: string }[] {
    const cleanInput = input.trim();
    if (!cleanInput) return [];

    if (isCidr(cleanInput)) {
        const range = cidrToRange(cleanInput);
        return splitIpRange(range.start, range.end);
    } else if (isIpRange(cleanInput)) {
        const [start, end] = cleanInput.split('-');
        return splitIpRange(start, end);
    } else {
        // Single IP
        if (!isValidIp(cleanInput)) {
            throw new Error(`Invalid IP address format: ${cleanInput}`);
        }
        return [{ start: cleanInput, end: cleanInput }];
    }
}
