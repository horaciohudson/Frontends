import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  exp: number; // timestamp em segundos
}

export function verificarExpiracaoToken() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded: TokenPayload = jwtDecode(token);
    const agora = Date.now();
    const expiraEm = decoded.exp * 1000;

    if (expiraEm <= agora) {
      console.warn("⚠️ Token expirado. Forçando logout.");
      forcarLogout();
    } else {
      const tempoRestante = expiraEm - agora;
      console.log(`🔐 Token válido. Logout automático em ${(tempoRestante / 1000).toFixed(0)}s`);

      setTimeout(() => {
        console.warn("⚠️ Token expirado. Logout automático disparado.");
        forcarLogout();
      }, tempoRestante);
    }
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    forcarLogout();
  }
}

function forcarLogout() {
  console.log("🚪 auth.ts - forcarLogout() CHAMADO!");
  console.trace("🔍 Stack trace do forcarLogout:");
  localStorage.removeItem("token");
  window.location.href = "/login";
}
