import { createContext, useContext, useState, type ReactNode } from 'react';

interface Settings {
    siteName: string;
    siteEmail: string;
    currency: string;
    operatingCompanyId: string;  // UUID da empresa que opera o sistema
    taxRate: string;
    shippingFee: string;
    minOrderValue: string;
    enableReviews: boolean;
    enableWishlist: boolean;
    enableNotifications: boolean;
    maintenanceMode: boolean;
    homeProductsPerPage: string;
    featuredProductsCount: string;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Settings) => void;
}

const defaultSettings: Settings = {
    siteName: 'Sigeve Claud',
    siteEmail: 'contato@sigeve.com',
    currency: 'BRL',
    operatingCompanyId: '',  // Será preenchido ao selecionar empresa
    taxRate: '0',
    shippingFee: '0',
    minOrderValue: '0',
    enableReviews: true,
    enableWishlist: true,
    enableNotifications: true,
    maintenanceMode: false,
    homeProductsPerPage: '20',
    featuredProductsCount: '4'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => {
        // Carregar configurações do localStorage
        const savedSettings = localStorage.getItem('siteSettings');
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch (error) {
                console.error('Error parsing saved settings:', error);
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    const updateSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        // Salvar no localStorage
        localStorage.setItem('siteSettings', JSON.stringify(newSettings));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
