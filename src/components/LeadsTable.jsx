import {
  Globe,
  GlobeOff,
  MessageCircle,
  ExternalLink,
  Search,
  Send,
  CheckCircle2,
  Settings2,
  ChevronDown,
  ChevronUp,
  Zap,
  Mail,
  MailCheck,
} from 'lucide-react';
import { useState } from 'react';
import {
  getLeadStatus,
  generateWhatsAppMessage,
  generateWhatsAppLink,
  DEFAULT_TEMPLATES,
  DEFAULT_EMAIL_TEMPLATES,
  BUSINESS_TYPES,
  isValidEmail,
} from '../utils/leadUtils';
import SendModal from './SendModal';
import EmailModal from './EmailModal';

export default function LeadsTable({ leads, sentIds, emailSentIds, onMarkSent, onMarkEmailSent }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | com | sem
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalQuickMode, setModalQuickMode] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalQuickMode, setEmailModalQuickMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [businessTypeId, setBusinessTypeId] = useState('generico');
  const [templates, setTemplates] = useState({ ...DEFAULT_TEMPLATES });
  const [emailTemplates, setEmailTemplates] = useState({ ...DEFAULT_EMAIL_TEMPLATES });

  // Ao mudar tipo de negócio, carregar os templates correspondentes
  const handleBusinessTypeChange = (id) => {
    setBusinessTypeId(id);
    const bt = BUSINESS_TYPES.find((b) => b.id === id) || BUSINESS_TYPES[0];
    setTemplates({ ...bt.whatsapp });
    setEmailTemplates({ ...bt.email });
  };

  const filteredLeads = leads.filter((lead) => {
    const status = getLeadStatus(lead.website);
    const matchesSearch =
      lead.nomeEmpresa.toLowerCase().includes(search.toLowerCase()) ||
      lead.numero.includes(search);
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'com' && status === 'Com Website') ||
      (filterStatus === 'sem' && status === 'Sem Website');
    return matchesSearch && matchesFilter;
  });

  const comWebsite = leads.filter(
    (l) => getLeadStatus(l.website) === 'Com Website'
  ).length;
  const semWebsite = leads.length - comWebsite;

  // Seleção
  const allFilteredSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((l) => selectedIds.has(l._id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selectedIds);
      filteredLeads.forEach((l) => next.delete(l._id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredLeads.forEach((l) => next.add(l._id));
      setSelectedIds(next);
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSendWhatsApp = (lead) => {
    const message = generateWhatsAppMessage(
      lead.nomeEmpresa,
      lead.website,
      templates
    );
    const link = generateWhatsAppLink(lead.numero, message);
    window.open(link, '_blank');
    onMarkSent(lead._id);
  };

  const handleStartSequence = () => {
    if (selectedIds.size === 0) return;
    setModalQuickMode(false);
    setShowModal(true);
  };

  const handleStartQuickSend = () => {
    if (selectedIds.size === 0) return;
    setModalQuickMode(true);
    setShowModal(true);
  };

  // Email handlers
  const handleStartEmailSequence = () => {
    if (selectedIds.size === 0) return;
    setEmailModalQuickMode(false);
    setShowEmailModal(true);
  };

  const handleStartEmailQuickSend = () => {
    if (selectedIds.size === 0) return;
    setEmailModalQuickMode(true);
    setShowEmailModal(true);
  };

  const selectedLeads = leads.filter((l) => selectedIds.has(l._id));

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Total
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {leads.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageCircle size={18} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Com Website
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {comWebsite}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Globe size={18} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Sem Website
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {semWebsite}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <GlobeOff size={18} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                WhatsApp
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {sentIds.size}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Send size={18} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Emails
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {emailSentIds.size}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <MailCheck size={18} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Template Editor */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={15} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Templates de Mensagens
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {BUSINESS_TYPES.find((b) => b.id === businessTypeId)?.label || 'Genérico'}
            </span>
          </div>
          {showTemplates ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>

        {showTemplates && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">

            {/* Dropdown tipo de negócio */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tipo de Negócio
              </label>
              <select
                value={businessTypeId}
                onChange={(e) => handleBusinessTypeChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt.id} value={bt.id}>
                    {bt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Ao mudar o tipo, os templates de WhatsApp e Email serão atualizados automaticamente.
              </p>
            </div>

            {/* Separador visual */}
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs font-semibold text-green-700 mb-3 flex items-center gap-1.5">
                <MessageCircle size={13} />
                Templates WhatsApp
              </p>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 mb-1.5">
                <Globe size={12} />
                WhatsApp — Com Website
              </label>
              <textarea
                value={templates.comWebsite}
                onChange={(e) =>
                  setTemplates((t) => ({ ...t, comWebsite: e.target.value }))
                }
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-amber-700 mb-1.5">
                <GlobeOff size={12} />
                WhatsApp — Sem Website
              </label>
              <textarea
                value={templates.semWebsite}
                onChange={(e) =>
                  setTemplates((t) => ({ ...t, semWebsite: e.target.value }))
                }
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Separador — Email */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-1.5">
                <Mail size={13} />
                Templates de Email
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={emailTemplates.subject}
                    onChange={(e) =>
                      setEmailTemplates((t) => ({ ...t, subject: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 mb-1.5">
                    <Globe size={12} />
                    Email — Com Website
                  </label>
                  <textarea
                    value={emailTemplates.comWebsite}
                    onChange={(e) =>
                      setEmailTemplates((t) => ({ ...t, comWebsite: e.target.value }))
                    }
                    rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-amber-700 mb-1.5">
                    <GlobeOff size={12} />
                    Email — Sem Website
                  </label>
                  <textarea
                    value={emailTemplates.semWebsite}
                    onChange={(e) =>
                      setEmailTemplates((t) => ({ ...t, semWebsite: e.target.value }))
                    }
                    rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Botão restaurar */}
            <div className="border-t border-gray-100 pt-3">
              <button
                onClick={() => handleBusinessTypeChange(businessTypeId)}
                className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                Restaurar templates do tipo selecionado
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search, Filter & Bulk Action */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Pesquisar por nome ou número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'com', label: 'Com Website' },
              { key: 'sem', label: 'Sem Website' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                  filterStatus === f.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleStartSequence}
              disabled={selectedIds.size === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedIds.size > 0
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={15} />
              WhatsApp ({selectedIds.size})
            </button>

            <button
              onClick={handleStartQuickSend}
              disabled={selectedIds.size === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedIds.size > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Zap size={15} />
              WA Rápido ({selectedIds.size})
            </button>

            <div className="w-px bg-gray-200 mx-1 self-stretch" />

            <button
              onClick={handleStartEmailSequence}
              disabled={selectedIds.size === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedIds.size > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Mail size={15} />
              Email ({selectedIds.size})
            </button>

            <button
              onClick={handleStartEmailQuickSend}
              disabled={selectedIds.size === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedIds.size > 0
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Zap size={15} />
              Email Rápido ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mensagem
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => {
                const status = getLeadStatus(lead.website);
                const isSent = sentIds.has(lead._id);
                const isEmailSent = emailSentIds.has(lead._id);
                const hasEmail = isValidEmail(lead.email);
                const hasPhone = Boolean(lead.numero && lead.numero.trim());
                const message = generateWhatsAppMessage(
                  lead.nomeEmpresa,
                  lead.website,
                  templates
                );

                return (
                  <tr
                    key={lead._id}
                    className={`transition-colors ${
                      isSent
                        ? 'bg-green-50/40'
                        : selectedIds.has(lead._id)
                        ? 'bg-blue-50/40'
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead._id)}
                        onChange={() => toggleSelect(lead._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Empresa */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isSent && (
                          <CheckCircle2
                            size={14}
                            className="text-green-500 shrink-0"
                          />
                        )}
                        <p
                          className={`text-sm font-medium truncate max-w-[200px] ${
                            isSent ? 'text-green-700' : 'text-gray-900'
                          }`}
                        >
                          {lead.nomeEmpresa || '—'}
                        </p>
                      </div>
                    </td>

                    {/* Telefone */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 font-mono">
                        {lead.numero}
                      </span>
                    </td>

                    {/* Website */}
                    <td className="px-4 py-3">
                      {status === 'Com Website' ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 truncate max-w-[200px]"
                        >
                          <ExternalLink size={13} className="shrink-0" />
                          <span className="truncate">
                            {lead.website
                              .replace(/^https?:\/\//, '')
                              .replace(/\/$/, '')}
                          </span>
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Sem website
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
                          <CheckCircle2 size={12} />
                          Enviado
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                            status === 'Com Website'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {status === 'Com Website' ? (
                            <Globe size={12} />
                          ) : (
                            <GlobeOff size={12} />
                          )}
                          {status}
                        </span>
                      )}
                    </td>

                    {/* Preview Mensagem */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 truncate max-w-65">
                        {hasPhone ? message : hasEmail ? `📧 ${lead.email}` : '—'}
                      </p>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {hasPhone && (
                          <button
                            onClick={() => handleSendWhatsApp(lead)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              isSent
                                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                            title={
                              isSent ? 'Reenviar via WhatsApp' : 'Enviar via WhatsApp'
                            }
                          >
                            <MessageCircle size={13} />
                            {isSent ? 'Re' : 'WA'}
                          </button>
                        )}

                        {hasEmail && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium ${
                              isEmailSent
                                ? 'bg-purple-50 text-purple-400'
                                : 'text-gray-400'
                            }`}
                            title={lead.email}
                          >
                            {isEmailSent ? (
                              <MailCheck size={13} />
                            ) : (
                              <Mail size={13} />
                            )}
                          </span>
                        )}

                        {!hasPhone && !hasEmail && (
                          <span className="text-xs text-gray-300 italic">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="py-12 text-center">
            <Search size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Nenhum lead encontrado com os filtros selecionados.
            </p>
          </div>
        )}
      </div>

      {/* Modal de envio sequencial / rápido (WhatsApp) */}
      {showModal && (
        <SendModal
          leads={selectedLeads}
          templates={templates}
          onClose={() => setShowModal(false)}
          onMarkSent={onMarkSent}
          quickMode={modalQuickMode}
        />
      )}

      {/* Modal de envio de emails */}
      {showEmailModal && (
        <EmailModal
          leads={selectedLeads}
          emailTemplates={emailTemplates}
          onClose={() => setShowEmailModal(false)}
          onMarkEmailSent={onMarkEmailSent}
          quickMode={emailModalQuickMode}
        />
      )}
    </div>
  );
}
