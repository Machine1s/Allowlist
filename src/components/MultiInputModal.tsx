import { X, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import type { CommonPort } from '../lib/types';

interface MultiInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    values: string[];
    onChange: (newValues: string[]) => void;
    suggestions?: CommonPort[];
    placeholder?: string;
    validate?: (val: string) => boolean;
}

export function MultiInputModal({
    isOpen,
    onClose,
    title,
    values,
    onChange,
    suggestions,
    placeholder = "Add value and press Enter...",
    validate
}: MultiInputModalProps) {
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Tag editing state - Moved up to fix React Hook rules!
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editInput, setEditInput] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (editingIndex !== null && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingIndex]);

    if (!isOpen) return null;

    const handleAdd = () => {
        const val = input.trim();
        if (!val) return;

        if (validate && !validate(val)) {
            setError("Invalid format");
            return;
        }

        if (!values.includes(val)) {
            onChange([...values, val]);
        }
        setInput('');
        setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    const removeValue = (index: number) => {
        const newValues = [...values];
        newValues.splice(index, 1);
        onChange(newValues);
    };



    const handleEditStart = (index: number, val: string) => {
        setEditingIndex(index);
        setEditInput(val);
    };

    const handleEditSave = () => {
        if (editingIndex === null) return;

        const val = editInput.trim();
        if (!val) {
            removeValue(editingIndex);
            setEditingIndex(null);
            return;
        }

        if (validate && !validate(val)) {
            // Maybe show an error for edit too? For now, just shake or alert?
            // Let's reuse the main error or just reset
            alert("Invalid format"); // Simple fallback for now
            return;
        }

        const newValues = [...values];
        newValues[editingIndex] = val;
        onChange(newValues);
        setEditingIndex(null);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditSave();
        } else if (e.key === 'Escape') {
            setEditingIndex(null);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <input
                                ref={inputRef}
                                className={cn(
                                    "w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none",
                                    error ? "border-red-500" : "border-gray-300"
                                )}
                                placeholder={placeholder}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    if (error) setError(null);
                                }}
                                onKeyDown={handleKeyDown}
                            />
                            {error && <span className="absolute right-3 top-2.5 text-xs text-red-500">{error}</span>}
                        </div>
                        <button
                            onClick={handleAdd}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>

                    {suggestions && suggestions.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {suggestions.map((s) => (
                                <button
                                    key={s.label}
                                    onClick={() => !values.includes(s.value) && onChange([...values, s.value])}
                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs hover:border-blue-300 hover:bg-blue-50"
                                >
                                    {s.label} ({s.value})
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-lg border bg-gray-50 p-4">
                        {values.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No items added yet.</p>
                        )}
                        {values.map((val, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-center justify-between gap-1 rounded px-3 py-2 shadow-sm border border-gray-200 bg-white",
                                    editingIndex === idx ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300" : "hover:border-blue-300"
                                )}
                            >
                                {editingIndex === idx ? (
                                    <input
                                        ref={editInputRef}
                                        value={editInput}
                                        onChange={(e) => setEditInput(e.target.value)}
                                        onBlur={handleEditSave}
                                        onKeyDown={handleEditKeyDown}
                                        className="w-full bg-transparent text-sm outline-none font-mono"
                                        autoFocus
                                    />
                                ) : (
                                    <span
                                        className="text-sm font-medium cursor-pointer hover:text-blue-600 w-full font-mono truncate"
                                        onClick={() => handleEditStart(idx, val)}
                                        title="Click to edit"
                                    >
                                        {val}
                                    </span>
                                )}

                                <button
                                    onClick={() => removeValue(idx)}
                                    className="ml-2 text-gray-400 hover:text-red-500 shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
