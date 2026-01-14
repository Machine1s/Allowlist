import type { Policy } from './types';
import { normalizeIpInput, getDualPlaneIp } from './ip-utils';

// Simple ID generator to avoid adding deps if not needed, or I can just use crypto.randomUUID
function generateId(): string {
    return crypto.randomUUID();
}

export function parseTxtToPolicies(txt: string): Policy[] {
    const lines = txt.split('\n');
    const policyMap = new Map<string, Policy>();

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Regex to match the standard format: Description Protocol 0 0 IP Port
        // Captures: 1=Desc, 2=Proto, 3=IP, 4=Port
        const match = trimmed.match(/^(.*?)\s+(tcp|udp)\s+0\s+0\s+(\S+)\s+(\S+)\s*$/);

        if (!match) {
            console.warn(`Line ${index + 1} does not match expected format: ${line}`);
            // In a real app we might want to collect these errors
            return;
        }

        const [, description, protocol, ipStr, portStr] = match;
        const proto = protocol as 'tcp' | 'udp';
        const key = `${description}|${proto}`;

        if (!policyMap.has(key)) {
            policyMap.set(key, {
                id: generateId(),
                description,
                protocol: proto,
                ipObjects: [],
                portObjects: [],
                isValid: true,
                validationErrors: [],
                enableDualPlane: false // Default to false when parsing
            });
        }

        const policy = policyMap.get(key)!;

        // Add IP if unique
        if (!policy.ipObjects.includes(ipStr)) {
            policy.ipObjects.push(ipStr);
        }

        // Add Port if unique
        if (!policy.portObjects.includes(portStr)) {
            policy.portObjects.push(portStr);
        }
    });

    return Array.from(policyMap.values());
}

export function generateTxtFromPolicies(
    policies: Policy[],
    dualPlaneConfig: { fromPrefix: string; toPrefix: string } = { fromPrefix: '198.120', toPrefix: '198.121' }
): string {
    const lines: string[] = [];

    for (const policy of policies) {
        if (!policy.isValid) continue;

        const expandedIps: string[] = [];

        // Process and Split IPs
        for (const ipObj of policy.ipObjects) {
            try {
                const chunks = normalizeIpInput(ipObj);
                chunks.forEach(chunk => {
                    if (chunk.start === chunk.end) {
                        expandedIps.push(chunk.start);
                    } else {
                        expandedIps.push(`${chunk.start}-${chunk.end}`);
                    }
                });
            } catch (err) {
                console.error(`Error processing IP ${ipObj} in policy ${policy.description}:`, err);
            }
        }

        // Cartesian Product
        for (const ipRes of expandedIps) {
            for (const portObj of policy.portObjects) {
                // Plane A Output
                lines.push(`${policy.description} ${policy.protocol} 0 0 ${ipRes} ${portObj}`);

                // Plane B Output (Interleaved)
                if (policy.enableDualPlane) {
                    let ipResB = "";
                    const { fromPrefix, toPrefix } = dualPlaneConfig;
                    if (ipRes.includes('-')) {
                        const [s, e] = ipRes.split('-');
                        ipResB = `${getDualPlaneIp(s, fromPrefix, toPrefix)}-${getDualPlaneIp(e, fromPrefix, toPrefix)}`;
                    } else {
                        ipResB = getDualPlaneIp(ipRes, fromPrefix, toPrefix);
                    }
                    // Keep same description as requested
                    lines.push(`${policy.description} ${policy.protocol} 0 0 ${ipResB} ${portObj}`);
                }
            }
        }
    }

    return lines.join('\n');
}

export function estimateLineCount(policies: Policy[]): number {
    let count = 0;
    for (const policy of policies) {
        let totalIpChunks = 0;
        for (const ipObj of policy.ipObjects) {
            try {
                const chunks = normalizeIpInput(ipObj);
                totalIpChunks += chunks.length;
            } catch {
                totalIpChunks += 1;
            }
        }
        const totalPorts = policy.portObjects.length;
        let policyLines = (totalIpChunks * totalPorts);

        if (policy.enableDualPlane) {
            policyLines *= 2;
        }

        count += policyLines;
    }
    return count;
}
