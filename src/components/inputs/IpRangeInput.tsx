import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IpPartInput } from './IpPartInput';

interface IpRangeInputProps {
    onAdd: (val: string) => void;
    defaultIp?: string;
}

export function IpRangeInput({ onAdd, defaultIp }: IpRangeInputProps) {
    const [start, setStart] = useState(defaultIp || '0.0.0.0');
    // Default end IP usually matches start prefix, but let's just default to same
    const [end, setEnd] = useState(defaultIp || '0.0.0.0');

    const handleAdd = () => {
        onAdd(`${start}-${end}`);
    };

    return (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <IpPartInput value={start} onChange={setStart} defaultValue={defaultIp} />
                <span className="hidden text-gray-400 font-bold sm:inline">-</span>
                <IpPartInput value={end} onChange={setEnd} defaultValue={defaultIp} />
            </div>
            <button
                onClick={handleAdd}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                title="Add Range"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}
