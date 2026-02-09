// Tela de Gerenciamento de Endereços

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
import { addressesAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import type { Address } from '../../types';

export default function AddressesScreen({ navigation }: any) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            console.log('📍 Carregando meus endereços...');
            const response = await addressesAPI.getMyAddresses();
            console.log('📍 Resposta completa:', response);
            console.log('📍 response.data:', response.data);
            console.log('📍 response.data.data:', response.data.data);

            const addressList = response.data.data || [];
            console.log('📍 Lista de endereços:', addressList);
            console.log('📍 Quantidade de endereços:', addressList.length);

            setAddresses(addressList);
        } catch (error) {
            console.error('❌ Erro ao carregar endereços:', error);
            Alert.alert('Erro', 'Não foi possível carregar os endereços.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAddresses();
        setRefreshing(false);
    };

    const handleAddAddress = () => {
        navigation.navigate('AddressForm', {
            onSave: loadAddresses,
        });
    };

    const handleEditAddress = (address: Address) => {
        navigation.navigate('AddressForm', {
            address,
            onSave: loadAddresses,
        });
    };

    const handleDeleteAddress = (address: Address) => {
        Alert.alert(
            'Excluir Endereço',
            `Deseja excluir o endereço ${address.street}, ${address.number}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (address.id) {
                                await addressesAPI.delete(address.id);
                                Alert.alert('Sucesso', 'Endereço excluído com sucesso!');
                                loadAddresses();
                            }
                        } catch (error) {
                            console.error('Erro ao excluir endereço:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o endereço.');
                        }
                    },
                },
            ]
        );
    };

    const renderAddress = ({ item }: { item: Address }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                    <Text style={styles.addressType}>
                        {item.addressType === 'SHIPPING' ? '📦 Entrega' :
                            item.addressType === 'BILLING' ? '💳 Cobrança' : '📦💳 Ambos'}
                    </Text>
                </View>
            </View>

            <View style={styles.addressInfo}>
                <Text style={styles.addressStreet}>
                    {item.street}, {item.number}
                </Text>
                {item.complement && (
                    <Text style={styles.addressDetail}>{item.complement}</Text>
                )}
                <Text style={styles.addressDetail}>
                    {item.neighborhood}, {item.city} - {item.state}
                </Text>
                <Text style={styles.addressDetail}>CEP: {item.zipCode}</Text>
            </View>

            <View style={styles.addressActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditAddress(item)}
                >
                    <Text style={styles.editButtonText}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAddress(item)}
                >
                    <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
            <Text style={styles.emptyText}>Adicione um endereço para facilitar suas compras</Text>
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
                data={addresses}
                renderItem={renderAddress}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={renderEmpty}
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                <Text style={styles.addButtonText}>+ Adicionar Endereço</Text>
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
    addressCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    addressTypeContainer: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    addressType: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: colors.primary,
    },
    addressInfo: {
        marginBottom: spacing.md,
    },
    addressStreet: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    addressDetail: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    addressActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    editButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        alignItems: 'center',
    },
    editButtonText: {
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
