// Tela de Perfil do Usuário

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Deseja realmente sair da sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                },
            ]
        );
    };

    const menuItems = [
        {
            icon: '📦',
            title: 'Meus Pedidos',
            subtitle: 'Acompanhe seus pedidos',
            onPress: () => navigation.navigate('Orders'),
        },
        {
            icon: '❤️',
            title: 'Meus Favoritos',
            subtitle: 'Produtos que você amou',
            onPress: () => navigation.navigate('Wishlist'),
        },
        {
            icon: '📍',
            title: 'Endereços',
            subtitle: 'Gerencie seus endereços',
            onPress: () => navigation.navigate('Addresses'),
        },
        {
            icon: '💳',
            title: 'Formas de Pagamento',
            subtitle: 'Gerencie seus cartões',
            onPress: () => navigation.navigate('PaymentMethods'),
        },
        {
            icon: '🔔',
            title: 'Notificações',
            subtitle: 'Configure suas notificações',
            onPress: () => navigation.navigate('Notifications'),
        },
        {
            icon: '❓',
            title: 'Ajuda',
            subtitle: 'Central de ajuda',
            onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
        },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header do Perfil */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.firstName?.charAt(0) || user?.username?.charAt(0) || '?'}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.userName}>
                        {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.username || 'Usuário'}
                    </Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                </View>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
            </View>

            {/* Menu */}
            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <View style={styles.logoutSection}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutIcon}>🚪</Text>
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>
            </View>

            {/* Versão */}
            <View style={styles.versionSection}>
                <Text style={styles.versionText}>SigeveClaud Mobile v1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.white,
        textTransform: 'uppercase',
    },
    profileInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    userName: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    userEmail: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    editButton: {
        padding: spacing.sm,
    },
    editButtonText: {
        fontSize: 20,
    },
    menuSection: {
        backgroundColor: colors.white,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: fontSize.md,
        color: colors.text.primary,
        fontWeight: '500',
    },
    menuSubtitle: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginTop: 2,
    },
    menuArrow: {
        fontSize: 24,
        color: colors.gray[400],
    },
    logoutSection: {
        padding: spacing.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    logoutIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    logoutText: {
        fontSize: fontSize.md,
        color: colors.accent,
        fontWeight: '600',
    },
    versionSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    versionText: {
        fontSize: fontSize.xs,
        color: colors.gray[400],
    },
});
