import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  SkipForward,
  MessageCircle,
  ChevronRight,
  Zap,
  Pause,
  Play,
  Loader2,
} from 'lucide-react';
import {
  generateWhatsAppMessage,
  generateWhatsAppLink,
  cleanPhoneNumber,
  getLeadStatus,
} from '../utils/leadUtils';

export default function SendModal({
  leads,
  templates,
  onClose,
  onMarkSent,
  quickMode = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedMessages, setEditedMessages] = useState({});

  // Quick mode state
  const [quickRunning, setQuickRunning] = useState(false);
  const [quickPaused, setQuickPaused] = useState(false);
  const [quickLog, setQuickLog] = useState([]);
  const [quickDelay, setQuickDelay] = useState(1.5);
  const [quickStarted, setQuickStarted] = useState(false);
  const [wasAborted, setWasAborted] = useState(false);
  const pausedRef = useRef(false);
  const abortRef = useRef(false);
  const logEndRef = useRef(null);

  const currentLead = leads[currentIndex];
  const isFinished = currentIndex >= leads.length;
  const progress =
    leads.length > 0 ? Math.round((currentIndex / leads.length) * 100) : 0;

  // Mensagem gerada para o lead atual
  const generatedMessage = useMemo(() => {
    if (!currentLead) return '';
    return generateWhatsAppMessage(
      currentLead.nomeEmpresa,
      currentLead.website,
      templates
    );
  }, [currentLead, templates]);

  // Mensagem editável (usa a editada se existir, senão a gerada)
  const editableMessage =
    currentLead && editedMessages[currentLead._id] !== undefined
      ? editedMessages[currentLead._id]
      : generatedMessage;

  const setEditableMessage = (msg) => {
    if (!currentLead) return;
    setEditedMessages((prev) => ({ ...prev, [currentLead._id]: msg }));
  };

  // --- Manual mode handlers ---
  const handleSend = () => {
    if (!currentLead) return;
    const link = generateWhatsAppLink(currentLead.numero, editableMessage);
    window.open(link, '_blank');
    onMarkSent(currentLead._id);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  // --- Quick mode ---
  const sleep = (s) =>
    new Promise((resolve) => setTimeout(resolve, s * 1000));

  const waitWhilePaused = useCallback(async () => {
    while (pausedRef.current) {
      await sleep(0.2);
      if (abortRef.current) return;
    }
  }, []);

  const startQuickSend = useCallback(async () => {
    setQuickRunning(true);
    setQuickStarted(true);
    abortRef.current = false;
    pausedRef.current = false;

    for (let i = 0; i < leads.length; i++) {
      if (abortRef.current) break;
      await waitWhilePaused();
      if (abortRef.current) break;

      const lead = leads[i];
      const message = generateWhatsAppMessage(
        lead.nomeEmpresa,
        lead.website,
        templates
      );
      const link = generateWhatsAppLink(lead.numero, message);

      // Open WhatsApp link
      window.open(link, '_blank');
      onMarkSent(lead._id);

      setCurrentIndex(i + 1);
      setQuickLog((prev) => [
        ...prev,
        {
          name: lead.nomeEmpresa || lead.numero,
          phone: cleanPhoneNumber(lead.numero),
          time: new Date().toLocaleTimeString('pt-PT'),
          status: 'sent',
        },
      ]);

      // Wait between sends (except last one)
      if (i < leads.length - 1) {
        await sleep(quickDelay);
      }
    }

    setQuickRunning(false);
  }, [leads, templates, onMarkSent, quickDelay, waitWhilePaused]);

  const handlePauseResume = () => {
    if (quickPaused) {
      pausedRef.current = false;
      setQuickPaused(false);
    } else {
      pausedRef.current = true;
      setQuickPaused(true);
    }
  };

  const handleAbort = () => {
    abortRef.current = true;
    pausedRef.current = false;
    setQuickPaused(false);
    setQuickRunning(false);
    setWasAborted(true);
  };

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [quickLog]);

  // --- Render ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!quickRunning ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                quickMode ? 'bg-amber-100' : 'bg-green-100'
              }`}
            >
              {quickMode ? (
                <Zap size={16} className="text-amber-600" />
              ) : (
                <Send size={16} className="text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {quickMode ? 'Envio Rápido' : 'Sequência de Envio'}
              </h3>
              <p className="text-xs text-gray-500">
                {isFinished
                  ? 'Sequência concluída!'
                  : `Lead ${currentIndex + 1} de ${leads.length}`}
              </p>
            </div>
          </div>
          {!quickRunning && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-full transition-all duration-300 ${
              quickMode ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${isFinished ? 100 : progress}%` }}
          />
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ========== QUICK MODE ========== */}
          {quickMode ? (
            <div className="space-y-4">
              {/* Before start: config */}
              {!quickStarted && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Zap size={18} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          Envio automático de {leads.length} lead
                          {leads.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Cada link wa.me será aberto automaticamente numa nova
                          aba. Pode ser necessário permitir pop-ups no browser.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Intervalo entre envios (segundos)
                    </label>
                    <input
                      type="number"
                      min={0.5}
                      max={10}
                      step={0.5}
                      value={quickDelay}
                      onChange={(e) =>
                        setQuickDelay(Math.max(0.5, parseFloat(e.target.value) || 1.5))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Recomendado: 1.5s — 3s para evitar bloqueio de pop-ups.
                    </p>
                  </div>

                  <button
                    onClick={startQuickSend}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Zap size={16} />
                    Iniciar Envio Rápido
                  </button>
                </div>
              )}

              {/* Running / finished: log */}
              {quickStarted && (
                <div className="space-y-4">
                  {/* Live status */}
                  {quickRunning && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      {quickPaused ? (
                        <Pause size={16} className="text-amber-600" />
                      ) : (
                        <Loader2
                          size={16}
                          className="text-amber-600 animate-spin"
                        />
                      )}
                      <span className="text-sm text-gray-700">
                        {quickPaused
                          ? 'Em pausa…'
                          : `A enviar ${currentIndex + 1} de ${leads.length}…`}
                      </span>
                    </div>
                  )}

                  {/* Log */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Registo de Envios ({quickLog.length}/{leads.length})
                      </p>
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                      {quickLog.map((entry, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-4 py-2"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-green-500 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {entry.name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              +{entry.phone}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">
                            {entry.time}
                          </span>
                        </div>
                      ))}
                      {quickLog.length === 0 && quickRunning && (
                        <div className="px-4 py-6 text-center text-xs text-gray-400">
                          A iniciar envios…
                        </div>
                      )}
                      <div ref={logEndRef} />
                    </div>
                  </div>

                  {/* Controls */}
                  {quickRunning ? (
                    <div className="flex gap-3">
                      <button
                        onClick={handlePauseResume}
                        className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                      >
                        {quickPaused ? (
                          <>
                            <Play size={15} />
                            Retomar
                          </>
                        ) : (
                          <>
                            <Pause size={15} />
                            Pausar
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleAbort}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                      >
                        <X size={15} />
                        Parar
                      </button>
                    </div>
                  ) : (
                    /* Finished */
                    <div className="text-center pt-2">
                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={28} className="text-green-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {wasAborted
                          ? 'Envio interrompido'
                          : 'Envio concluído!'}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {quickLog.length} de {leads.length} mensage
                        {quickLog.length !== 1 ? 'ns enviadas' : 'm enviada'}.
                      </p>
                      <button
                        onClick={onClose}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isFinished ? (
            /* ========== MANUAL MODE — FINISHED ========== */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Tudo enviado!
              </h4>
              <p className="text-sm text-gray-500 mb-6">
                Foram processados {leads.length} lead
                {leads.length !== 1 ? 's' : ''} com sucesso.
              </p>
              <button
                onClick={onClose}
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          ) : (
            /* ========== MANUAL MODE — CURRENT LEAD ========== */
            <div className="space-y-4">
              {/* Lead info card */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {currentLead.nomeEmpresa || '(Sem nome)'}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {currentLead.numero}
                      <span className="text-gray-300 mx-1.5">→</span>
                      <span className="text-blue-600">
                        +{cleanPhoneNumber(currentLead.numero)}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      getLeadStatus(currentLead.website) === 'Com Website'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {getLeadStatus(currentLead.website)}
                  </span>
                </div>
              </div>

              {/* Editable message */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Mensagem (editável antes de enviar)
                </label>
                <textarea
                  value={editableMessage}
                  onChange={(e) => setEditableMessage(e.target.value)}
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Variáveis disponíveis:{' '}
                  <code className="bg-gray-100 px-1 rounded">{'{{nome}}'}</code>{' '}
                  <code className="bg-gray-100 px-1 rounded">
                    {'{{website}}'}
                  </code>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSkip}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  <SkipForward size={15} />
                  Saltar
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  <MessageCircle size={15} />
                  Enviar Atual
                </button>
              </div>

              {/* Upcoming queue */}
              {currentIndex < leads.length - 1 && (
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">
                    Próximos na fila
                  </p>
                  <div className="space-y-1.5">
                    {leads
                      .slice(currentIndex + 1, currentIndex + 4)
                      .map((lead) => (
                        <div
                          key={lead._id}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <ChevronRight size={12} className="text-gray-300" />
                          <span className="truncate">
                            {lead.nomeEmpresa || lead.numero}
                          </span>
                        </div>
                      ))}
                    {leads.length - currentIndex - 1 > 3 && (
                      <p className="text-xs text-gray-400 pl-5">
                        +{leads.length - currentIndex - 4} mais…
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
