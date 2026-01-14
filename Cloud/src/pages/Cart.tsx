import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Cart.css';

function Cart() {
    const { items, itemCount, total, subtotal, discount, appliedCoupon, loading, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
    const { isAuthenticated } = useAuth();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Digite um código de cupom');
            return;
        }

        try {
            setApplyingCoupon(true);
            setCouponError('');
            await applyCoupon(couponCode.trim().toUpperCase());
            setCouponCode('');
        } catch (error: any) {
            setCouponError(error.message || 'Cupom inválido');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponCode('');
        setCouponError('');
    };

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        try {
            await updateQuantity(itemId, newQuantity);
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (window.confirm('Deseja remover este item do carrinho?')) {
            try {
                await removeItem(itemId);
            } catch (error) {
                console.error('Error removing item:', error);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (items.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <h1>Meu Carrinho</h1>
                    <div className="cart-empty">
                        <div className="empty-icon">🛒</div>
                        <h3>Seu carrinho está vazio</h3>
                        <p>Adicione produtos para começar suas compras</p>
                        <Link to="/products" className="btn btn-primary">Ver Produtos</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1>Meu Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</h1>

                <div className="cart-layout">
                    <div className="cart-items">
                        {items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="item-image">
                                    <img
                                        src={item.productImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EProduto%3C/text%3E%3C/svg%3E'}
                                        alt={item.productName}
                                    />
                                </div>

                                <div className="item-details">
                                    <h3 className="item-name">{item.productName}</h3>
                                    <p className="item-price">R$ {item.unitPrice.toFixed(2)}</p>
                                </div>

                                <div className="item-quantity">
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                        disabled={loading}
                                    >
                                        -
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        disabled={loading}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="item-total">
                                    <p className="total-label">Total</p>
                                    <p className="total-value">R$ {item.subtotal.toFixed(2)}</p>
                                </div>

                                <button
                                    className="item-remove"
                                    onClick={() => handleRemoveItem(item.id)}
                                    disabled={loading}
                                    title="Remover item"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Resumo do Pedido</h2>

                        {/* Coupon Section */}
                        <div className="coupon-section">
                            <h3>Cupom de Desconto</h3>
                            {appliedCoupon ? (
                                <div className="coupon-applied">
                                    <div className="coupon-info">
                                        <span className="coupon-code">🎫 {appliedCoupon.code}</span>
                                        <span className="coupon-discount">
                                            {appliedCoupon.type === 'PERCENTAGE'
                                                ? `-${appliedCoupon.discount}%`
                                                : `-R$ ${appliedCoupon.discount.toFixed(2)}`
                                            }
                                        </span>
                                    </div>
                                    <button
                                        className="btn-remove-coupon"
                                        onClick={handleRemoveCoupon}
                                    >
                                        Remover
                                    </button>
                                </div>
                            ) : (
                                <div className="coupon-input-group">
                                    <input
                                        type="text"
                                        className="coupon-input"
                                        placeholder="Digite o cupom"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={applyingCoupon}
                                    />
                                    <button
                                        className="btn-apply-coupon"
                                        onClick={handleApplyCoupon}
                                        disabled={applyingCoupon || !couponCode.trim()}
                                    >
                                        {applyingCoupon ? 'Aplicando...' : 'Aplicar'}
                                    </button>
                                </div>
                            )}
                            {couponError && <p className="coupon-error">{couponError}</p>}
                        </div>

                        <div className="summary-line">
                            <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                        </div>

                        {discount > 0 && (
                            <div className="summary-line discount-line">
                                <span>Desconto</span>
                                <span className="discount-value">-R$ {discount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="summary-line">
                            <span>Frete</span>
                            <span className="free-shipping">Grátis</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>Total</span>
                            <span className="total-amount">R$ {total.toFixed(2)}</span>
                        </div>

                        {isAuthenticated ? (
                            <Link to="/checkout" className="btn btn-primary btn-block">
                                Finalizar Compra
                            </Link>
                        ) : (
                            <div className="checkout-warning">
                                <p>Faça login para finalizar sua compra</p>
                                <Link to="/login" className="btn btn-primary btn-block">
                                    Fazer Login
                                </Link>
                            </div>
                        )}

                        <Link to="/products" className="btn btn-outline btn-block">
                            Continuar Comprando
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;

