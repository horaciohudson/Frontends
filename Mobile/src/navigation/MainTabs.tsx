// Tab Navigator Principal (Home, Products, Cart, Profile)

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize } from '../theme';
import { useCart } from '../contexts/CartContext';
import type { MainTabParamList } from '../types';

// Importar telas
import HomeScreen from '../screens/home/HomeScreen';
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import CheckoutSuccessScreen from '../screens/cart/CheckoutSuccessScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import OrdersScreen from '../screens/profile/OrdersScreen';
import OrderDetailScreen from '../screens/profile/OrderDetailScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import AddressFormScreen from '../screens/profile/AddressFormScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import PaymentMethodFormScreen from '../screens/profile/PaymentMethodFormScreen';
import WishlistScreen from '../screens/profile/WishlistScreen';
import CreateReviewScreen from '../screens/reviews/CreateReviewScreen';
import ReviewsScreen from '../screens/reviews/ReviewsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Stacks para cada tab
const HomeStack = createNativeStackNavigator();
const ProductsStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Home Stack
function HomeStackScreen() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{ title: 'Início' }}
            />
            <HomeStack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'Detalhes do Produto' }}
            />
            <HomeStack.Screen
                name="CreateReview"
                component={CreateReviewScreen}
                options={{ title: 'Avaliar Produto' }}
            />
            <HomeStack.Screen
                name="Reviews"
                component={ReviewsScreen}
                options={{ title: 'Avaliações' }}
            />
        </HomeStack.Navigator>
    );
}

// Products Stack
function ProductsStackScreen() {
    return (
        <ProductsStack.Navigator>
            <ProductsStack.Screen
                name="ProductsScreen"
                component={ProductsScreen}
                options={{ title: 'Produtos' }}
            />
            <ProductsStack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'Detalhes do Produto' }}
            />
            <ProductsStack.Screen
                name="CreateReview"
                component={CreateReviewScreen}
                options={{ title: 'Avaliar Produto' }}
            />
            <ProductsStack.Screen
                name="Reviews"
                component={ReviewsScreen}
                options={{ title: 'Avaliações' }}
            />
        </ProductsStack.Navigator>
    );
}

// Cart Stack
function CartStackScreen() {
    return (
        <CartStack.Navigator>
            <CartStack.Screen
                name="CartScreen"
                component={CartScreen}
                options={{ title: 'Carrinho' }}
            />
            <CartStack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{ title: 'Checkout' }}
            />
            <CartStack.Screen
                name="CheckoutSuccess"
                component={CheckoutSuccessScreen}
                options={{ title: 'Pedido Confirmado', headerShown: false }}
            />
        </CartStack.Navigator>
    );
}

// Profile Stack
function ProfileStackScreen() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{ title: 'Meu Perfil' }}
            />
            <ProfileStack.Screen
                name="Orders"
                component={OrdersScreen}
                options={{ title: 'Meus Pedidos' }}
            />
            <ProfileStack.Screen
                name="OrderDetail"
                component={OrderDetailScreen}
                options={{ title: 'Detalhes do Pedido' }}
            />
            <ProfileStack.Screen
                name="Addresses"
                component={AddressesScreen}
                options={{ title: 'Meus Endereços' }}
            />
            <ProfileStack.Screen
                name="AddressForm"
                component={AddressFormScreen}
                options={{ title: 'Endereço' }}
            />
            <ProfileStack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Editar Perfil' }}
            />
            <ProfileStack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ title: 'Notificações' }}
            />
            <ProfileStack.Screen
                name="PaymentMethods"
                component={PaymentMethodsScreen}
                options={{ title: 'Formas de Pagamento' }}
            />
            <ProfileStack.Screen
                name="PaymentMethodForm"
                component={PaymentMethodFormScreen}
                options={{ title: 'Adicionar Cartão' }}
            />
            <ProfileStack.Screen
                name="Wishlist"
                component={WishlistScreen}
                options={{ title: 'Meus Favoritos' }}
            />
        </ProfileStack.Navigator>
    );
}

// Ícone simples com texto
function TabIcon({ name, focused, badge }: { name: string; focused: boolean; badge?: number }) {
    const icons: Record<string, string> = {
        Home: '🏠',
        Products: '🛍️',
        Cart: '🛒',
        Profile: '👤',
    };

    return (
        <View style={styles.iconContainer}>
            <Text style={[styles.icon, focused && styles.iconFocused]}>
                {icons[name]}
            </Text>
            {(badge ?? 0) > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge! > 99 ? '99+' : badge}</Text>
                </View>
            )}
        </View>
    );
}

export default function MainTabs() {
    const { itemCount } = useCart();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon
                        name={route.name}
                        focused={focused}
                        badge={route.name === 'Cart' ? itemCount : undefined}
                    />
                ),
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray[500],
                tabBarStyle: {
                    ...styles.tabBar,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                },
                tabBarLabelStyle: styles.tabLabel,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackScreen}
                options={{ tabBarLabel: 'Início' }}
            />
            <Tab.Screen
                name="Products"
                component={ProductsStackScreen}
                options={{ tabBarLabel: 'Produtos' }}
            />
            <Tab.Screen
                name="Cart"
                component={CartStackScreen}
                options={{ tabBarLabel: 'Carrinho' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackScreen}
                options={{ tabBarLabel: 'Perfil' }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.white,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingTop: 8,
        elevation: 8, // Android shadow
    },
    tabLabel: {
        fontSize: fontSize.xs,
        marginBottom: 4,
    },
    iconContainer: {
        position: 'relative',
    },
    icon: {
        fontSize: 22,
    },
    iconFocused: {
        transform: [{ scale: 1.1 }],
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        backgroundColor: colors.accent,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
