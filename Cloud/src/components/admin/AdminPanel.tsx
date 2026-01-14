import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminDashboard from './AdminDashboard';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import SizeList from './SizeList';
import SizeForm from './SizeForm';
import ColorList from './ColorList';
import ColorForm from './ColorForm';
import UserList from './UserList';
import UserForm from './UserForm';
import SalesList from './SalesList';
import SaleDetail from './SaleDetail';
import WholesalerList from './WholesalerList';
import WholesalerDetail from './WholesalerDetail';
import WholesaleOrdersList from './WholesaleOrdersList';
import WholesaleOrderDetail from './WholesaleOrderDetail';
import StockManagementGrid from './StockManagementGrid';
import StockEntryGrid from './StockEntryGrid';
import Reports from './Reports';
import Settings from './Settings';
import ReviewsList from './ReviewsList';
import PriceTableList from './PriceTableList';
import PriceTableForm from './PriceTableForm';
import PriceTableItemsList from './PriceTableItemsList';
import PaymentMethodList from './PaymentMethodList';
import PaymentMethodForm from './PaymentMethodForm';
import CompanyList from './CompanyList';
import CompanyForm from './CompanyForm';
import Modal from '../common/Modal';
import type { PriceTable } from '../../types/priceTable';
import './AdminPanel.css';

interface AdminPanelProps {
    onLogout: () => void;
}

function AdminPanel({ onLogout }: AdminPanelProps) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [showProductForm, setShowProductForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showSizeForm, setShowSizeForm] = useState(false);
    const [showColorForm, setShowColorForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | undefined>();
    const [editingCategoryId, setEditingCategoryId] = useState<number | undefined>();
    const [editingSizeId, setEditingSizeId] = useState<number | undefined>();
    const [editingColorId, setEditingColorId] = useState<number | undefined>();
    const [editingUserId, setEditingUserId] = useState<number | undefined>();
    const [selectedWholesaler, setSelectedWholesaler] = useState<any | null>(null);
    const [selectedSaleId, setSelectedSaleId] = useState<number | undefined>();
    const [selectedWholesaleOrderId, setSelectedWholesaleOrderId] = useState<number | undefined>();
    const [showPriceTableForm, setShowPriceTableForm] = useState(false);
    const [editingPriceTable, setEditingPriceTable] = useState<PriceTable | null>(null);
    const [viewingPriceTableItems, setViewingPriceTableItems] = useState<PriceTable | null>(null);
    const [showPaymentMethodForm, setShowPaymentMethodForm] = useState(false);
    const [editingPaymentMethodId, setEditingPaymentMethodId] = useState<number | undefined>();
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<string | undefined>();
    const navigate = useNavigate();

    console.log('AdminPanel - editingProductId:', editingProductId, 'showProductForm:', showProductForm);

    const handleNavigation = (view: string) => {
        setCurrentView(view);
    };

    const handleBackToSite = () => {
        navigate('/');
    };

    // Product handlers
    const handleCreateProduct = () => {
        setEditingProductId(undefined);
        setShowProductForm(true);
    };

    const handleEditProduct = (productId: number) => {
        console.log('handleEditProduct called with productId:', productId);
        setEditingProductId(productId);
        setShowProductForm(true);
    };

    const handleEditVariants = (productId: number) => {
        navigate(`/admin/products/${productId}/variants`);
    };

    const handleProductFormSuccess = () => {
        setShowProductForm(false);
        setEditingProductId(undefined);
        // Trigger reload by re-rendering
        setCurrentView('products-reload');
        setTimeout(() => setCurrentView('products'), 0);
    };

    const handleProductFormCancel = () => {
        setShowProductForm(false);
        setEditingProductId(undefined);
    };

    // Category handlers
    const handleCreateCategory = () => {
        setEditingCategoryId(undefined);
        setShowCategoryForm(true);
    };

    const handleEditCategory = (categoryId: number) => {
        setEditingCategoryId(categoryId);
        setShowCategoryForm(true);
    };

    const handleCategoryFormSuccess = () => {
        setShowCategoryForm(false);
        setEditingCategoryId(undefined);
        setCurrentView('categories-reload');
        setTimeout(() => setCurrentView('categories'), 0);
    };

    const handleCategoryFormCancel = () => {
        setShowCategoryForm(false);
        setEditingCategoryId(undefined);
    };

    // User handlers
    const handleCreateUser = () => {
        setEditingUserId(undefined);
        setShowUserForm(true);
    };

    const handleEditUser = (userId: number) => {
        setEditingUserId(userId);
        setShowUserForm(true);
    };

    const handleUserFormSuccess = () => {
        setShowUserForm(false);
        setEditingUserId(undefined);
        // Add small delay to ensure backend has saved
        setTimeout(() => {
            setCurrentView('users-reload');
            setTimeout(() => setCurrentView('users'), 0);
        }, 300);
    };

    const handleUserFormCancel = () => {
        setShowUserForm(false);
        setEditingUserId(undefined);
    };

    // Wholesaler handlers
    const handleViewWholesalerDetails = (wholesaler: any) => {
        setSelectedWholesaler(wholesaler);
    };

    const handleCloseWholesalerDetails = () => {
        setSelectedWholesaler(null);
    };

    const handleWholesalerUpdate = () => {
        setCurrentView('wholesalers-reload');
        setTimeout(() => setCurrentView('wholesalers'), 0);
    };

    // Size handlers
    const handleCreateSize = () => {
        setEditingSizeId(undefined);
        setShowSizeForm(true);
    };

    const handleEditSize = (sizeId: number) => {
        setEditingSizeId(sizeId);
        setShowSizeForm(true);
    };

    const handleSizeFormSuccess = () => {
        setShowSizeForm(false);
        setEditingSizeId(undefined);
        setCurrentView('sizes-reload');
        setTimeout(() => setCurrentView('sizes'), 0);
    };

    const handleSizeFormCancel = () => {
        setShowSizeForm(false);
        setEditingSizeId(undefined);
    };

    // Color handlers
    const handleCreateColor = () => {
        setEditingColorId(undefined);
        setShowColorForm(true);
    };

    const handleEditColor = (colorId: number) => {
        setEditingColorId(colorId);
        setShowColorForm(true);
    };

    const handleColorFormSuccess = () => {
        setShowColorForm(false);
        setEditingColorId(undefined);
        setCurrentView('colors-reload');
        setTimeout(() => setCurrentView('colors'), 0);
    };

    const handleColorFormCancel = () => {
        setShowColorForm(false);
        setEditingColorId(undefined);
    };

    // Sale handlers
    const handleViewSaleDetail = (saleId: number) => {
        setSelectedSaleId(saleId);
    };

    const handleCloseSaleDetail = () => {
        setSelectedSaleId(undefined);
    };

    // Wholesale Order handlers
    const handleViewWholesaleOrderDetail = (orderId: number) => {
        setSelectedWholesaleOrderId(orderId);
    };

    const handleCloseWholesaleOrderDetail = () => {
        setSelectedWholesaleOrderId(undefined);
    };

    const handleWholesaleOrderUpdate = () => {
        setCurrentView('wholesale-orders-reload');
        setTimeout(() => setCurrentView('wholesale-orders'), 0);
    };

    // Price Table handlers
    const handleCreatePriceTable = () => {
        setEditingPriceTable(null);
        setShowPriceTableForm(true);
    };

    const handleEditPriceTable = (table: PriceTable) => {
        setEditingPriceTable(table);
        setShowPriceTableForm(true);
    };

    const handlePriceTableFormSuccess = () => {
        setShowPriceTableForm(false);
        setEditingPriceTable(null);
        setCurrentView('price-tables-reload');
        setTimeout(() => setCurrentView('price-tables'), 0);
    };

    const handlePriceTableFormCancel = () => {
        setShowPriceTableForm(false);
        setEditingPriceTable(null);
    };

    const handleViewPriceTableItems = (table: PriceTable) => {
        setViewingPriceTableItems(table);
    };

    const handleBackFromItems = () => {
        setViewingPriceTableItems(null);
    };

    // Payment Method handlers
    const handleCreatePaymentMethod = () => {
        setEditingPaymentMethodId(undefined);
        setShowPaymentMethodForm(true);
    };

    const handleEditPaymentMethod = (id: number) => {
        setEditingPaymentMethodId(id);
        setShowPaymentMethodForm(true);
    };

    const handlePaymentMethodFormSuccess = () => {
        setShowPaymentMethodForm(false);
        setEditingPaymentMethodId(undefined);
        setCurrentView('payment-methods-reload');
        setTimeout(() => setCurrentView('payment-methods'), 0);
    };

    const handlePaymentMethodFormCancel = () => {
        setShowPaymentMethodForm(false);
        setEditingPaymentMethodId(undefined);
    };

    // Company handlers
    const handleCreateCompany = () => {
        setEditingCompanyId(undefined);
        setShowCompanyForm(true);
    };

    const handleEditCompany = (companyId: string) => {
        setEditingCompanyId(companyId);
        setShowCompanyForm(true);
    };

    const handleCompanyFormSuccess = () => {
        setShowCompanyForm(false);
        setEditingCompanyId(undefined);
        setCurrentView('companies-reload');
        setTimeout(() => setCurrentView('companies'), 0);
    };

    const handleCompanyFormCancel = () => {
        setShowCompanyForm(false);
        setEditingCompanyId(undefined);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'products':
            case 'products-reload':
                return (
                    <ProductList
                        onEdit={handleEditProduct}
                        onEditVariants={handleEditVariants}
                        onCreateNew={handleCreateProduct}
                    />
                );
            case 'categories':
            case 'categories-reload':
                return (
                    <CategoryList
                        onEdit={handleEditCategory}
                        onCreateNew={handleCreateCategory}
                    />
                );
            case 'sizes':
            case 'sizes-reload':
                return (
                    <SizeList
                        key={currentView}
                        onEdit={handleEditSize}
                        onCreateNew={handleCreateSize}
                    />
                );
            case 'colors':
            case 'colors-reload':
                return (
                    <ColorList
                        key={currentView}
                        onEdit={handleEditColor}
                        onCreateNew={handleCreateColor}
                    />
                );
            case 'users':
            case 'users-reload':
                return <UserList key={currentView} onEdit={handleEditUser} onCreateNew={handleCreateUser} />;
            case 'companies':
            case 'companies-reload':
                return (
                    <CompanyList
                        key={currentView}
                        onEdit={handleEditCompany}
                        onCreateNew={handleCreateCompany}
                    />
                );
            case 'wholesalers':
            case 'wholesalers-reload':
                return selectedWholesaler ? (
                    <WholesalerDetail
                        wholesaler={selectedWholesaler}
                        onClose={handleCloseWholesalerDetails}
                        onUpdate={handleWholesalerUpdate}
                    />
                ) : (
                    <WholesalerList key={currentView} onViewDetails={handleViewWholesalerDetails} />
                );
            case 'stock':
            case 'stock-reload':
                return <StockManagementGrid key={currentView} />;
            case 'stock-entry':
            case 'stock-entry-reload':
                return <StockEntryGrid key={currentView} onSuccess={() => {
                    setCurrentView('stock-entry-reload');
                    setTimeout(() => setCurrentView('stock-entry'), 0);
                }} />;
            case 'sales':
                return selectedSaleId ? (
                    <SaleDetail saleId={selectedSaleId} onClose={handleCloseSaleDetail} />
                ) : (
                    <SalesList onViewDetails={handleViewSaleDetail} />
                );
            case 'wholesale-orders':
            case 'wholesale-orders-reload':
                return selectedWholesaleOrderId ? (
                    <WholesaleOrderDetail
                        orderId={selectedWholesaleOrderId}
                        onClose={handleCloseWholesaleOrderDetail}
                        onUpdate={handleWholesaleOrderUpdate}
                    />
                ) : (
                    <WholesaleOrdersList
                        key={currentView}
                        onViewDetail={handleViewWholesaleOrderDetail}
                    />
                );
            case 'reports':
                return <Reports />;
            case 'reviews':
                return <ReviewsList />;
            case 'price-tables':
            case 'price-tables-reload':
                return viewingPriceTableItems ? (
                    <PriceTableItemsList
                        table={viewingPriceTableItems}
                        onBack={handleBackFromItems}
                    />
                ) : (
                    <PriceTableList
                        key={currentView}
                        onEdit={handleEditPriceTable}
                        onViewItems={handleViewPriceTableItems}
                    />
                );
            case 'payment-methods':
            case 'payment-methods-reload':
                return (
                    <PaymentMethodList
                        key={currentView}
                        onEdit={handleEditPaymentMethod}
                        onCreateNew={handleCreatePaymentMethod}
                    />
                );
            case 'settings':
                return <Settings />;
            default:
                return <AdminDashboard onNavigate={handleNavigation} onEditProduct={handleEditProduct} />;
        }
    };

    return (
        <div className="admin-panel">
            <AdminHeader
                currentView={currentView}
                onNavigate={handleNavigation}
                onBackToSite={handleBackToSite}
                onLogout={onLogout}
            />

            <div className="admin-content">
                {renderContent()}
            </div>

            {/* Product Form Modal */}
            <Modal
                isOpen={showProductForm}
                onClose={handleProductFormCancel}
                closeOnOverlayClick={false}
                showCloseButton={false}
            >
                <ProductForm
                    key={editingProductId || 'new'}
                    productId={editingProductId}
                    onSuccess={handleProductFormSuccess}
                    onCancel={handleProductFormCancel}
                />
            </Modal>

            {/* Category Form Modal */}
            <Modal
                isOpen={showCategoryForm}
                onClose={handleCategoryFormCancel}
                closeOnOverlayClick={false}
                showCloseButton={false}
            >
                <CategoryForm
                    categoryId={editingCategoryId}
                    onSuccess={handleCategoryFormSuccess}
                    onCancel={handleCategoryFormCancel}
                />
            </Modal>

            {/* User Form Modal */}
            <Modal
                isOpen={showUserForm}
                onClose={handleUserFormCancel}
                closeOnOverlayClick={false}
                showCloseButton={false}
            >
                <UserForm
                    userId={editingUserId}
                    onSuccess={handleUserFormSuccess}
                    onCancel={handleUserFormCancel}
                />
            </Modal>



            {/* Size Form Modal */}
            <Modal
                isOpen={showSizeForm}
                onClose={handleSizeFormCancel}
                closeOnOverlayClick={false}
                showCloseButton={false}
            >
                <SizeForm
                    sizeId={editingSizeId}
                    onSuccess={handleSizeFormSuccess}
                    onCancel={handleSizeFormCancel}
                />
            </Modal>

            {/* Color Form Modal */}
            <Modal
                isOpen={showColorForm}
                onClose={handleColorFormCancel}
                closeOnOverlayClick={false}
                showCloseButton={false}
            >
                <ColorForm
                    colorId={editingColorId}
                    onSuccess={handleColorFormSuccess}
                    onCancel={handleColorFormCancel}
                />
            </Modal>

            {/* Price Table Form Modal */}
            <Modal
                isOpen={showPriceTableForm}
                onClose={handlePriceTableFormCancel}
                closeOnOverlayClick={false}
            >
                <PriceTableForm
                    table={editingPriceTable}
                    onSave={handlePriceTableFormSuccess}
                    onCancel={handlePriceTableFormCancel}
                />
            </Modal>

            {/* Payment Method Form Modal */}
            <Modal
                isOpen={showPaymentMethodForm}
                onClose={handlePaymentMethodFormCancel}
                closeOnOverlayClick={false}
                showCloseButton={false}
            >
                <PaymentMethodForm
                    paymentMethodId={editingPaymentMethodId}
                    onSuccess={handlePaymentMethodFormSuccess}
                    onCancel={handlePaymentMethodFormCancel}
                />
            </Modal>

            {/* Company Form Modal */}
            <Modal
                isOpen={showCompanyForm}
                onClose={handleCompanyFormCancel}
                closeOnOverlayClick={false}
                showCloseButton={false}
            >
                <CompanyForm
                    companyId={editingCompanyId}
                    onSuccess={handleCompanyFormSuccess}
                    onCancel={handleCompanyFormCancel}
                />
            </Modal>
        </div>
    );
}

export default AdminPanel;
