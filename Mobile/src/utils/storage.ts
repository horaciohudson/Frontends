// Utilitário de Storage usando AsyncStorage
// Substitui o localStorage do web

import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefixo para evitar conflitos com outros apps
const STORAGE_PREFIX = '@sigeve_';

// Chaves de storage
export const STORAGE_KEYS = {
    TOKEN: `${STORAGE_PREFIX}token`,
    USER: `${STORAGE_PREFIX}user`,
    USER_TYPE: `${STORAGE_PREFIX}userType`,
    CART: `${STORAGE_PREFIX}cart`,
};

// Funções de storage
export const storage = {
    // Salvar item
    async setItem(key: string, value: string): Promise<void> {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Storage setItem error:', error);
        }
    },

    // Obter item
    async getItem(key: string): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.error('Storage getItem error:', error);
            return null;
        }
    },

    // Remover item
    async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Storage removeItem error:', error);
        }
    },

    // Salvar objeto JSON
    async setObject<T>(key: string, value: T): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error('Storage setObject error:', error);
        }
    },

    // Obter objeto JSON
    async getObject<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Storage getObject error:', error);
            return null;
        }
    },

    // Limpar todos os dados do app
    async clear(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const appKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
            await AsyncStorage.multiRemove(appKeys);
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    },
};

export default storage;
