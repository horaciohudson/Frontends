// Tela de Checkout

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { salesAPI, addressesAPI, paymentsAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import { formatCurrency } from '../../utils/formatters';
import CouponInput from '../../components/CouponInput';
import AppliedCouponBadge from '../../components/AppliedCouponBadge';
import type { PaymentMethod, Address } from '../../types';

type Step = 'address' | 'payment' | 'review';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'PIX', label: 'PIX', icon: '💲' },
    { value: 'BOLETO', label: 'Boleto Bancário', icon: '📄' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito', icon: '💳' },
];

export default function CheckoutScreen({ navigation }: any) {
    const { cart, items, total, subtotal, discount, couponCode, applyCoupon, removeCoupon, clearCart } = useCart();
    const { user } = useAuth();

    const [step, setStep] = useState<Step>('address');
    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

    // Form data
    const [address, setAddress] = useState<Address>({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil',
        addressType: 'SHIPPING',
    });

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
    const [cardData, setCardData] = useState({
        number: '',
        holderName: '',
        expiry: '',
        cvv: '',
        installments: 1,
    });

    // Carregar endereços salvos ao entrar na tela
    React.useEffect(() => {
        const loadAddresses = async () => {
            try {
                setLoading(true);
                const response = await addressesAPI.getMyAddresses();
                const addresses = response.data.data || [];
                setSavedAddresses(addresses);

                // Se o usuário tiver um endereço salvo, preencher automaticamente o primeiro
                if (addresses.length > 0) {
                    const addr = addresses[0];
                    setAddress({
                        id: addr.id,
                        street: addr.street || '',
                        number: addr.number || '',
                        complement: addr.complement || '',
                        neighborhood: addr.neighborhood || '',
                        city: addr.city || '',
                        state: addr.state || '',
                        zipCode: addr.zipCode || '',
                        country: addr.country || 'Brasil',
                        addressType: addr.addressType || 'SHIPPING',
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar endereços salvos:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadAddresses();
        }
    }, [user]);

    const updateAddress = (field: keyof Address, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    };

    const updateCard = (field: string, value: string) => {
        setCardData(prev => ({ ...prev, [field]: value }));
    };

    const validateAddress = (): boolean => {
        if (!address.street.trim()) {
            Alert.alert('Erro', 'Informe a rua.');
            return false;
        }
        if (!address.number.trim()) {
            Alert.alert('Erro', 'Informe o número.');
            return false;
        }
        if (!address.neighborhood.trim()) {
            Alert.alert('Erro', 'Informe o bairro.');
            return false;
        }
        if (!address.city.trim()) {
            Alert.alert('Erro', 'Informe a cidade.');
            return false;
        }
        if (!address.state.trim()) {
            Alert.alert('Erro', 'Informe o estado.');
            return false;
        }
        if (!address.zipCode.trim()) {
            Alert.alert('Erro', 'Informe o CEP.');
            return false;
        }
        return true;
    };

    const validateCard = (): boolean => {
        if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
            if (!cardData.number.trim() || cardData.number.replace(/\D/g, '').length < 16) {
                Alert.alert('Erro', 'Informe um número de cartão válido.');
                return false;
            }
            if (!cardData.holderName.trim()) {
                Alert.alert('Erro', 'Informe o nome no cartão.');
                return false;
            }
            if (!cardData.expiry.trim()) {
                Alert.alert('Erro', 'Informe a validade do cartão.');
                return false;
            }
            if (!cardData.cvv.trim() || cardData.cvv.length < 3) {
                Alert.alert('Erro', 'Informe o CVV.');
                return false;
            }
        }
        return true;
    };

    const handleNextStep = () => {
        if (step === 'address') {
            if (validateAddress()) {
                setStep('payment');
            }
        } else if (step === 'payment') {
            if (validateCard()) {
                setStep('review');
            }
        }
    };

    const handlePrevStep = () => {
        if (step === 'payment') {
            setStep('address');
        } else if (step === 'review') {
            setStep('payment');
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            console.log('🚀 Iniciando checkout...');

            // Validar carrinho
            if (!cart || !cart.id) {
                throw new Error('Carrinho inválido ou vazio');
            }

            // 1. Criar endereço
            console.log('📍 Criando endereço:', address);
            const addressResponse = await addressesAPI.create(address);
            console.log('✅ Endereço criado:', addressResponse.data);
            const addressId = addressResponse.data.data.id;

            if (!addressId) {
                throw new Error('Falha ao criar endereço');
            }

            // 2. Criar venda
            console.log('💰 Criando venda com:', { cartId: cart?.id, deliveryAddressId: addressId });
            const saleResponse = await salesAPI.create({
                cartId: cart!.id,
                deliveryAddressId: addressId,
            });
            console.log('✅ Venda criada:', saleResponse.data);
            const saleId = saleResponse.data.data.id;

            // 3. Processar pagamento (se cartão)
            if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
                console.log('💳 Processando pagamento...');
                await paymentsAPI.create({
                    saleId,
                    method: paymentMethod,
                    cardNumber: cardData.number.replace(/\D/g, ''),
                    cardHolderName: cardData.holderName,
                    cardExpiry: cardData.expiry,
                    cardCvv: cardData.cvv,
                    installments: cardData.installments,
                });
                console.log('✅ Pagamento processado');
            }

            // 4. Limpar carrinho
            console.log('🗑️ Limpando carrinho...');
            await clearCart();
            console.log('✅ Carrinho limpo');

            // 5. Navegar para sucesso
            console.log('🎉 Navegando para tela de sucesso com orderId:', saleId);
            navigation.replace('CheckoutSuccess', { orderId: saleId });

        } catch (error: any) {
            console.error('❌ Erro no checkout:', error);
            console.error('❌ Erro detalhado:', error.response?.data);
            const message = error.response?.data?.message || 'Erro ao processar pedido. Tente novamente.';
            Alert.alert('Erro', message);
        } finally {
            setLoading(false);
        }
    };

    const renderAddressStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Endereço de Entrega</Text>

            {savedAddresses.length > 0 && (
                <View style={styles.savedAddressesContainer}>
                    <Text style={styles.sectionLabel}>Endereços Salvos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedAddressesScroll}>
                        {savedAddresses.map((addr) => (
                            <TouchableOpacity
                                key={addr.id}
                                style={[
                                    styles.savedAddressCard,
                                    address.id === addr.id && styles.savedAddressCardSelected
                                ]}
                                onPress={() => setAddress(addr)}
                            >
                                <Text style={styles.savedAddressStreet} numberOfLines={1}>{addr.street}</Text>
                                <Text style={styles.savedAddressCity}>{addr.city} - {addr.state}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.inputGroup}>
                <Text style={styles.label}>CEP</Text>
                <TextInput
                    style={styles.input}
                    placeholder="00000-000"
                    value={address.zipCode}
                    onChangeText={(v) => updateAddress('zipCode', v)}
                    keyboardType="numeric"
                    maxLength={9}
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Rua</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome da rua"
                        value={address.street}
                        onChangeText={(v) => updateAddress('street', v)}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                    <Text style={styles.label}>Número</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nº"
                        value={address.number}
                        onChangeText={(v) => updateAddress('number', v)}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Apto, bloco, etc. (opcional)"
                    value={address.complement}
                    onChangeText={(v) => updateAddress('complement', v)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nome do bairro"
                    value={address.neighborhood}
                    onChangeText={(v) => updateAddress('neighborhood', v)}
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Cidade</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome da cidade"
                        value={address.city}
                        onChangeText={(v) => updateAddress('city', v)}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                    <Text style={styles.label}>Estado</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="UF"
                        value={address.state}
                        onChangeText={(v) => updateAddress('state', v)}
                        maxLength={2}
                        autoCapitalize="characters"
                    />
                </View>
            </View>
        </View>
    );

    const renderPaymentStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Forma de Pagamento</Text>

            {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                    key={method.value}
                    style={[
                        styles.paymentOption,
                        paymentMethod === method.value && styles.paymentOptionSelected,
                    ]}
                    onPress={() => setPaymentMethod(method.value)}
                >
                    <Text style={styles.paymentIcon}>{method.icon}</Text>
                    <Text style={[
                        styles.paymentLabel,
                        paymentMethod === method.value && styles.paymentLabelSelected,
                    ]}>
                        {method.label}
                    </Text>
                    {paymentMethod === method.value && (
                        <Text style={styles.checkmark}>✓</Text>
                    )}
                </TouchableOpacity>
            ))}

            {/* Formulário de Cartão */}
            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                <View style={styles.cardForm}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Número do Cartão</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0000 0000 0000 0000"
                            value={cardData.number}
                            onChangeText={(v) => updateCard('number', v)}
                            keyboardType="numeric"
                            maxLength={19}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome no Cartão</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Como está no cartão"
                            value={cardData.holderName}
                            onChangeText={(v) => updateCard('holderName', v)}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Validade</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="MM/AA"
                                value={cardData.expiry}
                                onChangeText={(v) => updateCard('expiry', v)}
                                maxLength={5}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                            <Text style={styles.label}>CVV</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="000"
                                value={cardData.cvv}
                                onChangeText={(v) => updateCard('cvv', v)}
                                keyboardType="numeric"
                                maxLength={4}
                                secureTextEntry
                            />
                        </View>
                    </View>
                </View>
            )}
        </View>
    );

    const renderReviewStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Resumo do Pedido</Text>

            {/* Endereço */}
            <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Endereço de Entrega</Text>
                <Text style={styles.reviewText}>
                    {address.street}, {address.number}
                    {address.complement ? ` - ${address.complement}` : ''}
                </Text>
                <Text style={styles.reviewText}>
                    {address.neighborhood}, {address.city} - {address.state}
                </Text>
                <Text style={styles.reviewText}>CEP: {address.zipCode}</Text>
            </View>

            {/* Pagamento */}
            <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Forma de Pagamento</Text>
                <Text style={styles.reviewText}>
                    {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}
                </Text>
            </View>

            {/* Itens */}
            <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Itens ({items.length})</Text>
                {items.map(item => (
                    <View key={item.id} style={styles.reviewItem}>
                        <Text style={styles.reviewItemName} numberOfLines={1}>
                            {item.quantity}x {item.product.name}
                        </Text>
                        <Text style={styles.reviewItemPrice}>
                            {formatCurrency(item.subtotal)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Cupom de Desconto */}
            <View style={styles.reviewSection}>
                {couponCode ? (
                    <AppliedCouponBadge
                        couponCode={couponCode}
                        discountAmount={discount}
                        onRemove={removeCoupon}
                    />
                ) : (
                    <CouponInput
                        onApply={async (code) => {
                            try {
                                await applyCoupon(code);
                            } catch (error: any) {
                                Alert.alert('Erro', error.message || 'Cupom inválido');
                            }
                        }}
                    />
                )}
            </View>

            {/* Total */}
            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
                </View>
                {discount > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={styles.discountLabel}>Desconto</Text>
                        <Text style={styles.discountValue}>-{formatCurrency(discount)}</Text>
                    </View>
                )}
                <View style={[styles.totalRow, styles.finalTotalRow]}>
                    <Text style={styles.finalTotalLabel}>Total</Text>
                    <Text style={styles.finalTotalValue}>{formatCurrency(total)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Progress */}
            <View style={styles.progress}>
                <View style={[styles.progressStep, step === 'address' && styles.progressStepActive]}>
                    <Text style={styles.progressText}>1. Endereço</Text>
                </View>
                <View style={[styles.progressStep, step === 'payment' && styles.progressStepActive]}>
                    <Text style={styles.progressText}>2. Pagamento</Text>
                </View>
                <View style={[styles.progressStep, step === 'review' && styles.progressStepActive]}>
                    <Text style={styles.progressText}>3. Confirmar</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView}>
                {step === 'address' && renderAddressStep()}
                {step === 'payment' && renderPaymentStep()}
                {step === 'review' && renderReviewStep()}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerButtons}>
                    {step !== 'address' && (
                        <TouchableOpacity style={styles.backButton} onPress={handlePrevStep}>
                            <Text style={styles.backButtonText}>Voltar</Text>
                        </TouchableOpacity>
                    )}

                    {step !== 'review' ? (
                        <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                            <Text style={styles.nextButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.submitButtonText}>Confirmar Pedido</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    progress: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    progressStep: {
        flex: 1,
        padding: spacing.xs,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: colors.gray[200],
    },
    progressStepActive: {
        borderBottomColor: colors.primary,
    },
    progressText: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },
    scrollView: {
        flex: 1,
    },
    stepContent: {
        padding: spacing.lg,
    },
    stepTitle: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.lg,
    },
    savedAddressesContainer: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    savedAddressesScroll: {
        marginHorizontal: -spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    savedAddressCard: {
        width: 200,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginRight: spacing.md,
    },
    savedAddressCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.gray[50],
    },
    savedAddressStreet: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
    },
    savedAddressCity: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginTop: 2,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    paymentOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.gray[50],
    },
    paymentIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    paymentLabel: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    paymentLabelSelected: {
        fontWeight: '600',
        color: colors.primary,
    },
    checkmark: {
        fontSize: 20,
        color: colors.primary,
    },
    cardForm: {
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    reviewSection: {
        marginBottom: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
    },
    reviewLabel: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    reviewText: {
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    reviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    reviewItemName: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },
    reviewItemPrice: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
    },
    totalSection: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    totalLabel: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
    },
    totalValue: {
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    discountLabel: {
        fontSize: fontSize.md,
        color: colors.success,
    },
    discountValue: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.success,
    },
    finalTotalRow: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginBottom: 0,
    },
    finalTotalLabel: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
    },
    finalTotalValue: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    footer: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    backButton: {
        flex: 1,
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    backButtonText: {
        color: colors.text.primary,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    nextButton: {
        flex: 2,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    nextButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    submitButton: {
        flex: 2,
        backgroundColor: colors.success,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    submitButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
