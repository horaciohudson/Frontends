import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>SigeveClaud</h4>
                        <p>Seu marketplace completo na nuvem. Compre e venda com segurança.</p>
                        <div className="social-links">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
                                📷
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
                                📘
                            </a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" title="TikTok">
                                🎵
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
                                🐦
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Links Rápidos</h4>
                        <ul>
                            <li><a href="/products">Produtos</a></li>
                            <li><a href="/about">Sobre Nós</a></li>
                            <li><a href="/contact">Contato</a></li>
                            <li><a href="/sell">Comece a Vender</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Suporte</h4>
                        <ul>
                            <li><a href="/help">Central de Ajuda</a></li>
                            <li><a href="/terms">Termos de Uso</a></li>
                            <li><a href="/privacy">Privacidade</a></li>
                            <li><a href="/returns">Trocas e Devoluções</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Baixe o App</h4>
                        <p>Compre pelo celular com ainda mais facilidade</p>
                        <div className="app-badges">
                            <div className="qr-placeholder">📱 QR Code</div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="footer-payments">
                    <h4>Formas de Pagamento</h4>
                    <div className="payment-icons">
                        <span className="payment-badge" title="Visa">💳 Visa</span>
                        <span className="payment-badge" title="Mastercard">💳 Master</span>
                        <span className="payment-badge" title="Elo">💳 Elo</span>
                        <span className="payment-badge" title="PIX">💰 PIX</span>
                        <span className="payment-badge" title="Boleto">🧾 Boleto</span>
                    </div>
                </div>

                {/* Security Badges */}
                <div className="footer-security">
                    <h4>Segurança e Certificações</h4>
                    <div className="security-badges">
                        <span className="security-badge">🔒 SSL Seguro</span>
                        <span className="security-badge">✅ PCI Compliant</span>
                        <span className="security-badge">🛡️ Compra Protegida</span>
                    </div>
                </div>

                {/* Legal Information */}
                <div className="footer-legal">
                    <div className="legal-info">
                        <p><strong>SigeveClaud Comércio Eletrônico Ltda.</strong></p>
                        <p>CNPJ: 00.000.000/0001-00</p>
                        <p>Endereço: Rua Exemplo, 123 - Centro - São Paulo/SP - CEP 01000-000</p>
                        <p>Atendimento: Segunda a Sexta, 9h às 18h</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 SigeveClaud. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
