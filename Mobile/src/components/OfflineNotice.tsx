// Componente OfflineNotice para detectar status de rede
// NOTA: Para usar, instale: npx expo install @react-native-community/netinfo

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme';

interface OfflineNoticeProps {
    isOffline?: boolean;
}

export default function OfflineNotice({ isOffline = false }: OfflineNoticeProps) {
    if (!isOffline) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>📡 Sem conexão com a internet</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.error,
        padding: spacing.sm,
        alignItems: 'center',
    },
    text: {
        color: colors.white,
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
});
