import { PolicyRow } from './PolicyRow';
import { Plus, Trash2, Copy } from 'lucide-react';
import type { Policy } from '../lib/types';
import { useMemo } from 'react';

interface PolicyTableProps {
    policies: Policy[];
    setPolicies: (policies: Policy[]) => void;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
}

export function PolicyTable({ policies, setPolicies, selectedIds, setSelectedIds }: PolicyTableProps) {

    // Global Duplicate IP Detection
    // Returns a map: { [policyId]: string[] } (list of error messages)
    const globalValidationErrors = useMemo(() => {
        const ipMap = new Map<string, { id: string, name: string }[]>();
        const errors: Record<string, string[]> = {};

        // 1. Build IP map
        policies.forEach(p => {
            p.ipObjects.forEach(ip => {
                const cleanIp = ip.trim();
                if (!cleanIp) return;

                if (!ipMap.has(cleanIp)) {
                    ipMap.set(cleanIp, []);
                }
                ipMap.get(cleanIp)!.push({ id: p.id, name: p.description || 'Untitled' });
            });
        });

        // 2. Identify duplicates
        ipMap.forEach((occurrences, ip) => {
            if (occurrences.length > 1) {
                // Construct error message
                const policyNames = occurrences.map(o => o.name);

                occurrences.forEach(occ => {
                    if (!errors[occ.id]) errors[occ.id] = [];
                    // Exclude self from list
                    const otherPolicyNames = policyNames.filter(name => name !== occ.name);
                    errors[occ.id].push(`Duplicate IP '${ip}' found in: ${otherPolicyNames.join(', ')}`);
                });
            }
        });

        return errors;
    }, [policies]);

    const handleUpdate = (updated: Policy) => {
        setPolicies(policies.map(p => p.id === updated.id ? updated : p));
    };

    const handleDelete = (id: string) => {
        setPolicies(policies.filter(p => p.id !== id));
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    };

    const handleBulkDelete = () => {
        // Removed confirm dialog to avoid browser blocking issues
        setPolicies(policies.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
    };

    const handleDuplicate = () => {
        if (selectedIds.length === 0) return;

        const newPolicies: Policy[] = [];
        policies.forEach(p => {
            if (selectedIds.includes(p.id)) {
                newPolicies.push({
                    ...p,
                    id: crypto.randomUUID(),
                    description: `${p.description}_copy`,
                    ipObjects: [...p.ipObjects],
                    portObjects: [...p.portObjects],
                    validationErrors: [...p.validationErrors]
                });
            }
        });

        setPolicies([...policies, ...newPolicies]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === policies.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(policies.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const addPolicy = () => {
        const newPolicy: Policy = {
            id: crypto.randomUUID(),
            description: 'New Policy',
            protocol: 'tcp',
            ipObjects: [],
            portObjects: [],
            isValid: false,
            validationErrors: ['No IPs defined', 'No Ports defined']
        };
        setPolicies([newPolicy, ...policies]);
    };

    return (
        <div className="rounded-lg border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Policies ({policies.length})</h2>
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDuplicate}
                                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                                title="Duplicate selected"
                            >
                                <Copy className="h-4 w-4" />
                                <span>Duplicate</span>
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete ({selectedIds.length})</span>
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={addPolicy}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Policy</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50 text-sm uppercase text-gray-500">
                            <th className="w-12 p-4">
                                <input
                                    type="checkbox"
                                    checked={policies.length > 0 && selectedIds.length === policies.length}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            <th className="p-4 font-medium">Policy Description</th>
                            <th className="w-24 p-4 font-medium">Protocol</th>
                            <th className="w-40 p-4 font-medium">IP Objects</th>
                            <th className="w-40 p-4 font-medium">Port Objects</th>
                            <th className="w-24 p-4 font-medium">Status</th>
                            <th className="w-12 p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {policies.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    No policies found. Click "Add Policy" or import a file.
                                </td>
                            </tr>
                        ) : (
                            policies.map(policy => (
                                <PolicyRow
                                    key={policy.id}
                                    policy={policy}
                                    onUpdate={handleUpdate}
                                    onDelete={() => handleDelete(policy.id)}
                                    isChecked={selectedIds.includes(policy.id)}
                                    onToggleCheck={() => toggleSelect(policy.id)}
                                    externalErrors={globalValidationErrors[policy.id]}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
