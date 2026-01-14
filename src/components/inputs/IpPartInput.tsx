import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface IpPartInputProps {
    value: string; // "192.168.1.1"
    onChange: (val: string) => void;
    className?: string;
    defaultValue?: string; // "192.168.0.0" from global headers
}

export function IpPartInput({ value, onChange, className, defaultValue }: IpPartInputProps) {
    const [parts, setParts] = useState<string[]>(['', '', '', '']);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Initialize from defaultValue if value is empty
    useEffect(() => {
        if (!value && defaultValue) {
            const defParts = defaultValue.split('.');
            if (defParts.length === 4) {
                setParts(defParts);
                // Trigger change immediately to parent knows the default
                onChange(defaultValue);
            }
        } else if (value) {
            const p = value.split('.');
            if (p.length === 4) setParts(p);
        }
    }, [defaultValue]);

    const handleChange = (index: number, val: string) => {
        // Only allow numbers
        if (val && !/^\d*$/.test(val)) return;
        if (Number(val) > 255) return; // Simple max check

        const newParts = [...parts];
        newParts[index] = val;
        setParts(newParts);

        // Auto-focus next if 3 digits
        if (val.length === 3 && index < 3) {
            inputsRef.current[index + 1]?.focus();
        }

        // Parent callback
        onChange(newParts.map(p => p || '0').join('.'));
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !parts[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === '.') {
            e.preventDefault();
            if (index < 3) inputsRef.current[index + 1]?.focus();
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                    <input
                        ref={el => inputsRef.current[i] = el}
                        value={parts[i]}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-12 rounded border border-gray-300 px-1 py-1 text-center text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                        maxLength={3}
                    />
                    {i < 3 && <span className="text-gray-400 font-bold mx-0.5">.</span>}
                </div>
            ))}
        </div>
    );
}
