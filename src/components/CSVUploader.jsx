import { useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Normaliza um array de objectos "crus" (vindos de CSV ou XLSX)
 * num formato uniforme { numero, website, nomeEmpresa, email }.
 */
function normalizeRows(rawRows) {
  return rawRows
    .map((row) => {
      // Normalizar keys: lowercase + trim
      const norm = {};
      Object.keys(row).forEach((key) => {
        norm[key.trim().toLowerCase()] = String(row[key] ?? '').trim();
      });

      const numero =
        norm['numero'] || norm['número'] || norm['telefone'] || norm['phone'] || norm['tel'] || '';
      const website =
        norm['website'] || norm['site'] || norm['url'] || '';
      const nomeEmpresa =
        norm['nome empresa'] || norm['nome_empresa'] || norm['empresa'] || norm['nome'] || norm['company'] || '';
      const email =
        norm['email'] || norm['e-mail'] || norm['mail'] || '';

      return { numero, website, nomeEmpresa, email };
    })
    .filter((row) => row.numero || row.nomeEmpresa || row.email);
}

export default function CSVUploader({ onDataLoaded }) {
  const fileInputRef = useRef(null);

  // ── Processar CSV (auto-detect delimitador) ──
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      // Sem delimiter → papaparse auto-detecta (, ou ; ou \t)
      complete: (results) => {
        const cleaned = normalizeRows(results.data);
        if (cleaned.length === 0) {
          alert(
            'Nenhum lead encontrado. Verifique se o CSV tem colunas como "numero", "nome empresa", "email".'
          );
          return;
        }
        onDataLoaded(cleaned);
      },
      error: (err) => {
        console.error('Erro ao processar CSV:', err);
        alert('Erro ao processar o ficheiro CSV. Verifique o formato.');
      },
    });
  };

  // ── Processar XLSX / XLS ──
  const parseXLSX = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const cleaned = normalizeRows(rawRows);

        if (cleaned.length === 0) {
          alert(
            'Nenhum lead encontrado. Verifique se a folha tem colunas como "numero", "nome empresa", "email".'
          );
          return;
        }
        onDataLoaded(cleaned);
      } catch (err) {
        console.error('Erro ao processar XLSX:', err);
        alert('Erro ao processar o ficheiro Excel. Verifique o formato.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
      parseCSV(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      parseXLSX(file);
    } else {
      alert('Formato não suportado. Use .csv, .xlsx ou .xls');
    }

    // Reset input para permitir re-upload do mesmo ficheiro
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
          <FileSpreadsheet size={28} className="text-blue-600" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Importar Leads
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Carregue um ficheiro{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              .csv
            </code>{' '}
            ou{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              .xlsx
            </code>{' '}
            com colunas como{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              numero, nome empresa, email, website
            </code>
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Upload size={18} />
          Carregar Ficheiro
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.tsv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
