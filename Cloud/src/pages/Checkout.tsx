import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { salesAPI, addressesAPI, paymentsAPI, paymentMethodsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './Checkout.css';

interface SavedAddress {
    id: number;
    streetAddress: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    isPrimary: boolean;
}

interface AddressForm {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
}

interface CardForm {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvv: string;
    installments: number;
}

interface PaymentMethodType {
    id: number;
    methodCode: string;
    methodName: string;
    methodType: string;
    maxInstallments: number;
    isActive: boolean;
}

function Checkout() {
    const navigate = useNavigate();
    const { items, total, clearCart, cartId, refreshCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const { showNotification } = useNotification();

    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    const [addressForm, setAddressForm] = useState<AddressForm>({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        postalCode: ''
    });
    const [cardForm, setCardForm] = useState<CardForm>({
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: '',
        installments: 1
    });
    const [paymentMethod, setPaymentMethod] = useState<number | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load cart and saved addresses on mount
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            console.log('Checkout mounted, refreshing cart...');
            console.log('Current cart state:', { cartId, userId: user.id, itemsCount: items.length });
            refreshCart().then(() => {
                console.log('Cart refreshed');
            }).catch(err => {
                console.error('Error refreshing cart:', err);
            });

            // Load saved addresses
            loadSavedAddresses();
        }
    }, [isAuthenticated, user?.id]);

    const loadSavedAddresses = async () => {
        if (!user?.id) return;

        try {
            setLoadingAddresses(true);
            const response = await addressesAPI.getByUser(user.id);
            const addresses = response.data.data || [];
            setSavedAddresses(addresses);

            // Auto-select primary address or most recent
            if (addresses.length > 0) {
                const primaryAddress = addresses.find((addr: SavedAddress) => addr.isPrimary);
                const addressToSelect = primaryAddress || addresses[0];
                setSelectedAddressId(addressToSelect.id);
            } else {
                setShowNewAddressForm(true);
            }
        } catch (err) {
            console.error('Error loading saved addresses:', err);
            setShowNewAddressForm(true);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            setLoadingPaymentMethods(true);
            const response = await paymentMethodsAPI.getActiveForRetail();
            const methods = response.data.data || [];
            setPaymentMethods(methods);

            // Auto-select first payment method by ID
            if (methods.length > 0) {
                setPaymentMethod(methods[0].id);  // Changed from methodCode to id
            }
        } catch (err) {
            console.error('Error loading payment methods:', err);
        } finally {
            setLoadingPaymentMethods(false);
        }
    };

    // Helper function to get payment icon
    const getPaymentIcon = (methodType: string) => {
        switch (methodType) {
            case 'PIX':
                return '📱';
            case 'CREDIT_CARD':
                return '💳';
            case 'DEBIT_CARD':
                return '💳';
            case 'BOLETO':
                return '🧾';
            case 'CASH':
                return '💵';
            default:
                return '💰';
        }
    };

    // Log cart changes
    useEffect(() => {
        console.log('Cart state changed:', { cartId, userId: user?.id, itemsCount: items.length });
    }, [cartId, user?.id, items]);

    // Load payment methods on mount
    useEffect(() => {
        loadPaymentMethods();
    }, []);

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    // Redirect if cart is empty
    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    // Clear card form when payment method changes away from card
    useEffect(() => {
        const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
        if (selectedMethod?.methodType !== 'CREDIT_CARD' && selectedMethod?.methodType !== 'DEBIT_CARD') {
            setCardForm({
                cardNumber: '',
                cardholderName: '',
                expiryDate: '',
                cvv: '',
                installments: 1
            });
        }
    }, [paymentMethod]);


    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Format card number (add spaces every 4 digits)
        if (name === 'cardNumber') {
            const cleaned = value.replace(/\s/g, '');
            const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
            setCardForm(prev => ({ ...prev, [name]: formatted.substring(0, 19) }));
        }
        // Format expiry date (MM/YY)
        else if (name === 'expiryDate') {
            const cleaned = value.replace(/\D/g, '');
            let formatted = cleaned;
            if (cleaned.length >= 2) {
                formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
            }
            setCardForm(prev => ({ ...prev, [name]: formatted }));
        }
        // Limit CVV to 4 digits
        else if (name === 'cvv') {
            const cleaned = value.replace(/\D/g, '');
            setCardForm(prev => ({ ...prev, [name]: cleaned.substring(0, 4) }));
        }
        else {
            setCardForm(prev => ({ ...prev, [name]: value }));
        }
        setError('');
    };

    const validateForm = (): boolean => {
        // If using a saved address, skip address validation
        if (selectedAddressId && !showNewAddressForm) {
            if (!paymentMethod) {
                setError('Selecione um método de pagamento');
                return false;
            }
        } else {
            // Validate new address form
            if (!addressForm.street.trim()) {
                setError('Endereço é obrigatório');
                return false;
            }
            if (!addressForm.number.trim()) {
                setError('Número é obrigatório');
                return false;
            }
            if (!addressForm.neighborhood.trim()) {
                setError('Bairro é obrigatório');
                return false;
            }
            if (!addressForm.city.trim()) {
                setError('Cidade é obrigatória');
                return false;
            }
            if (!addressForm.state.trim()) {
                setError('Estado é obrigatório');
                return false;
            }
            if (!addressForm.postalCode.trim()) {
                setError('CEP é obrigatório');
                return false;
            }
            if (!paymentMethod) {
                setError('Selecione um método de pagamento');
                return false;
            }
        }

        // Validate card details if credit/debit card is selected
        const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethod);
        if (selectedPaymentMethod?.methodType === 'CREDIT_CARD' || selectedPaymentMethod?.methodType === 'DEBIT_CARD') {
            if (!cardForm.cardNumber.trim()) {
                setError('Número do cartão é obrigatório');
                return false;
            }
            if (cardForm.cardNumber.replace(/\s/g, '').length < 13) {
                setError('Número do cartão inválido');
                return false;
            }
            if (!cardForm.cardholderName.trim()) {
                setError('Nome do titular é obrigatório');
                return false;
            }
            if (!cardForm.expiryDate.trim() || cardForm.expiryDate.length < 5) {
                setError('Data de validade inválida');
                return false;
            }
            if (!cardForm.cvv.trim() || cardForm.cvv.length < 3) {
                setError('CVV inválido');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Try to refresh cart if cartId is missing
        if (!cartId) {
            console.log('Cart ID is missing, trying to refresh cart...');
            try {
                await refreshCart();
            } catch (err) {
                console.error('Failed to refresh cart:', err);
            }
        }

        // Check again after refresh attempt
        if (!cartId) {
            setError('Carrinho não encontrado. Por favor, adicione itens ao carrinho antes de finalizar a compra.');
            return;
        }

        if (!user?.id) {
            setError('Informações do usuário não encontradas. Por favor, faça login novamente.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            console.log('Starting checkout process...');
            console.log('Cart ID:', cartId);
            console.log('User ID:', user.id);

            // Step 1: Determine delivery address ID
            let deliveryAddressId: number;

            if (selectedAddressId && !showNewAddressForm) {
                // Use selected saved address
                deliveryAddressId = selectedAddressId;
                console.log('Using saved address ID:', deliveryAddressId);
            } else {
                // Create new delivery address
                const addressData = {
                    userId: user.id,
                    addressType: 'SHIPPING',
                    streetAddress: addressForm.street,
                    number: addressForm.number,
                    complement: addressForm.complement,
                    neighborhood: addressForm.neighborhood,
                    city: addressForm.city,
                    state: addressForm.state,
                    postalCode: addressForm.postalCode,
                    country: 'Brasil',
                    isPrimary: false
                };

                console.log('Creating address...', addressData);
                const addressResponse = await addressesAPI.create(addressData);
                deliveryAddressId = addressResponse.data.data.id;
                console.log('Address created with ID:', deliveryAddressId);
            }

            // Step 2: Create sale from cart
            const saleData = {
                cartId: cartId,
                deliveryAddressId: deliveryAddressId,
                customerNotes: `Pagamento: ${paymentMethod}`
            };

            console.log('Creating sale...', saleData);
            const saleResponse = await salesAPI.create(saleData);
            const saleId = saleResponse.data.data.id;
            console.log('Sale created with ID:', saleId);

            // Step 3: Create payment
            // Find the selected payment method to get its type
            const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethod);
            const isCardPayment = selectedPaymentMethod?.methodType === 'CREDIT_CARD' || selectedPaymentMethod?.methodType === 'DEBIT_CARD';
            
            const paymentData: any = {
                saleId: saleId,
                paymentMethodId: paymentMethod,
                installments: selectedPaymentMethod?.methodType === 'CREDIT_CARD' ? cardForm.installments : 1,
                notes: ''
            };

            // Add card info to notes (in production, this would be sent to a payment gateway)
            if (isCardPayment) {
                paymentData.notes = `Cartão: **** **** **** ${cardForm.cardNumber.slice(-4)} | Titular: ${cardForm.cardholderName} | Validade: ${cardForm.expiryDate}`;
            }

            console.log('Creating payment...', paymentData);
            await paymentsAPI.create(paymentData);
            console.log('Payment created successfully');

            // Clear cart
            console.log('Clearing cart...');
            await clearCart();
            console.log('Cart cleared');

            // Show success message
            showNotification('success', 'Pedido realizado com sucesso!');

            // Redirect to success page
            console.log('Redirecting to success page...');
            navigate(`/checkout/success?orderId=${saleId}`);
        } catch (err: any) {
            console.error('Checkout error:', err);
            console.error('Error response:', err.response);
            setError(
                err.response?.data?.message ||
                'Erro ao finalizar pedido. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Finalizar Compra</h1>

                <div className="checkout-layout">
                    <div className="checkout-form-section">
                        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

                        <form onSubmit={handleSubmit}>
                            {/* Address Section */}
                            <div className="form-section">
                                <h2>Endereço de Entrega</h2>

                                {loadingAddresses ? (
                                    <div style={{ padding: '20px', textAlign: 'center' }}>
                                        <LoadingSpinner size="small" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Saved Addresses */}
                                        {savedAddresses.length > 0 && !showNewAddressForm && (
                                            <div className="saved-addresses">
                                                {savedAddresses.map((address) => (
                                                    <label
                                                        key={address.id}
                                                        className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="savedAddress"
                                                            value={address.id}
                                                            checked={selectedAddressId === address.id}
                                                            onChange={() => setSelectedAddressId(address.id)}
                                                            disabled={loading}
                                                        />
                                                        <div className="address-content">
                                                            <div className="address-header">
                                                                <strong>{address.streetAddress}, {address.number}</strong>
                                                                {address.isPrimary && <span className="primary-badge">Principal</span>}
                                                            </div>
                                                            <div className="address-details">
                                                                {address.complement && <span>{address.complement}</span>}
                                                                <span>{address.neighborhood}</span>
                                                                <span>{address.city} - {address.state}</span>
                                                                <span>CEP: {address.postalCode}</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => setShowNewAddressForm(true)}
                                                    disabled={loading}
                                                >
                                                    + Usar novo endereço
                                                </button>
                                            </div>
                                        )}

                                        {/* New Address Form */}
                                        {(showNewAddressForm || savedAddresses.length === 0) && (
                                            <>
                                                {savedAddresses.length > 0 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-link"
                                                        onClick={() => {
                                                            setShowNewAddressForm(false);
                                                            if (savedAddresses.length > 0) {
                                                                const primaryAddress = savedAddresses.find(addr => addr.isPrimary);
                                                                setSelectedAddressId(primaryAddress?.id || savedAddresses[0].id);
                                                            }
                                                        }}
                                                        disabled={loading}
                                                        style={{ marginBottom: '15px' }}
                                                    >
                                                        ← Voltar para endereços salvos
                                                    </button>
                                                )}

                                                <div className="form-row">
                                                    <div className="form-group flex-3">
                                                        <label htmlFor="street">Rua/Avenida *</label>
                                                        <input
                                                            type="text"
                                                            id="street"
                                                            name="street"
                                                            value={addressForm.street}
                                                            onChange={handleAddressChange}
                                                            disabled={loading}
                                                            required={showNewAddressForm || savedAddresses.length === 0}
                                                        />
                                                    </div>
                                                    <div className="form-group flex-1">
                                                        <label htmlFor="number">Número *</label>
                                                        <input
                                                            type="text"
                                                            id="number"
                                                            name="number"
                                                            value={addressForm.number}
                                                            onChange={handleAddressChange}
                                                            disabled={loading}
                                                            required={showNewAddressForm || savedAddresses.length === 0}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group flex-2">
                                                        <label htmlFor="complement">Complemento</label>
                                                        <input
                                                            type="text"
                                                            id="complement"
                                                            name="complement"
                                                            value={addressForm.complement}
                                                            onChange={handleAddressChange}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <div className="form-group flex-2">
                                                        <label htmlFor="neighborhood">Bairro *</label>
                                                        <input
                                                            type="text"
                                                            id="neighborhood"
                                                            name="neighborhood"
                                                            value={addressForm.neighborhood}
                                                            onChange={handleAddressChange}
                                                            disabled={loading}
                                                            required={showNewAddressForm || savedAddresses.length === 0}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group flex-2">
                                                        <label htmlFor="city">Cidade *</label>
                                                        <input
                                                            type="text"
                                                            id="city"
                                                            name="city"
                                                            value={addressForm.city}
                                                            onChange={handleAddressChange}
                                                            disabled={loading}
                                                            required={showNewAddressForm || savedAddresses.length === 0}
                                                        />
                                                    </div>
                                                    <div className="form-group flex-1">
                                                        <label htmlFor="state">Estado *</label>
                                                        <input
                                                            type="text"
                                                            id="state"
                                                            name="state"
                                                            value={addressForm.state}
                                                            onChange={handleAddressChange}
                                                            maxLength={2}
                                                            disabled={loading}
                                                            required={showNewAddressForm || savedAddresses.length === 0}
                                                        />
                                                    </div>
                                                    <div className="form-group flex-1">
                                                        <label htmlFor="postalCode">CEP *</label>
                                                        <input
                                                            type="text"
                                                            id="postalCode"
                                                            name="postalCode"
                                                            value={addressForm.postalCode}
                                                            onChange={handleAddressChange}
                                                            disabled={loading}
                                                            required={showNewAddressForm || savedAddresses.length === 0}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Payment Section */}
                            <div className="form-section">
                                <h2>Método de Pagamento</h2>

                                {loadingPaymentMethods ? (
                                    <div className="loading-payment-methods">
                                        <LoadingSpinner />
                                        <p>Carregando métodos de pagamento...</p>
                                    </div>
                                ) : paymentMethods.length === 0 ? (
                                    <div className="no-payment-methods">
                                        <p>Nenhum método de pagamento disponível no momento.</p>
                                    </div>
                                ) : (
                                    <div className="payment-methods">
                                        {paymentMethods.map((method) => (
                                            <label
                                                key={method.id}
                                                className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    checked={paymentMethod === method.id}
                                                    onChange={(e) => setPaymentMethod(Number(e.target.value))}
                                                    disabled={loading}
                                                />
                                                <div className="payment-info">
                                                    <span className="payment-icon">{getPaymentIcon(method.methodType)}</span>
                                                    <div>
                                                        <strong>{method.methodName}</strong>
                                                        {method.maxInstallments > 1 ? (
                                                            <p>Parcelamento em até {method.maxInstallments}x</p>
                                                        ) : (
                                                            <p>Pagamento à vista</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Card Details Form - Show when credit/debit card is selected */}
                                {(paymentMethods.find(m => m.id === paymentMethod)?.methodType === 'CREDIT_CARD' || paymentMethods.find(m => m.id === paymentMethod)?.methodType === 'DEBIT_CARD') && (
                                    <div className="card-details-form">
                                        <h3>Dados do Cartão</h3>

                                        <div className="form-row">
                                            <div className="form-group flex-1">
                                                <label htmlFor="cardNumber">Número do Cartão *</label>
                                                <input
                                                    type="text"
                                                    id="cardNumber"
                                                    name="cardNumber"
                                                    value={cardForm.cardNumber}
                                                    onChange={handleCardChange}
                                                    placeholder="1234 5678 9012 3456"
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group flex-1">
                                                <label htmlFor="cardholderName">Nome do Titular *</label>
                                                <input
                                                    type="text"
                                                    id="cardholderName"
                                                    name="cardholderName"
                                                    value={cardForm.cardholderName}
                                                    onChange={handleCardChange}
                                                    placeholder="Nome como está no cartão"
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group flex-1">
                                                <label htmlFor="expiryDate">Validade *</label>
                                                <input
                                                    type="text"
                                                    id="expiryDate"
                                                    name="expiryDate"
                                                    value={cardForm.expiryDate}
                                                    onChange={handleCardChange}
                                                    placeholder="MM/AA"
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group flex-1">
                                                <label htmlFor="cvv">CVV *</label>
                                                <input
                                                    type="text"
                                                    id="cvv"
                                                    name="cvv"
                                                    value={cardForm.cvv}
                                                    onChange={handleCardChange}
                                                    placeholder="123"
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {paymentMethods.find(m => m.id === paymentMethod)?.methodType === 'CREDIT_CARD' && (
                                            <div className="form-row">
                                                <div className="form-group flex-1">
                                                    <label htmlFor="installments">Parcelas</label>
                                                    <select
                                                        id="installments"
                                                        name="installments"
                                                        value={cardForm.installments}
                                                        onChange={handleCardChange}
                                                        disabled={loading}
                                                    >
                                                        <option value={1}>1x de R$ {total.toFixed(2)} sem juros</option>
                                                        <option value={2}>2x de R$ {(total / 2).toFixed(2)} sem juros</option>
                                                        <option value={3}>3x de R$ {(total / 3).toFixed(2)} sem juros</option>
                                                        <option value={4}>4x de R$ {(total / 4).toFixed(2)} sem juros</option>
                                                        <option value={5}>5x de R$ {(total / 5).toFixed(2)} sem juros</option>
                                                        <option value={6}>6x de R$ {(total / 6).toFixed(2)} sem juros</option>
                                                        <option value={7}>7x de R$ {(total / 7).toFixed(2)} sem juros</option>
                                                        <option value={8}>8x de R$ {(total / 8).toFixed(2)} sem juros</option>
                                                        <option value={9}>9x de R$ {(total / 9).toFixed(2)} sem juros</option>
                                                        <option value={10}>10x de R$ {(total / 10).toFixed(2)} sem juros</option>
                                                        <option value={11}>11x de R$ {(total / 11).toFixed(2)} sem juros</option>
                                                        <option value={12}>12x de R$ {(total / 12).toFixed(2)} sem juros</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-large"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner size="small" /> : 'Confirmar Pedido'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-form-section">
                        <div className="form-section">
                            <h2>Resumo do Pedido</h2>

                            <div className="summary-items">
                                {items.map((item) => (
                                    <div key={item.id} className="summary-item">
                                        <img
                                            src={item.productImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EProduto%3C/text%3E%3C/svg%3E'}
                                            alt={item.productName}
                                        />
                                        <div className="item-info">
                                            <p className="item-name">{item.productName}</p>
                                            <p className="item-quantity">Qtd: {item.quantity}</p>
                                        </div>
                                        <p className="item-price">R$ {item.subtotal.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>

                            <div className="summary-line">
                                <span>Frete</span>
                                <span className="free-shipping">Grátis</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>Total</span>
                                <span className="total-amount">R$ {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
