import { useState, useMemo } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  SkipForward,
  MessageCircle,
  ChevronRight,
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
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedMessages, setEditedMessages] = useState({});

  const currentLead = leads[currentIndex];
  const isFinished = currentIndex >= leads.length;
  const progress = leads.length > 0 ? Math.round((currentIndex / leads.length) * 100) : 0;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <Send size={16} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Sequência de Envio
              </h3>
              <p className="text-xs text-gray-500">
                {isFinished
                  ? 'Sequência concluída!'
                  : `Lead ${currentIndex + 1} de ${leads.length}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${isFinished ? 100 : progress}%` }}
          />
        </div>

        {/* Body */}
        <div className="p-6">
          {isFinished ? (
            /* Finished state */
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
            /* Current lead */
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
                  <code className="bg-gray-100 px-1 rounded">{'{{website}}'}</code>
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
