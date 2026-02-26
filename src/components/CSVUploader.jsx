import { useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';

export default function CSVUploader({ onDataLoaded }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        const cleaned = results.data
          .map((row) => {
            // Procura as colunas certas (flexível com nomes)
            const numero =
              row['numero'] || row['Numero'] || row['NUMERO'] || '';
            const website =
              row['website'] || row['Website'] || row['WEBSITE'] || '';
            const nomeEmpresa =
              row['nome empresa'] ||
              row['Nome Empresa'] ||
              row['nome_empresa'] ||
              row['NOME EMPRESA'] ||
              '';

            return {
              numero: numero.trim(),
              website: website.trim(),
              nomeEmpresa: nomeEmpresa.trim(),
            };
          })
          .filter((row) => row.numero || row.nomeEmpresa);

        onDataLoaded(cleaned);
      },
      error: (err) => {
        console.error('Erro ao processar CSV:', err);
        alert('Erro ao processar o ficheiro CSV. Verifique o formato.');
      },
    });

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
            Carregue um ficheiro CSV com as colunas:{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              numero;website;nome empresa
            </code>
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Upload size={18} />
          Carregar CSV
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
