import { COMMON_PORTS, type Policy } from '../lib/types';
import { Trash2, ShieldAlert, CheckCircle2, List } from 'lucide-react';
import { MultiInputModal } from './MultiInputModal';
import { useState } from 'react';
import { normalizeIpInput } from '../lib/ip-utils';
import { cn } from '../lib/utils';

interface PolicyRowProps {
    policy: Policy;
    onUpdate: (updated: Policy) => void;
    onDelete: () => void;
    isChecked: boolean;
    onToggleCheck: () => void;
    externalErrors?: string[];   // New optional prop
}

export function PolicyRow({ policy, onUpdate, onDelete, isChecked, onToggleCheck, externalErrors = [] }: PolicyRowProps) {
    const [modalType, setModalType] = useState<'ip' | 'port' | null>(null);

    // Combine local and external errors for display
    const allErrors = [...policy.validationErrors, ...externalErrors];
    const hasErrors = allErrors.length > 0;

    // ... (rest of val code) ...
    // Note: I will only replace the top part and let validatePolicy stay as is, 
    // but I need to replace renderStatus implementation further down.
    // Wait, to minimize complexity, I will just rewrite the renderStatus function logic inline.

    const validatePolicy = (currentIps: string[], currentPorts: string[]): { isValid: boolean, errors: string[] } => {
        // ... (existing implementation) ...
        const errors: string[] = [];
        // 1. Validate IPs
        if (currentIps.length === 0) {
            errors.push("Missing IP Objects");
        } else {
            currentIps.forEach(ip => {
                try {
                    normalizeIpInput(ip);
                } catch (e: any) {
                    errors.push(`Invalid IP: ${ip}`);
                }
            });
        }
        // 2. Validate Ports
        if (currentPorts.length === 0) {
            errors.push("Missing Port Objects");
        } else {
            currentPorts.forEach(port => {
                if (!/^\d+(-\d+)?$/.test(port)) {
                    errors.push(`Invalid Port format: ${port}`);
                    return;
                }
                const parts = port.split('-').map(Number);
                const [start, end] = parts;
                if (start < 0 || start > 65535 || (end !== undefined && (end < 0 || end > 65535))) {
                    errors.push(`Port out of range (0-65535): ${port}`);
                }
                if (end !== undefined && start > end) {
                    errors.push(`Invalid Port range: ${port}`);
                }
            });
        }
        return { isValid: errors.length === 0, errors };
    };

    // ... logic ...

    const handleIpChange = (newIps: string[]) => {
        const { isValid, errors } = validatePolicy(newIps, policy.portObjects);
        onUpdate({
            ...policy,
            ipObjects: newIps,
            isValid,
            validationErrors: errors
        });
    };

    const handlePortChange = (newPorts: string[]) => {
        const { isValid, errors } = validatePolicy(policy.ipObjects, newPorts);
        onUpdate({
            ...policy,
            portObjects: newPorts,
            isValid,
            validationErrors: errors
        });
    };

    const validateIp = (val: string) => {
        try {
            normalizeIpInput(val);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <>
            <tr className={cn("group hover:bg-gray-50 border-b transition-colors", isChecked && "bg-blue-50 hover:bg-blue-100")}>
                {/* ... existing checks/inputs ... */}
                <td className="p-4">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={onToggleCheck}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                </td>
                <td className="p-4">
                    <input
                        type="text"
                        value={policy.description}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\s/g, '');
                            onUpdate({ ...policy, description: val });
                        }}
                        className="w-full bg-transparent outline-none focus:border-b focus:border-blue-500"
                        placeholder="PolicyName(NoSpaces)"
                    />
                </td>
                <td className="p-4">
                    <select
                        value={policy.protocol}
                        onChange={(e) => onUpdate({ ...policy, protocol: e.target.value as 'tcp' | 'udp' })}
                        className="rounded border-gray-200 bg-transparent py-1 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                    </select>
                </td>
                <td className="p-4">
                    <button
                        onClick={() => setModalType('ip')}
                        className={cn(
                            "flex max-w-[200px] items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors text-left",
                            policy.ipObjects.length === 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                        title={policy.ipObjects.join('\n')}
                    >
                        <List className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                            {policy.ipObjects.length === 0
                                ? "0 Objects"
                                : policy.ipObjects.join(', ')}
                        </span>
                    </button>
                </td>
                <td className="p-4">
                    <button
                        onClick={() => setModalType('port')}
                        className={cn(
                            "flex max-w-[200px] items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors text-left",
                            policy.portObjects.length === 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                        title={policy.portObjects.join('\n')}
                    >
                        <List className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                            {policy.portObjects.length === 0
                                ? "0 Objects"
                                : policy.portObjects.join(', ')}
                        </span>
                    </button>
                </td>
                <td className="p-4">
                    {!hasErrors ? (
                        <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    ) : (
                        <div className="group/err relative flex items-center text-red-500">
                            <ShieldAlert className="h-5 w-5 cursor-help" />
                            {/* Improved Tooltip */}
                            <div className="absolute top-1/2 right-full mr-2 hidden w-64 -translate-y-1/2 rounded bg-gray-900 p-3 text-xs text-white shadow-xl group-hover/err:block z-50 text-left">
                                <ul className="list-disc pl-4 space-y-1">
                                    {allErrors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                                {/* Arrow */}
                                <div className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-900"></div>
                            </div>
                        </div>
                    )}
                </td>
                <td className="p-4 text-right">
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-5 w-5" />
                    </button>
                </td>
            </tr>

            <MultiInputModal
                isOpen={modalType === 'ip'}
                onClose={() => setModalType(null)}
                title={`Manage IPs for: ${policy.description}`}
                values={policy.ipObjects}
                onChange={handleIpChange}
                placeholder="192.168.1.1, 10.0.0.0/24, or 1.1.1.1-1.1.1.5"
                validate={validateIp}
            />

            <MultiInputModal
                isOpen={modalType === 'port'}
                onClose={() => setModalType(null)}
                title={`Manage Ports for: ${policy.description}`}
                values={policy.portObjects}
                onChange={handlePortChange}
                suggestions={COMMON_PORTS}
                placeholder="80, 443, or 8000-9000"
                validate={(val) => {
                    const isValidFormat = /^\d+(-\d+)?$/.test(val);
                    if (!isValidFormat) return false;
                    const parts = val.split('-').map(Number);
                    return parts.every(p => p >= 0 && p <= 65535);
                }}
            />
        </>
    );
}
