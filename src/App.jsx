import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminSidebar from './components/AdminSidebar'

import Home from './pages/Home'
import Products from './pages/Products'
import Category from './pages/Category'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Wishlist from './pages/Wishlist'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/Admin/Dashboard'
import AdminProducts from './pages/Admin/Products'
import AdminProductForm from './pages/Admin/ProductForm'
import AdminOrders from './pages/Admin/Orders'
import AdminOrderDetails from './pages/Admin/AdminOrderDetails'
import AdminUsers from './pages/Admin/Users'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function StoreLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 bg-paper">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
        <Route path="/products" element={<StoreLayout><Products /></StoreLayout>} />
        <Route path="/products/:id" element={<StoreLayout><ProductDetails /></StoreLayout>} />
        <Route path="/category/:slug" element={<StoreLayout><Category /></StoreLayout>} />
        <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
        <Route path="/checkout" element={<StoreLayout><Checkout /></StoreLayout>} />
        <Route path="/login" element={<StoreLayout><Login /></StoreLayout>} />
        <Route path="/register" element={<StoreLayout><Register /></StoreLayout>} />
        <Route path="/forgot-password" element={<StoreLayout><ForgotPassword /></StoreLayout>} />
        <Route path="/reset-password" element={<StoreLayout><ResetPassword /></StoreLayout>} />

        <Route path="/profile" element={<StoreLayout><ProtectedRoute><Profile /></ProtectedRoute></StoreLayout>} />
        <Route path="/orders" element={<StoreLayout><ProtectedRoute><Orders /></ProtectedRoute></StoreLayout>} />
        <Route path="/orders/:id" element={<StoreLayout><ProtectedRoute><OrderDetails /></ProtectedRoute></StoreLayout>} />
        <Route path="/wishlist" element={<StoreLayout><ProtectedRoute><Wishlist /></ProtectedRoute></StoreLayout>} />

        <Route path="/admin" element={<AdminLayout><AdminRoute><AdminDashboard /></AdminRoute></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><AdminRoute><AdminProducts /></AdminRoute></AdminLayout>} />
        <Route path="/admin/products/new" element={<AdminLayout><AdminRoute><AdminProductForm /></AdminRoute></AdminLayout>} />
        <Route path="/admin/products/:id/edit" element={<AdminLayout><AdminRoute><AdminProductForm /></AdminRoute></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><AdminRoute><AdminOrders /></AdminRoute></AdminLayout>} />
        <Route path="/admin/orders/:id" element={<AdminLayout><AdminRoute><AdminOrderDetails /></AdminRoute></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><AdminRoute><AdminUsers /></AdminRoute></AdminLayout>} />

        <Route path="*" element={<StoreLayout><NotFound /></StoreLayout>} />
      </Routes>
    </>
  )
}
