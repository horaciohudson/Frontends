import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

console.log("🔧 Inicializando i18n simplificado...");

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: "pt",
    fallbackLng: "pt",
    debug: true,
    ns: ["principal", "test", "simple"],
    defaultNS: "principal",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  }).then(() => {
    console.log("✅ i18n simplificado inicializado!");
    console.log("🌍 Idioma:", i18n.language);
    console.log("📖 Namespaces:", i18n.options.ns);
    
    // Verificar se o namespace principal foi carregado
    setTimeout(() => {
      console.log("🔍 Verificando namespace 'principal':", i18n.hasResourceBundle('pt', 'principal'));
      if (i18n.hasResourceBundle('pt', 'principal')) {
        console.log("✅ Namespace 'principal' carregado!");
        console.log("📋 Conteúdo:", i18n.getResourceBundle('pt', 'principal'));
      } else {
        console.log("❌ Namespace 'principal' NÃO carregado!");
      }
    }, 1000);
    
  }).catch((error) => {
    console.error("❌ Erro ao inicializar i18n simplificado:", error);
  });

export default i18n;
