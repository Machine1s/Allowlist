import { X, Copy, Download, AlertTriangle } from 'lucide-react';
import type { Policy } from '../lib/types';
import { generateTxtFromPolicies, estimateLineCount } from '../lib/parser';
import { useMemo, useState } from 'react';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    policies: Policy[];
}

export function PreviewModal({ isOpen, onClose, policies }: PreviewModalProps) {
    const [confirmed, setConfirmed] = useState(false);

    // Reset confirmed when opening
    useMemo(() => {
        if (!isOpen) setConfirmed(false);
    }, [isOpen]);

    const estimatedLines = useMemo(() => estimateLineCount(policies), [policies]);
    const isLarge = estimatedLines > 1000;

    const content = useMemo(() => {
        if (isLarge && !confirmed) return "";
        return generateTxtFromPolicies(policies);
    }, [policies, isLarge, confirmed]);

    if (!isOpen) return null;

    const handleDownload = () => {
        if (!content) return;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'out_reach.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (content) {
            navigator.clipboard.writeText(content);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-900">Preview Configuration</h3>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative flex-1 bg-gray-50 p-6">
                    {isLarge && !confirmed ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                            <div className="rounded-full bg-yellow-100 p-4">
                                <AlertTriangle className="h-10 w-10 text-yellow-600" />
                            </div>
                            <h4 className="text-xl font-semibold">Large Output Warning</h4>
                            <p className="max-w-md text-gray-500">
                                This configuration will generate approximately <strong>{estimatedLines}</strong> lines of rules.
                                Generating this preview might take a moment.
                            </p>
                            <button
                                onClick={() => setConfirmed(true)}
                                className="rounded-lg bg-yellow-600 px-6 py-2 text-white hover:bg-yellow-700"
                            >
                                Generate Anyway
                            </button>
                        </div>
                    ) : (
                        <textarea
                            readOnly
                            className="h-full w-full resize-none rounded-lg border p-4 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-blue-500"
                            value={content}
                        />
                    )}
                </div>

                <div className="flex items-center justify-between border-t px-6 py-4">
                    <span className="text-sm text-gray-500">
                        {content ? `${content.split('\n').length} lines generated` : 'Waiting to generate...'}
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCopy}
                            disabled={!content}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Copy className="h-4 w-4" />
                            Copy to Clipboard
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!content}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            Download .txt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
