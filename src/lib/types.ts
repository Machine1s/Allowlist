export interface Policy {
    id: string;
    description: string;
    protocol: 'tcp' | 'udp';
    ipObjects: string[];
    portObjects: string[];
    isValid: boolean;
    validationErrors: string[];
    enableDualPlane?: boolean; // New field for v1.1 AB Network support
}

export interface CommonPort {
    label: string;
    value: string;
}

export const COMMON_PORTS: CommonPort[] = [
    { label: 'HTTP', value: '80' },
    { label: 'HTTPS', value: '443' },
    { label: 'SSH', value: '22' },
    { label: 'RDP', value: '3389' },
    { label: 'SNMP', value: '161' },
    { label: 'Syslog', value: '514' },
    { label: 'High Ports', value: '1024-65535' },
];

export interface RawRule {
    description: string;
    protocol: string;
    ipTuple: string;
    portTuple: string;
}
