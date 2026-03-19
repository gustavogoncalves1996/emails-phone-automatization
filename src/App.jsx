import { useState, useCallback } from 'react';
import Header from './components/Header';
import CSVUploader from './components/CSVUploader';
import LeadsTable from './components/LeadsTable';
import { getLeadStatus } from './utils/leadUtils';

function App() {
  const [leads, setLeads] = useState([]);
  const [sentIds, setSentIds] = useState(new Set());
  const [emailSentIds, setEmailSentIds] = useState(new Set());

  // Adiciona _id único a cada lead ao carregar CSV
  const handleDataLoaded = useCallback((data) => {
    const withIds = data.map((row, idx) => ({
      ...row,
      _id: `lead_${idx}_${Date.now()}`,
    }));
    setLeads(withIds);
    setSentIds(new Set());
    setEmailSentIds(new Set());
  }, []);

  const handleMarkSent = useCallback((id) => {
    setSentIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleMarkEmailSent = useCallback((id) => {
    setEmailSentIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const semSiteCount = leads.filter(
    (l) => getLeadStatus(l.website) === 'Sem Website'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        leadsCount={leads.length}
        semSiteCount={semSiteCount}
        enviadosCount={sentIds.size}
        emailEnviadosCount={emailSentIds.size}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <CSVUploader onDataLoaded={handleDataLoaded} />

          {leads.length > 0 && (
            <LeadsTable
              leads={leads}
              sentIds={sentIds}
              emailSentIds={emailSentIds}
              onMarkSent={handleMarkSent}
              onMarkEmailSent={handleMarkEmailSent}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()}{' '}
            <a
              href="https://webdevportugal.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              WebDev Portugal
            </a>{' '}
            — Ferramenta interna de prospeção
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
