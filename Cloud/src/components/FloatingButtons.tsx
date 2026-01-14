import { useState, useEffect } from 'react';
import './FloatingButtons.css';

function FloatingButtons() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Mostrar botão "Voltar ao Topo" após rolar 300px
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const toggleFeedback = () => {
        setShowFeedback(!showFeedback);
    };

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implementar envio de feedback
        alert('Obrigado pelo seu feedback!');
        setShowFeedback(false);
    };

    return (
        <>
            {/* Botão Voltar ao Topo */}
            <button
                className={`floating-btn scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                title="Voltar ao topo"
                aria-label="Voltar ao topo"
            >
                ↑
            </button>

            {/* Botão de Feedback */}
            <button
                className="floating-btn feedback-btn"
                onClick={toggleFeedback}
                title="Enviar feedback"
                aria-label="Enviar feedback"
            >
                💬
            </button>

            {/* Modal de Feedback */}
            {showFeedback && (
                <div className="feedback-modal-overlay" onClick={toggleFeedback}>
                    <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="feedback-header">
                            <h3>Envie seu Feedback</h3>
                            <button className="close-btn" onClick={toggleFeedback}>✕</button>
                        </div>
                        <form onSubmit={handleFeedbackSubmit}>
                            <div className="form-group">
                                <label htmlFor="feedback-type">Tipo de Feedback</label>
                                <select id="feedback-type" required>
                                    <option value="">Selecione...</option>
                                    <option value="bug">Reportar Bug</option>
                                    <option value="suggestion">Sugestão</option>
                                    <option value="compliment">Elogio</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="feedback-message">Mensagem</label>
                                <textarea
                                    id="feedback-message"
                                    rows={5}
                                    placeholder="Conte-nos o que você pensa..."
                                    required
                                ></textarea>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={toggleFeedback}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit">
                                    Enviar Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default FloatingButtons;
