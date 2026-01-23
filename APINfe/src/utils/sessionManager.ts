/**
 * Utilitário para gerenciar persistência de sessão e recuperação de estado de autenticação
 */

export interface SessionData {
    token: string;
    user: any;
    timestamp: number;
    lastActivity: number;
}

export interface SessionValidationResult {
    isValid: boolean;
    reason?: 'expired' | 'inactive' | 'corrupted' | 'missing';
    session?: SessionData;
}

export class SessionManager {
    private static readonly SESSION_KEY = 'apinfe_session';
    private static readonly MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 horas em ms
    private static readonly MAX_INACTIVITY = 2 * 60 * 60 * 1000; // 2 horas de inatividade
    private static readonly ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // Atualizar atividade a cada 5 minutos

    /**
     * Salva dados da sessão no localStorage
     */
    static saveSession(token: string, user: any): void {
        const now = Date.now();
        const sessionData: SessionData = {
            token,
            user,
            timestamp: now,
            lastActivity: now
        };

        try {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            console.log('Sessão salva com sucesso');
        } catch (error) {
            console.error('Erro ao salvar sessão:', error);
        }
    }

    /**
     * Recupera dados da sessão do localStorage com validação completa
     */
    static getSession(): SessionData | null {
        try {
            const sessionStr = localStorage.getItem(this.SESSION_KEY);
            if (!sessionStr) return null;

            const sessionData: SessionData = JSON.parse(sessionStr);
            
            // Verifica se a sessão tem todos os campos necessários
            if (!sessionData.token || !sessionData.timestamp) {
                console.warn('Sessão com dados incompletos, removendo...');
                this.clearSession();
                return null;
            }

            return sessionData;
        } catch (error) {
            console.error('Erro ao recuperar sessão:', error);
            this.clearSession();
            return null;
        }
    }

    /**
     * Valida uma sessão existente considerando idade e inatividade
     */
    static validateSession(session?: SessionData): SessionValidationResult {
        if (!session) {
            session = this.getSession();
        }

        if (!session) {
            return { isValid: false, reason: 'missing' };
        }

        // Verifica se a sessão tem todos os campos necessários
        if (!session.token || !session.timestamp) {
            console.warn('Sessão com dados incompletos');
            return { isValid: false, reason: 'corrupted', session };
        }

        const now = Date.now();
        const age = now - session.timestamp;
        const inactivity = now - (session.lastActivity || session.timestamp);

        // Verifica se a sessão não está muito antiga (>= para incluir o limite exato)
        if (age >= this.MAX_SESSION_AGE) {
            console.warn('Sessão expirada por idade');
            return { isValid: false, reason: 'expired', session };
        }

        // Verifica se não há muita inatividade (>= para incluir o limite exato)
        if (inactivity >= this.MAX_INACTIVITY) {
            console.warn('Sessão expirada por inatividade');
            return { isValid: false, reason: 'inactive', session };
        }

        // Verifica se o token ainda é válido (estrutura JWT)
        if (!this.isTokenStructureValid(session.token)) {
            console.warn('Token com estrutura inválida');
            return { isValid: false, reason: 'corrupted', session };
        }

        return { isValid: true, session };
    }

    /**
     * Verifica se o token tem estrutura JWT válida
     */
    private static isTokenStructureValid(token: string): boolean {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            // Tenta decodificar o payload
            const payload = JSON.parse(atob(parts[1]));
            return payload && typeof payload === 'object';
        } catch {
            return false;
        }
    }

    /**
     * Limpa dados da sessão
     */
    static clearSession(): void {
        try {
            localStorage.removeItem(this.SESSION_KEY);
            localStorage.removeItem('token'); // Remove token legacy
            localStorage.removeItem('user');  // Remove user legacy
            console.log('Sessão limpa com sucesso');
        } catch (error) {
            console.error('Erro ao limpar sessão:', error);
        }
    }

    /**
     * Verifica se existe uma sessão válida
     */
    static hasValidSession(): boolean {
        const validation = this.validateSession();
        return validation.isValid;
    }

    /**
     * Atualiza o timestamp de atividade da sessão
     */
    static updateActivity(): void {
        const session = this.getSession();
        if (session) {
            session.lastActivity = Date.now();
            try {
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            } catch (error) {
                console.error('Erro ao atualizar atividade da sessão:', error);
            }
        }
    }

    /**
     * Inicia o monitoramento de atividade do usuário
     */
    static startActivityMonitoring(): void {
        // Atualiza atividade em eventos do usuário
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        let lastUpdate = 0;
        const throttledUpdate = () => {
            const now = Date.now();
            if (now - lastUpdate > this.ACTIVITY_UPDATE_INTERVAL) {
                this.updateActivity();
                lastUpdate = now;
            }
        };

        events.forEach(event => {
            document.addEventListener(event, throttledUpdate, { passive: true });
        });

        // Atualiza atividade periodicamente
        setInterval(() => {
            if (this.hasValidSession()) {
                this.updateActivity();
            }
        }, this.ACTIVITY_UPDATE_INTERVAL);
    }

    /**
     * Para o monitoramento de atividade
     */
    static stopActivityMonitoring(): void {
        // Remove event listeners (implementação simplificada)
        // Em uma implementação completa, seria necessário manter referências aos listeners
        console.log('Monitoramento de atividade parado');
    }

    /**
     * Migra dados de sessão do formato antigo (token/user separados) para o novo formato
     */
    static migrateOldSession(): SessionData | null {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                const user = JSON.parse(userStr);
                
                // Salva no novo formato
                this.saveSession(token, user);
                
                // Remove dados antigos
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                console.log('Migração de sessão antiga concluída');
                return { token, user, timestamp: Date.now(), lastActivity: Date.now() };
            }
        } catch (error) {
            console.error('Erro ao migrar sessão antiga:', error);
        }

        return null;
    }

    /**
     * Inicializa o gerenciador de sessão na inicialização da aplicação
     */
    static initialize(): SessionValidationResult {
        console.log('Inicializando SessionManager...');

        // Primeiro, tenta migrar sessão antiga se existir
        let session = this.migrateOldSession();
        
        // Se não havia sessão antiga, tenta carregar sessão atual
        if (!session) {
            session = this.getSession();
        }

        // Valida a sessão encontrada
        const validation = this.validateSession(session);

        if (!validation.isValid && validation.session) {
            // Sessão inválida encontrada, limpa
            this.clearSession();
            console.log(`Sessão inválida removida: ${validation.reason}`);
        } else if (validation.isValid) {
            // Sessão válida, inicia monitoramento
            this.startActivityMonitoring();
            console.log('Sessão válida encontrada, monitoramento iniciado');
        } else {
            console.log('Nenhuma sessão encontrada');
        }

        return validation;
    }

    /**
     * Obtém informações de diagnóstico da sessão
     */
    static getSessionInfo(): {
        hasSession: boolean;
        isValid: boolean;
        age?: number;
        inactivity?: number;
        reason?: string;
    } {
        const session = this.getSession();
        if (!session) {
            return { hasSession: false, isValid: false };
        }

        const validation = this.validateSession(session);
        const now = Date.now();

        return {
            hasSession: true,
            isValid: validation.isValid,
            age: now - session.timestamp,
            inactivity: now - (session.lastActivity || session.timestamp),
            reason: validation.reason
        };
    }
}