import { useState } from 'react';
import { Upload, FileText, ShieldCheck } from 'lucide-react';
import type { Policy } from './lib/types';
import { PolicyTable } from './components/PolicyTable';
import { parseTxtToPolicies } from './lib/parser';
import { PreviewModal } from './components/PreviewModal';

function App() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        const parsed = parseTxtToPolicies(text);
        // Append to existing or replace? Let's append to be safe, user can clear if needed.
        // Actually for a generator, usually we start fresh or append. Let's append.
        setPolicies(prev => [...prev, ...parsed]);
        // create a toast or alert?
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Allowlist Generator</h1>
          </div>

          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Import .txt
              <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
            </label>

            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
              disabled={policies.length === 0}
            >
              <FileText className="w-4 h-4" />
              Preview & Export
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Configuration Policies</h2>
          <p className="text-gray-500">Manage your network whitelist policies here. Add ranges, ports, and let the tool handle the complexity.</p>
        </div>

        <PolicyTable
          policies={policies}
          setPolicies={setPolicies}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </main>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        policies={policies}
      />
    </div>
  );
}

export default App;
