import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IpPartInput } from './IpPartInput';

interface IpCidrInputProps {
    onAdd: (val: string) => void;
    defaultIp?: string;
}

export function IpCidrInput({ onAdd, defaultIp }: IpCidrInputProps) {
    const [ip, setIp] = useState(defaultIp || '0.0.0.0');
    const [mask, setMask] = useState('24');

    const handleAdd = () => {
        onAdd(`${ip}/${mask}`);
    };

    return (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center gap-2">
                <IpPartInput value={ip} onChange={setIp} defaultValue={defaultIp} />
                <span className="text-gray-500 font-bold">/</span>
                <input
                    className="w-10 rounded border border-gray-300 px-1 py-1 text-center text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={mask}
                    onChange={e => setMask(e.target.value)}
                    maxLength={2}
                />
            </div>
            <button
                onClick={handleAdd}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                title="Add CIDR"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}
