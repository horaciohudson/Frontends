// Navegador Principal (Auth + Main)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isAuthenticated, loading } = useAuth();

    // Mostrar loading enquanto verifica autenticação
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});
