/**
 * Limpa o número de telefone, removendo espaços, caracteres não numéricos
 * e adicionando prefixo 351 (Portugal) se não o tiver.
 * Ex: '910 326 178' → '351910326178'
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('351')) return cleaned;
  return `351${cleaned}`;
}

/**
 * Valida se o website é válido (não vazio, não Facebook, não Google)
 */
export function hasValidWebsite(website) {
  if (!website || website.trim() === '') return false;
  const lower = website.toLowerCase();
  if (lower.includes('facebook') || lower.includes('google')) return false;
  return true;
}

/**
 * Determina o status do lead baseado no website
 */
export function getLeadStatus(website) {
  return hasValidWebsite(website) ? 'Com Website' : 'Sem Website';
}

/**
 * Templates por defeito (PT-PT) com variáveis {{nome}} e {{website}}
 */
export const DEFAULT_TEMPLATES = {
  comWebsite:
    'Olá {{nome}}! Vi o vosso site e notei que a WebDev Portugal pode ajudar a melhorar o vosso SEO e velocidade para atraírem mais clientes de limpezas. Podemos conversar?',
  semWebsite:
    'Olá {{nome}}! Notei que a vossa empresa de limpezas ainda não tem um site profissional. Na WebDev Portugal ajudamos negócios a criarem uma montra digital que vende 24/7. Têm interesse em saber como?',
};

/**
 * Substitui variáveis {{nome}} e {{website}} no template
 */
export function applyTemplate(template, nomeEmpresa, website) {
  const nome = nomeEmpresa || 'equipa';
  const site = website || '';
  return template
    .replace(/\{\{nome\}\}/gi, nome)
    .replace(/\{\{website\}\}/gi, site);
}

/**
 * Gera a mensagem WhatsApp personalizada (PT-PT) a partir dos templates
 */
export function generateWhatsAppMessage(nomeEmpresa, website, templates) {
  const t = templates || DEFAULT_TEMPLATES;
  const template = hasValidWebsite(website) ? t.comWebsite : t.semWebsite;
  return applyTemplate(template, nomeEmpresa, website);
}

/**
 * Gera o link wa.me para abrir WhatsApp
 */
export function generateWhatsAppLink(phone, message) {
  const cleanedPhone = cleanPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
}
