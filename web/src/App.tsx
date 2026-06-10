import { RouterProvider, Route, useRouter } from '@routes/router';
import { MainLayout } from '@components/layout/MainLayout';
import { AdminLayout } from '@components/admin/AdminLayout';
import { HomePage } from '@pages/users/HomePage';
import { ProductListPage } from '@pages/users/ProductListPage';
import { ProductDetailPage } from '@pages/users/ProductDetailPage';
import { CartPage } from '@pages/users/CartPage';
import { CheckoutPage } from '@pages/users/CheckoutPage';
import { WishlistPage } from '@pages/users/WishlistPage';
import { NewsPage } from '@pages/users/NewsPage';
import { NewsDetailPage } from '@pages/users/NewsDetailPage';
import { ContactPage } from '@pages/users/ContactPage';
import { NotFoundPage } from '@pages/users/NotFoundPage';
import { ProfilePage } from '@pages/users/ProfilePage';
import { AddressPage } from '@pages/users/AddressPage';
import { UserOrdersPage } from '@pages/users/OrdersPage';
import { PaymentResultPage } from '@pages/users/PaymentResultPage';
import { LoginPage } from '@pages/auth/Login';
import { RegisterPage } from '@pages/auth/Register';
import { ForgotPasswordPage } from '@pages/auth/ForgotPassword';
import { DashboardPage } from '@pages/admin/DashboardPage';
import { ProductsPage } from '@pages/admin/ProductsPage';
import { OrdersPage } from '@pages/admin/OrdersPage';
import { CustomersPage } from '@pages/admin/CustomersPage';
import { UsersPage } from '@pages/admin/UsersPage';
import { ContentBannersPage } from '@pages/admin/BannersPage';
import { ContentPromotionsPage } from '@pages/admin/PromotionsPage';
import { ContentCategoriesPage } from '@pages/admin/CategoriesPage';
import { ReportsPage } from '@pages/admin/ReportsPage';
import { ReviewsPage } from '@pages/admin/ReviewsPage';
import { QuestionsPage } from '@pages/admin/QuestionsPage';
import { FaqsPage } from '@pages/admin/FaqsPage';
import { ChatPage } from '@pages/admin/ChatPage';
import { Toaster } from 'react-hot-toast';
import './App.css';

function AppContent() {
  const { path } = useRouter();

  // Trích xuất path cơ bản (không tính phần query params)
  const basePath = path.split('?')[0];

  // Auth routes - render without MainLayout
  const authRoutes = ['/login', '/register', '/forgot-password'];
  if (authRoutes.includes(basePath)) {
    return (
      <>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </>
    );
  }

  // Admin routes - render with AdminLayout
  if (basePath.startsWith('/admin')) {
    return (
      <AdminLayout>
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/chat" element={<ChatPage />} />
        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/content/banners" element={<ContentBannersPage />} />
        <Route path="/admin/content/promotions" element={<ContentPromotionsPage />} />
        <Route path="/admin/content/categories" element={<ContentCategoriesPage />} />
        <Route path="/admin/content/faqs" element={<FaqsPage />} />

        {/* Redirect /admin/content to the first sub-page */}
        {basePath === '/admin/content' && <Route path="/admin/content" element={<ContentBannersPage />} />}
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/reviews" element={<ReviewsPage />} />
        <Route path="/admin/questions" element={<QuestionsPage />} />
      </AdminLayout>
    );
  }

  // Kiểm tra xem path hiện tại có hợp lệ không
  const routes = ['/', '/products', '/cart', '/checkout', '/wishlist', '/news', '/contact', '/profile', '/addresses', '/orders', '/payment-result'];
  const isDetailRoute = basePath.startsWith('/product/') && basePath.split('/').length === 3;
  const isNewsDetailRoute = basePath.startsWith('/news/') && basePath.split('/').length === 3;
  const isKnownRoute = routes.includes(basePath) || isDetailRoute || isNewsDetailRoute;

  return (
    <MainLayout>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/news/:slug" element={<NewsDetailPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/addresses" element={<AddressPage />} />
      <Route path="/orders" element={<UserOrdersPage />} />
      <Route path="/payment-result" element={<PaymentResultPage />} />
      {!isKnownRoute && <NotFoundPage />}
    </MainLayout>
  );
}

function App() {
  return (
    <>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '12px 24px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
