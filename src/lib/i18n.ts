// Minimal i18n for Amanda Florida. Auto-detects EN/ES/PT from navigator.
export type Lang = "en" | "es" | "pt";

export const LANGS: Lang[] = ["en", "es", "pt"];

const DICT = {
  en: {
    nav_how: "How it works",
    nav_services: "Services",
    nav_signin: "Sign in",
    nav_quote: "Get a quote",
    hero_badge: "Now booking in Tampa Bay",
    hero_title_a: "Book a cleaning by",
    hero_title_b: "chatting",
    hero_title_c: ". Not by filling forms.",
    hero_sub:
      "Tell Amanda Florida about your place — or send a couple of photos. You'll get a real price and open times in about 60 seconds.",
    hero_cta: "Start a quote",
    hero_how: "How it works",
    audience_kicker: "What are we cleaning?",
    audience_title: "Pick your fit — pricing adapts.",
    home_label: "My home",
    home_tag: "Families",
    home_tagline: "Weekly, bi-weekly, or a one-time deep clean.",
    rental_label: "My rental",
    rental_tag: "Hosts",
    rental_tagline: "Airbnb & VRBO turnovers with photo checklist.",
    move_label: "Move in / out",
    move_tag: "Realtors",
    move_tagline: "Deposit-ready cleans on short notice.",
    start_chat: "Start chat",
    how_kicker: "How it works",
    how_title: "Sixty seconds to a booked cleaning.",
    step1_title: "Chat or upload photos",
    step1_body:
      "Tell Amanda Florida your address, bedrooms, and cadence — or send a few photos of the rooms.",
    step2_title: "See your price instantly",
    step2_body: "Get a real estimate and open times without waiting for a callback.",
    step3_title: "Confirm in one tap",
    step3_body: "Sign in with Google, confirm the slot, and we'll show up ready.",
    cta_kicker: "Ready when you are",
    cta_title: "Your next cleaning is one conversation away.",
    cta_sub: "Serving Tampa, Westchase, Carrollwood, South Tampa, and greater Hillsborough County.",
    chat_placeholder: "Message Amanda Florida…",
    chat_welcome_new:
      "Hey! I'm Amanda Florida. Is this for **your home**, a **rental turnover**, or a **move in/out**?",
    chat_welcome_audience: (label: string) =>
      `Hey! Let's set up your ${label.toLowerCase()} clean. What's the address (or neighborhood) and how many bedrooms/bathrooms?`,
    chat_attach: "Attach photos",
    chat_signed_out_hint_a: "You can start now — you'll",
    chat_signed_out_hint_b: "sign in",
    chat_signed_out_hint_c: "to confirm your booking.",
    install_title: "Install Amanda Florida",
    install_body: "Add to your home screen for one-tap booking.",
    install_cta: "Install",
    install_dismiss: "Not now",
    install_ios_body: "In Safari, tap Share then Add to Home Screen to install Amanda Florida.",
  },
  es: {
    nav_how: "Cómo funciona",
    nav_services: "Servicios",
    nav_signin: "Ingresar",
    nav_quote: "Cotizar",
    hero_badge: "Reservando en Tampa Bay",
    hero_title_a: "Reserva tu limpieza",
    hero_title_b: "chateando",
    hero_title_c: ". Sin formularios.",
    hero_sub:
      "Cuéntale a Amanda Florida cómo es tu casa — o mándale un par de fotos. Recibes precio real y horarios en unos 60 segundos.",
    hero_cta: "Empezar cotización",
    hero_how: "Cómo funciona",
    audience_kicker: "¿Qué limpiamos?",
    audience_title: "Elige tu caso — el precio se adapta.",
    home_label: "Mi casa",
    home_tag: "Familias",
    home_tagline: "Semanal, quincenal o una limpieza profunda.",
    rental_label: "Mi renta",
    rental_tag: "Anfitriones",
    rental_tagline: "Turnover de Airbnb y VRBO con checklist con fotos.",
    move_label: "Mudanza",
    move_tag: "Realtors",
    move_tagline: "Limpieza lista para depósito, rápida.",
    start_chat: "Iniciar chat",
    how_kicker: "Cómo funciona",
    how_title: "Sesenta segundos para reservar tu limpieza.",
    step1_title: "Chatea o sube fotos",
    step1_body: "Dile a Amanda Florida tu dirección, habitaciones y frecuencia — o manda fotos.",
    step2_title: "Precio al instante",
    step2_body: "Estimado real y horarios abiertos sin esperar llamadas.",
    step3_title: "Confirma en un toque",
    step3_body: "Ingresa con Google, confirma el horario y llegamos listos.",
    cta_kicker: "Cuando estés listo",
    cta_title: "Tu próxima limpieza está a una conversación.",
    cta_sub: "Servimos Tampa, Westchase, Carrollwood, South Tampa y todo Hillsborough.",
    chat_placeholder: "Escríbele a Amanda Florida…",
    chat_welcome_new:
      "¡Hola! Soy Amanda Florida. ¿Es para **tu casa**, un **turnover de renta**, o una **mudanza**?",
    chat_welcome_audience: (label: string) =>
      `¡Hola! Vamos con tu limpieza de ${label.toLowerCase()}. ¿Dirección (o zona) y cuántos cuartos/baños?`,
    chat_attach: "Adjuntar fotos",
    chat_signed_out_hint_a: "Puedes empezar ya — luego",
    chat_signed_out_hint_b: "ingresa",
    chat_signed_out_hint_c: "para confirmar tu reserva.",
    install_title: "Instalar Amanda Florida",
    install_body: "Añádelo a tu pantalla de inicio y reserva en un toque.",
    install_cta: "Instalar",
    install_dismiss: "Ahora no",
    install_ios_body:
      "En Safari, toca Compartir y luego Añadir a inicio para instalar Amanda Florida.",
  },
  pt: {
    nav_how: "Como funciona",
    nav_services: "Serviços",
    nav_signin: "Entrar",
    nav_quote: "Cotação",
    hero_badge: "Agendando em Tampa Bay",
    hero_title_a: "Reserve sua faxina",
    hero_title_b: "conversando",
    hero_title_c: ". Sem formulário.",
    hero_sub:
      "Conte pra Amanda Florida como é sua casa — ou mande umas fotos. Você recebe preço real e horários em cerca de 60 segundos.",
    hero_cta: "Começar cotação",
    hero_how: "Como funciona",
    audience_kicker: "O que a gente limpa?",
    audience_title: "Escolha o seu caso — o preço se adapta.",
    home_label: "Minha casa",
    home_tag: "Famílias",
    home_tagline: "Semanal, quinzenal ou uma faxina pesada.",
    rental_label: "Meu aluguel",
    rental_tag: "Anfitriões",
    rental_tagline: "Turnover de Airbnb e VRBO com checklist com fotos.",
    move_label: "Mudança",
    move_tag: "Corretores",
    move_tagline: "Limpeza rápida pronta pra devolução.",
    start_chat: "Abrir chat",
    how_kicker: "Como funciona",
    how_title: "Sessenta segundos pra fechar a faxina.",
    step1_title: "Converse ou mande fotos",
    step1_body: "Diga endereço, quartos e frequência — ou mande fotos dos cômodos.",
    step2_title: "Preço na hora",
    step2_body: "Estimativa real e horários abertos sem esperar retorno.",
    step3_title: "Confirme em 1 toque",
    step3_body: "Entre com Google, confirme o horário e a gente chega pronto.",
    cta_kicker: "Quando quiser",
    cta_title: "Sua próxima faxina está a uma conversa.",
    cta_sub: "Atendendo Tampa, Westchase, Carrollwood, South Tampa e todo Hillsborough.",
    chat_placeholder: "Fale com a Amanda Florida…",
    chat_welcome_new:
      "Oi! Sou a Amanda Florida. É pra **sua casa**, um **turnover de aluguel** ou uma **mudança**?",
    chat_welcome_audience: (label: string) =>
      `Oi! Bora fechar sua faxina de ${label.toLowerCase()}. Qual o endereço (ou bairro) e quantos quartos/banheiros?`,
    chat_attach: "Anexar fotos",
    chat_signed_out_hint_a: "Pode começar agora —",
    chat_signed_out_hint_b: "entre",
    chat_signed_out_hint_c: "para confirmar a reserva.",
    install_title: "Instalar Amanda Florida",
    install_body: "Adicione à tela inicial e agende em um toque.",
    install_cta: "Instalar",
    install_dismiss: "Agora não",
    install_ios_body: "No Safari, toque Compartilhar e depois Adicionar à Tela de Início.",
  },
} as const;

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const stored =
    typeof window !== "undefined"
      ? (window.localStorage.getItem("tidly_lang") as Lang | null)
      : null;
  if (stored && LANGS.includes(stored)) return stored;
  const raw = (navigator.language || "en").toLowerCase();
  if (raw.startsWith("pt")) return "pt";
  if (raw.startsWith("es")) return "es";
  return "en";
}

export function setLang(lang: Lang) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("tidly_lang", lang);
  }
}

export function t(lang: Lang) {
  return DICT[lang];
}
