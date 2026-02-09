// Tela de Configurações de Notificações

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Switch,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { notificationsAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';

interface NotificationPreferences {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
}

export default function NotificationsScreen() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        orderUpdates: true,
        promotions: true,
        newsletter: false,
    });

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const response = await notificationsAPI.getPreferences();
            setPreferences(response.data.data);
        } catch (error) {
            console.error('Erro ao carregar preferências:', error);
            Alert.alert('Erro', 'Não foi possível carregar as preferências.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);

        try {
            setSaving(true);
            await notificationsAPI.updatePreferences(newPreferences);
        } catch (error) {
            console.error('Erro ao salvar preferências:', error);
            // Reverter mudança em caso de erro
            setPreferences(preferences);
            Alert.alert('Erro', 'Não foi possível salvar as preferências.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Canais de Notificação */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Canais de Notificação</Text>
                <Text style={styles.sectionDescription}>
                    Escolha como deseja receber notificações
                </Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Push Notifications</Text>
                        <Text style={styles.settingDescription}>
                            Notificações no aplicativo
                        </Text>
                    </View>
                    <Switch
                        value={preferences.pushEnabled}
                        onValueChange={(value) => handleToggle('pushEnabled', value)}
                        trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                        thumbColor={preferences.pushEnabled ? colors.primary : colors.gray[400]}
                        disabled={saving}
                    />
                </View>

                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Email</Text>
                        <Text style={styles.settingDescription}>
                            Notificações por e-mail
                        </Text>
                    </View>
                    <Switch
                        value={preferences.emailEnabled}
                        onValueChange={(value) => handleToggle('emailEnabled', value)}
                        trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                        thumbColor={preferences.emailEnabled ? colors.primary : colors.gray[400]}
                        disabled={saving}
                    />
                </View>

                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>SMS</Text>
                        <Text style={styles.settingDescription}>
                            Notificações por mensagem de texto
                        </Text>
                    </View>
                    <Switch
                        value={preferences.smsEnabled}
                        onValueChange={(value) => handleToggle('smsEnabled', value)}
                        trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                        thumbColor={preferences.smsEnabled ? colors.primary : colors.gray[400]}
                        disabled={saving}
                    />
                </View>
            </View>

            {/* Tipos de Notificação */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipos de Notificação</Text>
                <Text style={styles.sectionDescription}>
                    Escolha quais notificações deseja receber
                </Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Atualizações de Pedidos</Text>
                        <Text style={styles.settingDescription}>
                            Status de entrega, confirmações, etc.
                        </Text>
                    </View>
                    <Switch
                        value={preferences.orderUpdates}
                        onValueChange={(value) => handleToggle('orderUpdates', value)}
                        trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                        thumbColor={preferences.orderUpdates ? colors.primary : colors.gray[400]}
                        disabled={saving}
                    />
                </View>

                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Promoções e Ofertas</Text>
                        <Text style={styles.settingDescription}>
                            Descontos, cupons e ofertas especiais
                        </Text>
                    </View>
                    <Switch
                        value={preferences.promotions}
                        onValueChange={(value) => handleToggle('promotions', value)}
                        trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                        thumbColor={preferences.promotions ? colors.primary : colors.gray[400]}
                        disabled={saving}
                    />
                </View>

                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Newsletter</Text>
                        <Text style={styles.settingDescription}>
                            Novidades, dicas e conteúdos exclusivos
                        </Text>
                    </View>
                    <Switch
                        value={preferences.newsletter}
                        onValueChange={(value) => handleToggle('newsletter', value)}
                        trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                        thumbColor={preferences.newsletter ? colors.primary : colors.gray[400]}
                        disabled={saving}
                    />
                </View>
            </View>

            {saving && (
                <View style={styles.savingIndicator}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.savingText}>Salvando...</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: colors.white,
        marginTop: spacing.md,
        padding: spacing.md,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    sectionDescription: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.md,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    settingInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    settingTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    settingDescription: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    savingIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    savingText: {
        marginLeft: spacing.sm,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
});
