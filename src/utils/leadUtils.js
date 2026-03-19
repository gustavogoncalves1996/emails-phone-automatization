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
    'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Visitei o vosso website e identifiquei oportunidades de melhoria na vossa presença digital. Desenvolvemos landing pages profissionais a partir de 499€, com design moderno, otimização SEO e formulários de contacto. Poderão consultar os nossos planos em https://webdevportugal.com/. Teriam disponibilidade para uma breve conversa?',
  semWebsite:
    'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Reparei que a vossa empresa ainda não dispõe de uma página web profissional. Atualmente, a maioria dos clientes pesquisa online antes de contratar qualquer serviço. Desenvolvemos landing pages profissionais a partir de 499€, com design moderno, otimização para Google e formulários de contacto. Poderão consultar os nossos planos em https://webdevportugal.com/. Teriam interesse em saber mais?',
};

/**
 * Templates por tipo de negócio — WhatsApp (comWebsite / semWebsite) + Email (subject, comWebsite, semWebsite)
 * Tom formal, foco no plano inicial de 499€, link para https://webdevportugal.com/
 */
export const BUSINESS_TYPES = [
  {
    id: 'generico',
    label: '🏢 Genérico',
    whatsapp: { ...DEFAULT_TEMPLATES },
    email: {
      subject: 'Proposta de desenvolvimento web para {{nome}} — WebDev Portugal',
      comWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tive oportunidade de visitar o vosso website <a href="{{website}}">{{website}}</a> e identifiquei diversas oportunidades para potenciar a vossa presença digital e atrair mais clientes.

Na WebDev Portugal, desenvolvemos <strong>landing pages profissionais, modernas e interativas</strong>, pensadas para converter visitantes em clientes.

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design moderno e 100% responsivo (telemóvel, tablet e desktop)
• Otimização para motores de busca (SEO)
• Formulários de contacto integrados
• Velocidade de carregamento otimizada
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos e detalhes em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para esclarecer qualquer questão ou agendar uma breve reunião sem compromisso.

Com os melhores cumprimentos,`,
      semWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tomei conhecimento da vossa empresa <strong>{{nome}}</strong> e constatei que ainda não dispõem de uma página web profissional. Atualmente, <strong>mais de 80% dos consumidores pesquisam online antes de contratar um serviço</strong> — uma presença digital é fundamental para qualquer negócio.

Na WebDev Portugal, desenvolvemos <strong>landing pages profissionais, modernas e interativas</strong>, pensadas para apresentar os vossos serviços e converter visitantes em clientes.

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design moderno e 100% responsivo
• Otimização para motores de busca (SEO)
• Formulários de contacto integrados
• Velocidade de carregamento otimizada
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos e detalhes em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para esclarecer qualquer questão ou agendar uma breve reunião sem compromisso.

Com os melhores cumprimentos,`,
    },
  },
  {
    id: 'limpezas',
    label: '🧹 Limpezas',
    whatsapp: {
      comWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Visitei o vosso website e identifiquei oportunidades para atrair mais clientes de limpezas através de uma landing page otimizada. O nosso plano inicial é de 499€ e inclui design profissional, SEO local e formulários de orçamento. Consultem os nossos planos em https://webdevportugal.com/. Teriam disponibilidade para conversar?',
      semWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Reparei que a vossa empresa de limpezas ainda não dispõe de uma página web. Muitos clientes pesquisam "empresa de limpezas perto de mim" no Google — sem presença online, estão a perder esses contactos. Desenvolvemos landing pages profissionais a partir de 499€. Consultem os nossos planos em https://webdevportugal.com/. Teriam interesse?',
    },
    email: {
      subject: 'Proposta de presença digital para {{nome}} — WebDev Portugal',
      comWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tive oportunidade de visitar o vosso website <a href="{{website}}">{{website}}</a>. Sabemos que o setor das limpezas é bastante competitivo e que uma presença digital forte pode fazer toda a diferença na captação de novos clientes.

Desenvolvemos <strong>landing pages especializadas para empresas de limpezas</strong>, com funcionalidades pensadas para o vosso negócio:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design moderno e 100% responsivo
• Secção de serviços (limpeza doméstica, comercial, pós-obra, etc.)
• Formulário de pedido de orçamento integrado
• Otimização para pesquisas locais (SEO local)
• Galeria de trabalhos realizados
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para esclarecer qualquer questão ou agendar uma reunião sem compromisso.

Com os melhores cumprimentos,`,
      semWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tomei conhecimento da vossa empresa <strong>{{nome}}</strong> e verifiquei que ainda não dispõem de uma página web. No setor das limpezas, <strong>a maioria dos clientes pesquisa "empresa de limpezas perto de mim" no Google</strong> — sem presença online, esses contactos são perdidos para a concorrência.

Desenvolvemos <strong>landing pages profissionais para empresas de limpezas</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design moderno e 100% responsivo
• Apresentação dos vossos serviços (doméstico, comercial, pós-obra)
• Formulário de pedido de orçamento 24h/dia
• Otimização para pesquisas locais no Google
• Galeria de trabalhos realizados
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para esclarecer qualquer questão.

Com os melhores cumprimentos,`,
    },
  },
  {
    id: 'barbearias',
    label: '💈 Barbearias',
    whatsapp: {
      comWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Visitei o vosso website e acredito que uma landing page moderna com galeria de trabalhos e sistema de marcações pode potenciar significativamente o vosso negócio. O nosso plano inicial é de 499€. Consultem os detalhes em https://webdevportugal.com/. Teriam disponibilidade para conversar?',
      semWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Atualmente, muitos clientes procuram barbearias online antes de marcar. Uma landing page profissional com galeria de cortes e marcações online pode fazer toda a diferença. Desenvolvemos estas páginas a partir de 499€. Consultem os nossos planos em https://webdevportugal.com/. Teriam interesse?',
    },
    email: {
      subject: 'Proposta de presença digital para {{nome}} — WebDev Portugal',
      comWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tive oportunidade de visitar o vosso website <a href="{{website}}">{{website}}</a>. No mundo das barbearias, a imagem e a apresentação são fundamentais — e a vossa presença digital deve refletir essa mesma qualidade.

Desenvolvemos <strong>landing pages especializadas para barbearias</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design moderno e elegante, adequado à vossa identidade
• Galeria de cortes e estilos (portfolio visual)
• Integração com sistema de marcações online
• Apresentação da equipa e preçário
• Otimização para pesquisas locais (SEO)
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer esclarecimento.

Com os melhores cumprimentos,`,
      semWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tomei conhecimento da vossa barbearia <strong>{{nome}}</strong> e verifiquei que ainda não dispõem de uma página web profissional. Atualmente, <strong>muitos clientes pesquisam "barbearia perto de mim" no Google</strong> antes de marcar — sem presença online, estão a perder marcações diariamente.

Desenvolvemos <strong>landing pages profissionais para barbearias</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design moderno e com a vossa identidade
• Portfolio de cortes e estilos
• Sistema de marcações online integrado
• Preçário e apresentação da equipa
• Otimização para pesquisas locais
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para esclarecer qualquer questão.

Com os melhores cumprimentos,`,
    },
  },
  {
    id: 'estetica',
    label: '💅 Estética',
    whatsapp: {
      comWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Visitei o vosso website e acredito que uma landing page elegante com galeria de tratamentos e marcações online pode atrair mais clientes ao vosso centro de estética. O nosso plano inicial é de 499€. Consultem os detalhes em https://webdevportugal.com/. Teriam disponibilidade para conversar?',
      semWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Reparei que o vosso centro de estética ainda não dispõe de uma página web profissional. A maioria das clientes pesquisa tratamentos online antes de marcar. Desenvolvemos landing pages elegantes a partir de 499€. Consultem os nossos planos em https://webdevportugal.com/. Teriam interesse?',
    },
    email: {
      subject: 'Proposta de presença digital para {{nome}} — WebDev Portugal',
      comWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tive oportunidade de visitar o vosso website <a href="{{website}}">{{website}}</a>. No setor da estética, a elegância e a confiança transmitidas online são determinantes na decisão das clientes.

Desenvolvemos <strong>landing pages especializadas para centros de estética</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design sofisticado e 100% responsivo
• Galeria de tratamentos e resultados
• Menu de serviços elegante (facial, corporal, unhas, depilação)
• Integração com sistema de marcações online
• Otimização para pesquisas locais (SEO)
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer esclarecimento.

Com os melhores cumprimentos,`,
      semWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tomei conhecimento do vosso centro de estética <strong>{{nome}}</strong> e verifiquei que ainda não dispõem de uma página web profissional. Atualmente, <strong>a maioria das clientes pesquisa tratamentos de estética online</strong> antes de efetuar uma marcação.

Desenvolvemos <strong>landing pages elegantes para centros de estética</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design sofisticado e responsivo
• Galeria de tratamentos e resultados
• Menu de serviços (facial, corporal, unhas, massagens)
• Sistema de marcações online
• Otimização para pesquisas locais no Google
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer questão.

Com os melhores cumprimentos,`,
    },
  },
  {
    id: 'clinicas',
    label: '🏥 Clínicas',
    whatsapp: {
      comWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Visitei o vosso website e identifiquei oportunidades para melhorar a vossa presença digital e atrair mais pacientes. Desenvolvemos landing pages profissionais para clínicas a partir de 499€. Consultem os nossos planos em https://webdevportugal.com/. Teriam disponibilidade para conversar?',
      semWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Reparei que a vossa clínica ainda não dispõe de uma página web profissional. A maioria dos pacientes pesquisa online antes de marcar consulta. Desenvolvemos landing pages para clínicas a partir de 499€. Consultem os nossos planos em https://webdevportugal.com/. Teriam interesse?',
    },
    email: {
      subject: 'Proposta de presença digital para {{nome}} — WebDev Portugal',
      comWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tive oportunidade de visitar o vosso website <a href="{{website}}">{{website}}</a>. No setor da saúde, a confiança e o profissionalismo transmitidos online são determinantes na decisão dos pacientes.

Desenvolvemos <strong>landing pages especializadas para clínicas</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design profissional e que transmite confiança
• Apresentação da equipa médica e especialidades
• Sistema de marcação de consultas online
• Informações sobre seguros e convenções aceites
• Otimização para pesquisas locais (SEO)
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer esclarecimento.

Com os melhores cumprimentos,`,
      semWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tomei conhecimento da vossa clínica <strong>{{nome}}</strong> e verifiquei que ainda não dispõem de uma página web profissional. Atualmente, <strong>a maioria dos pacientes pesquisa clínicas e especialidades online</strong> antes de efetuar uma marcação.

Desenvolvemos <strong>landing pages profissionais para clínicas</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design profissional e que inspira confiança
• Apresentação dos médicos e especialidades
• Sistema de marcação de consultas online
• Seguros e convenções aceites
• Otimização para pesquisas locais no Google
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer questão.

Com os melhores cumprimentos,`,
    },
  },
  {
    id: 'tattoo',
    label: '🎨 Tattoo Shops',
    whatsapp: {
      comWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Visitei o vosso website e o vosso trabalho é notável. Acredito que uma landing page profissional com portfolio e sistema de marcações pode potenciar significativamente o vosso estúdio. O nosso plano inicial é de 499€. Consultem os detalhes em https://webdevportugal.com/. Teriam disponibilidade para conversar?',
      semWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. O vosso trabalho artístico merece uma montra profissional online. A maioria dos clientes pesquisa portfolios e estúdios antes de marcar. Desenvolvemos landing pages para estúdios de tatuagem a partir de 499€. Consultem os nossos planos em https://webdevportugal.com/. Teriam interesse?',
    },
    email: {
      subject: 'Proposta de presença digital para {{nome}} — WebDev Portugal',
      comWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tive oportunidade de visitar o vosso website <a href="{{website}}">{{website}}</a>. O vosso trabalho artístico é notável e merece uma apresentação digital à altura.

Desenvolvemos <strong>landing pages especializadas para estúdios de tatuagem</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design arrojado e fiel à identidade do estúdio
• Galeria/portfolio de trabalhos em alta qualidade
• Perfil dos artistas com estilos e especialidades
• Sistema de marcações online (walk-in e agendamento)
• Otimização para pesquisas locais (SEO)
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer esclarecimento.

Com os melhores cumprimentos,`,
      semWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tomei conhecimento do vosso estúdio <strong>{{nome}}</strong> e verifiquei que ainda não dispõem de uma página web profissional. <strong>A maioria dos clientes pesquisa portfolios e estúdios de tatuagem online</strong> antes de efetuar uma marcação — sem presença digital, estão a perder esses contactos.

Desenvolvemos <strong>landing pages profissionais para estúdios de tatuagem</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design arrojado e único
• Portfolio de trabalhos em alta resolução
• Perfil de cada artista com especialidades
• Sistema de marcações online
• Otimização para pesquisas locais no Google
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer questão.

Com os melhores cumprimentos,`,
    },
  },
  {
    id: 'restaurantes',
    label: '🍽️ Restaurantes',
    whatsapp: {
      comWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Visitei o vosso website e acredito que uma landing page moderna com ementa digital, galeria e reservas online pode atrair significativamente mais clientes. O nosso plano inicial é de 499€. Consultem os detalhes em https://webdevportugal.com/. Teriam disponibilidade para conversar?',
      semWebsite:
        'Boa tarde, {{nome}}. O meu nome é Gustavo, da WebDev Portugal. Reparei que o vosso restaurante ainda não dispõe de uma página web. Mais de 70% dos clientes pesquisam restaurantes online antes de escolher onde comer. Desenvolvemos landing pages profissionais a partir de 499€. Consultem os nossos planos em https://webdevportugal.com/. Teriam interesse?',
    },
    email: {
      subject: 'Proposta de presença digital para {{nome}} — WebDev Portugal',
      comWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tive oportunidade de visitar o vosso website <a href="{{website}}">{{website}}</a>. Na restauração, a apresentação e a facilidade de acesso à informação são determinantes na decisão dos clientes.

Desenvolvemos <strong>landing pages especializadas para restaurantes</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design elegante e apelativo
• Ementa/menu digital com fotografias
• Sistema de reservas online integrado
• Galeria de fotos do espaço e dos pratos
• Otimização para pesquisas locais (SEO)
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer esclarecimento.

Com os melhores cumprimentos,`,
      semWebsite: `Exmos. Srs.,

Boa tarde. O meu nome é Gustavo, represento a <strong>WebDev Portugal</strong>.

Tomei conhecimento do vosso restaurante <strong>{{nome}}</strong> e verifiquei que ainda não dispõem de uma página web profissional. <strong>Mais de 70% dos clientes pesquisam restaurantes online</strong> antes de decidir onde comer — sem presença digital, estão a perder reservas diariamente.

Desenvolvemos <strong>landing pages profissionais para restaurantes</strong>:

<strong>O nosso Plano Inicial (499€) inclui:</strong>
• Design elegante e apelativo
• Menu/ementa digital com fotografias
• Sistema de reservas online integrado
• Galeria do espaço e dos pratos
• Otimização para pesquisas locais no Google
• Domínio e alojamento durante 1 ano

Poderão consultar todos os nossos planos em:
<a href="https://webdevportugal.com/">https://webdevportugal.com/</a>

Ficarei ao dispor para qualquer questão.

Com os melhores cumprimentos,`,
    },
  },
];

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

// ═══════════════════════════════════════════
// ══════════ EMAIL UTILITIES ═══════════════
// ═══════════════════════════════════════════

/**
 * Templates de email por defeito — usa o tipo "genérico" do BUSINESS_TYPES
 */
export const DEFAULT_EMAIL_TEMPLATES = BUSINESS_TYPES[0].email;

/**
 * Gera o HTML completo de um email com branding WebDev Portugal
 */
export function generateEmailHTML(bodyContent) {
  return `<!DOCTYPE html>
<html lang="pt-PT">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background-color:#2563eb;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#ffffff;font-size:22px;font-weight:700;">🌐 WebDev Portugal</td>
              </tr>
              <tr>
                <td style="color:#bfdbfe;font-size:13px;padding-top:4px;">Landing Pages Profissionais a partir de 499€</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;font-size:14px;line-height:1.7;color:#374151;">
            ${bodyContent}
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#2563eb;border-radius:8px;">
                  <a href="https://webdevportugal.com/" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
                    Visitar WebDev Portugal →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
              Cumprimentos,<br>
              <strong style="color:#374151;">Equipa WebDev Portugal</strong><br>
              <a href="https://webdevportugal.com" style="color:#2563eb;text-decoration:none;">webdevportugal.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Gera o corpo do email personalizado a partir dos templates
 */
export function generateEmailBody(nomeEmpresa, website, emailTemplates) {
  const t = emailTemplates || DEFAULT_EMAIL_TEMPLATES;
  const template = hasValidWebsite(website) ? t.comWebsite : t.semWebsite;
  return applyTemplate(template, nomeEmpresa, website).replace(/\n/g, '<br>');
}

/**
 * Gera o assunto do email personalizado
 */
export function generateEmailSubject(nomeEmpresa, emailTemplates) {
  const t = emailTemplates || DEFAULT_EMAIL_TEMPLATES;
  return applyTemplate(t.subject, nomeEmpresa, '');
}

/**
 * Valida formato básico de email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
