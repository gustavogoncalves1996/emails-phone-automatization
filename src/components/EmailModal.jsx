import { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pause,
  Play,
  Square,
  ChevronRight,
  SkipForward,
} from 'lucide-react';
import {
  generateEmailBody,
  generateEmailSubject,
  generateEmailHTML,
  isValidEmail,
} from '../utils/leadUtils';

const API_URL = 'http://localhost:3001';

export default function EmailModal({
  leads,
  emailTemplates,
  onClose,
  onMarkEmailSent,
  quickMode = false,
}) {
  // ── Estado partilhado ──
  const [currentIndex, setCurrentIndex] = useState(0);
  const [log, setLog] = useState([]);
  const [finished, setFinished] = useState(false);

  // ── Estado modo manual ──
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  // ── Estado modo rápido ──
  const [quickStarted, setQuickStarted] = useState(false);
  const [quickDelay, setQuickDelay] = useState(3);
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);
  const [wasAborted, setWasAborted] = useState(false);

  const currentLead = leads[currentIndex];

  // Atualizar subject/body quando muda o lead (modo manual)
  useEffect(() => {
    if (!quickMode && currentLead) {
      setSubject(generateEmailSubject(currentLead.nomeEmpresa, emailTemplates));
      setBody(
        generateEmailBody(
          currentLead.nomeEmpresa,
          currentLead.website,
          emailTemplates
        )
      );
    }
  }, [currentIndex, currentLead, emailTemplates, quickMode]);

  // ── Enviar um email via API ──
  const sendEmail = async (lead, customSubject, customBody) => {
    const subj = customSubject || generateEmailSubject(lead.nomeEmpresa, emailTemplates);
    const bodyHtml = customBody || generateEmailBody(lead.nomeEmpresa, lead.website, emailTemplates);
    const html = generateEmailHTML(bodyHtml);

    const res = await fetch(`${API_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: lead.email,
        subject: subj,
        html,
        nomeEmpresa: lead.nomeEmpresa,
      }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Erro desconhecido');
    return data;
  };

  // ── Modo Manual: enviar atual ──
  const handleSendCurrent = async () => {
    if (!currentLead) return;
    setSending(true);

    try {
      await sendEmail(currentLead, subject, body);
      onMarkEmailSent(currentLead._id);
      setLog((prev) => [
        ...prev,
        { name: currentLead.nomeEmpresa, email: currentLead.email, ok: true },
      ]);
    } catch (err) {
      setLog((prev) => [
        ...prev,
        {
          name: currentLead.nomeEmpresa,
          email: currentLead.email,
          ok: false,
          error: err.message,
        },
      ]);
    }

    setSending(false);

    if (currentIndex + 1 < leads.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  // ── Modo Manual: saltar ──
  const handleSkip = () => {
    setLog((prev) => [
      ...prev,
      {
        name: currentLead?.nomeEmpresa,
        email: currentLead?.email,
        ok: null,
        skipped: true,
      },
    ]);
    if (currentIndex + 1 < leads.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  // ── Modo Rápido: loop automático ──
  const runQuickSend = async () => {
    setQuickStarted(true);
    abortRef.current = false;
    pauseRef.current = false;

    for (let i = 0; i < leads.length; i++) {
      if (abortRef.current) break;

      // Pausa
      while (pauseRef.current && !abortRef.current) {
        await new Promise((r) => setTimeout(r, 300));
      }
      if (abortRef.current) break;

      const lead = leads[i];
      setCurrentIndex(i);

      if (!isValidEmail(lead.email)) {
        setLog((prev) => [
          ...prev,
          {
            name: lead.nomeEmpresa,
            email: lead.email || '—',
            ok: false,
            error: 'Email inválido',
          },
        ]);
        continue;
      }

      try {
        await sendEmail(lead);
        onMarkEmailSent(lead._id);
        setLog((prev) => [
          ...prev,
          { name: lead.nomeEmpresa, email: lead.email, ok: true },
        ]);
      } catch (err) {
        setLog((prev) => [
          ...prev,
          {
            name: lead.nomeEmpresa,
            email: lead.email,
            ok: false,
            error: err.message,
          },
        ]);
      }

      // Delay entre envios
      if (i < leads.length - 1) {
        await new Promise((r) => setTimeout(r, quickDelay * 1000));
      }
    }

    setFinished(true);
  };

  const handlePauseResume = () => {
    pauseRef.current = !pauseRef.current;
    setPaused(pauseRef.current);
  };

  const handleAbort = () => {
    abortRef.current = true;
    pauseRef.current = false;
    setPaused(false);
    setWasAborted(true);
    setFinished(true);
  };

  // Contadores
  const sentOk = log.filter((l) => l.ok === true).length;
  const sentFail = log.filter((l) => l.ok === false).length;
  const skipped = log.filter((l) => l.skipped).length;

  // Leads sem email válido
  const validLeads = leads.filter((l) => isValidEmail(l.email));
  const invalidCount = leads.length - validLeads.length;

  // ════════════════════════════════════════════
  // ══ RENDER: Ecrã de conclusão ═══════════════
  // ════════════════════════════════════════════
  if (finished) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail size={20} className="text-blue-600" />
              Envio de Emails — Concluído
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Resumo */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{sentOk}</p>
                <p className="text-xs text-green-700">Enviados</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{sentFail}</p>
                <p className="text-xs text-red-700">Erros</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-600">{skipped}</p>
                <p className="text-xs text-gray-700">Saltados</p>
              </div>
            </div>

            {wasAborted && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                Envio interrompido manualmente.
              </div>
            )}

            {/* Log */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    entry.ok === true
                      ? 'bg-green-50 text-green-700'
                      : entry.skipped
                      ? 'bg-gray-50 text-gray-500'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {entry.ok === true ? (
                    <CheckCircle2 size={13} />
                  ) : entry.skipped ? (
                    <SkipForward size={13} />
                  ) : (
                    <AlertCircle size={13} />
                  )}
                  <span className="font-medium truncate">{entry.name}</span>
                  <span className="text-gray-400 truncate">({entry.email})</span>
                  {entry.error && (
                    <span className="ml-auto text-red-500 truncate">
                      {entry.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // ══ RENDER: Modo Rápido ═════════════════════
  // ════════════════════════════════════════════
  if (quickMode) {
    // Ecrã de configuração antes de arrancar
    if (!quickStarted) {
      return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Mail size={20} className="text-purple-600" />
                Envio Rápido de Emails
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-purple-50 rounded-lg p-4 text-sm text-purple-800">
                <p className="font-medium">
                  {validLeads.length} email{validLeads.length !== 1 ? 's' : ''}{' '}
                  será(ão) enviado(s) automaticamente.
                </p>
                {invalidCount > 0 && (
                  <p className="text-xs text-purple-600 mt-1">
                    ⚠️ {invalidCount} lead{invalidCount !== 1 ? 's' : ''} sem
                    email válido — será(ão) ignorado(s).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo entre envios (segundos)
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={quickDelay}
                  onChange={(e) => setQuickDelay(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-center text-sm font-mono text-gray-600 mt-1">
                  {quickDelay}s
                </p>
              </div>

              <button
                onClick={runQuickSend}
                disabled={validLeads.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Iniciar Envio
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Ecrã de progresso
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail size={20} className="text-purple-600" />
              A enviar emails...
            </h2>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Barra de progresso */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  {log.length} / {leads.length}
                </span>
                <span>{Math.round((log.length / leads.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(log.length / leads.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Controlos */}
            <div className="flex gap-2">
              <button
                onClick={handlePauseResume}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                {paused ? (
                  <>
                    <Play size={15} /> Continuar
                  </>
                ) : (
                  <>
                    <Pause size={15} /> Pausar
                  </>
                )}
              </button>
              <button
                onClick={handleAbort}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-red-50 hover:bg-red-100 text-red-700"
              >
                <Square size={15} /> Parar
              </button>
            </div>

            {/* Log live */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    entry.ok
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {entry.ok ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <AlertCircle size={13} />
                  )}
                  <span className="font-medium truncate">{entry.name}</span>
                  <span className="text-gray-400 truncate">({entry.email})</span>
                  {entry.error && (
                    <span className="ml-auto text-red-500 truncate">
                      {entry.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // ══ RENDER: Modo Manual (sequência) ═════════
  // ════════════════════════════════════════════
  if (!currentLead) return null;

  const hasEmail = isValidEmail(currentLead.email);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail size={20} className="text-blue-600" />
              Enviar Email
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentIndex + 1} de {leads.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Lead info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              {currentLead.nomeEmpresa || '—'}
            </p>
            <p className="text-xs text-gray-500">
              📧 {currentLead.email || 'Sem email'}
            </p>
            {currentLead.website && (
              <p className="text-xs text-gray-500">
                🌐 {currentLead.website}
              </p>
            )}
          </div>

          {!hasEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle size={16} />
              Este lead não tem um email válido.
            </div>
          )}

          {/* Assunto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Assunto
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Corpo (HTML editável) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Corpo do email (HTML)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Log de envios anteriores */}
          {log.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Histórico:</p>
              {log.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded ${
                    entry.ok === true
                      ? 'bg-green-50 text-green-700'
                      : entry.skipped
                      ? 'bg-gray-50 text-gray-500'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {entry.ok === true ? (
                    <CheckCircle2 size={12} />
                  ) : entry.skipped ? (
                    <SkipForward size={12} />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Próximos na fila */}
          {currentIndex + 1 < leads.length && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-400 mb-1.5">
                Próximos:
              </p>
              <div className="space-y-1">
                {leads.slice(currentIndex + 1, currentIndex + 4).map((l) => (
                  <div
                    key={l._id}
                    className="flex items-center gap-1.5 text-xs text-gray-500"
                  >
                    <ChevronRight size={12} className="text-gray-300" />
                    <span className="truncate">{l.nomeEmpresa}</span>
                    <span className="text-gray-300">—</span>
                    <span className="text-gray-400 truncate">
                      {l.email || 'sem email'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acções */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <SkipForward size={15} />
            Saltar
          </button>
          <button
            onClick={handleSendCurrent}
            disabled={!hasEmail || sending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 size={15} className="animate-spin" /> A enviar...
              </>
            ) : (
              <>
                <Send size={15} /> Enviar Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
