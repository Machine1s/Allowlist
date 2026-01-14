import { X, Plus, Save, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import type { CommonPort } from '../lib/types';
import { IpCidrInput } from './inputs/IpCidrInput';
import { IpRangeInput } from './inputs/IpRangeInput';

interface MultiInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    values: string[];
    onChange: (newValues: string[]) => void;
    suggestions?: CommonPort[];
    placeholder?: string;
    validate?: (val: string) => boolean;
    storageKey?: string; // Key for localStorage to save custom presets
    defaultIpPrefix?: string;
    variant?: 'simple' | 'ip-advanced';
}

export function MultiInputModal({
    isOpen,
    onClose,
    title,
    values,
    onChange,
    suggestions = [],
    placeholder = "Add value and press Enter...",
    validate,
    storageKey,
    defaultIpPrefix,
    variant = 'simple'
}: MultiInputModalProps) {
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Custom Presets
    const [customPresets, setCustomPresets] = useState<CommonPort[]>([]);

    // Tag editing state
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editInput, setEditInput] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    // Load custom presets
    useEffect(() => {
        if (isOpen && storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    setCustomPresets(JSON.parse(saved));
                }
            } catch (e) {
                console.error("Failed to load presets", e);
            }
        }
    }, [isOpen, storageKey]);

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

    const handleSavePreset = () => {
        if (!input.trim() || !storageKey) return;
        const val = input.trim();

        if (validate && !validate(val)) {
            setError("Invalid format");
            return;
        }

        if (customPresets.some(p => p.value === val)) {
            // Already exists, just ignore
            return;
        }

        const newPresets = [...customPresets, { label: val, value: val }];
        setCustomPresets(newPresets);
        localStorage.setItem(storageKey, JSON.stringify(newPresets));
    };

    const handleDeletePreset = (valToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!storageKey) return;
        const newPresets = customPresets.filter(p => p.value !== valToDelete);
        setCustomPresets(newPresets);
        localStorage.setItem(storageKey, JSON.stringify(newPresets));
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
            alert("Invalid format");
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

    // Sort values for display (optional, but requested for Ports)
    // We render based on 'values' prop order, but user requested sorting.
    // However, if we sort here, indices for removeValue mismatch if values isn't sorted in parent.
    // We already implemented sorting in parent (PolicyRow), so values should be sorted coming in.

    const allSuggestions = [...customPresets, ...suggestions];

    const handleAdvancedAdd = (newVal: string) => {
        if (!values.includes(newVal)) {
            onChange([...values, newVal]);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {variant === 'ip-advanced' && (
                        <div className="mb-4 flex flex-col gap-2 border-b border-gray-100 pb-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Advanced Input
                            </p>
                            <IpCidrInput onAdd={handleAdvancedAdd} defaultIp={defaultIpPrefix} />
                            <IpRangeInput onAdd={handleAdvancedAdd} defaultIp={defaultIpPrefix} />
                        </div>
                    )}
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
                        {storageKey && input && (
                            <button
                                onClick={handleSavePreset}
                                className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                                title="Save as Custom Preset"
                            >
                                <Save className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={handleAdd}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            title="Add to List"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>

                    {allSuggestions.length > 0 && (
                        <div className="mb-4">
                            <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Suggestions & Presets
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allSuggestions.map((s, idx) => {
                                    const isCustom = idx < customPresets.length;
                                    return (
                                        <div
                                            key={`${s.value}-${idx}`}
                                            className="relative group inline-flex"
                                        >
                                            <button
                                                onClick={() => !values.includes(s.value) && onChange([...values, s.value])}
                                                className={cn(
                                                    "rounded-full border px-3 py-1 text-xs hover:border-blue-300 hover:bg-blue-50 transition-colors",
                                                    isCustom ? "border-green-200 bg-green-50 text-green-800" : "border-gray-200 bg-gray-50"
                                                )}
                                            >
                                                {s.label === s.value ? s.value : `${s.label} (${s.value})`}
                                            </button>
                                            {isCustom && (
                                                <button
                                                    onClick={(e) => handleDeletePreset(s.value, e)}
                                                    className="absolute -top-1 -right-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-sm group-hover:flex hover:bg-red-600"
                                                    title="Remove Preset"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
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
