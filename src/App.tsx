import { useState, useMemo } from 'react';
import { Upload, FileText, ShieldCheck } from 'lucide-react';
import type { Policy } from './lib/types';
import { PolicyTable } from './components/PolicyTable';
import { parseTxtToPolicies } from './lib/parser';
import { PreviewModal } from './components/PreviewModal';
import { calculateNextSubnet } from './lib/ip-utils';

function App() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Lifted state for Default IP and Mask
  const [defaultIpPrefix, setDefaultIpPrefix] = useState("198.160.0.0");
  const [defaultMask, setDefaultMask] = useState("255.255.0.0");

  // Auto-calculate B-Side Plane default prefixes
  const { fromPrefix: autoMapFrom, toPrefix: autoMapTo } = useMemo(() => {
    return calculateNextSubnet(defaultIpPrefix, defaultMask);
  }, [defaultIpPrefix, defaultMask]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        const parsed = parseTxtToPolicies(text);
        setPolicies(prev => [...prev, ...parsed]);
      }
    };
    reader.readAsText(file);
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
          defaultIpPrefix={defaultIpPrefix}
          setDefaultIpPrefix={setDefaultIpPrefix}
          defaultMask={defaultMask}
          setDefaultMask={setDefaultMask}
        />
      </main>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        policies={policies}
        defaultMapFrom={autoMapFrom}
        defaultMapTo={autoMapTo}
      />
    </div>
  );
}

export default App;
