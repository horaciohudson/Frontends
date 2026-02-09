// Tela de Gerenciamento de Métodos de Pagamento

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { paymentMethodsAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';

interface PaymentMethod {
    id: number;
    cardBrand: string;
    lastFourDigits: string;
    cardholderName: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    nickname?: string;
}

export default function PaymentMethodsScreen({ navigation }: any) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await paymentMethodsAPI.getAll();
            setPaymentMethods(response.data.data || []);
        } catch (error) {
            console.error('Erro ao carregar métodos de pagamento:', error);
            Alert.alert('Erro', 'Não foi possível carregar os métodos de pagamento.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPaymentMethods();
        setRefreshing(false);
    };

    const handleAddPaymentMethod = () => {
        navigation.navigate('PaymentMethodForm', {
            onSave: loadPaymentMethods,
        });
    };

    const handleSetDefault = async (id: number) => {
        try {
            await paymentMethodsAPI.setDefault(id);
            Alert.alert('Sucesso', 'Método de pagamento definido como padrão!');
            loadPaymentMethods();
        } catch (error) {
            console.error('Erro ao definir como padrão:', error);
            Alert.alert('Erro', 'Não foi possível definir como padrão.');
        }
    };

    const handleDelete = (paymentMethod: PaymentMethod) => {
        Alert.alert(
            'Excluir Método de Pagamento',
            `Deseja excluir o cartão ${paymentMethod.cardBrand} •••• ${paymentMethod.lastFourDigits}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await paymentMethodsAPI.delete(paymentMethod.id);
                            Alert.alert('Sucesso', 'Método de pagamento excluído!');
                            loadPaymentMethods();
                        } catch (error) {
                            console.error('Erro ao excluir:', error);
                            Alert.alert('Erro', 'Não foi possível excluir.');
                        }
                    },
                },
            ]
        );
    };

    const getCardIcon = (brand: string) => {
        const icons: Record<string, string> = {
            VISA: '💳',
            MASTERCARD: '💳',
            AMEX: '💳',
            ELO: '💳',
            OTHER: '💳',
        };
        return icons[brand] || '💳';
    };

    const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardIcon}>{getCardIcon(item.cardBrand)}</Text>
                    <View style={styles.cardDetails}>
                        <Text style={styles.cardBrand}>{item.cardBrand}</Text>
                        <Text style={styles.cardNumber}>•••• {item.lastFourDigits}</Text>
                    </View>
                </View>
                {item.isDefault && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Padrão</Text>
                    </View>
                )}
            </View>

            <Text style={styles.cardHolder}>{item.cardholderName}</Text>
            <Text style={styles.cardExpiry}>
                Validade: {String(item.expiryMonth).padStart(2, '0')}/{item.expiryYear}
            </Text>
            {item.nickname && <Text style={styles.nickname}>{item.nickname}</Text>}

            <View style={styles.actions}>
                {!item.isDefault && (
                    <TouchableOpacity
                        style={styles.defaultButton}
                        onPress={() => handleSetDefault(item.id)}
                    >
                        <Text style={styles.defaultButtonText}>Definir como Padrão</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item)}
                >
                    <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>Nenhum método de pagamento</Text>
            <Text style={styles.emptyText}>Adicione um cartão para facilitar suas compras</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={paymentMethods}
                renderItem={renderPaymentMethod}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={renderEmpty}
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
                <Text style={styles.addButtonText}>+ Adicionar Cartão</Text>
            </TouchableOpacity>
        </View>
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
    listContent: {
        padding: spacing.md,
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIcon: {
        fontSize: 32,
        marginRight: spacing.sm,
    },
    cardDetails: {},
    cardBrand: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    cardNumber: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    defaultBadge: {
        backgroundColor: colors.success,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    defaultText: {
        color: colors.white,
        fontSize: fontSize.xs,
        fontWeight: '600',
    },
    cardHolder: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    cardExpiry: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    nickname: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontStyle: 'italic',
        marginTop: spacing.xs,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    defaultButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        alignItems: 'center',
    },
    defaultButtonText: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: colors.error,
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: colors.primary,
        margin: spacing.md,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        ...shadows.md,
    },
    addButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});
