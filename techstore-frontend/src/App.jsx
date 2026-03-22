import { BrowserRouter, Routes, Route } from 'react-router-dom'

// ─── Layout y navegación ──────────────────────────────────────────────────────
import Header    from './components/layout/Header.jsx'
import Footer    from './components/layout/Footer.jsx'
import AuthModal from './components/ui/AuthModal.jsx'

// ─── Providers ────────────────────────────────────────────────────────────────
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

// ─── Páginas de la tienda ─────────────────────────────────────────────────────
import Home              from './pages/Home.jsx'
import ProductList       from './pages/ProductList.jsx'
import ProductDetail     from './pages/ProductDetail.jsx'
import ShopCart          from './pages/ShopCart.jsx'
import Payment           from './pages/Payment.jsx'
import OrderConfirmation from './pages/OrderConfirmation.jsx'
import PCConfigurator    from './pages/PCConfigurator.jsx'
import Profile           from './pages/Profile.jsx'
import MyOrders          from './pages/MyOrders.jsx'
import Favorites         from './pages/Favorites.jsx'
import AboutUs           from './pages/AboutUs.jsx'
import Contact           from './pages/Contact.jsx'
import FAQ               from './pages/FAQ.jsx'
import NotFound          from './pages/NotFound.jsx'

// ─── Panel de administración (desde features/) ────────────────────────────────
import {
  AdminLayout,
  AdminDashboard,
  AdminProducts,
  AdminCategories,
  AdminOrders,
  AdminUsers,
} from './features/admin/index.js'

// ─── Layout público de la tienda ─────────────────────────────────────────────
function StoreLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-x-hidden antialiased">
      <Header />
      <AuthModal />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/"             element={<Home />}              />
          <Route path="/productos"    element={<ProductList />}       />
          <Route path="/producto/:id" element={<ProductDetail />}     />
          <Route path="/carrito"      element={<ShopCart />}          />
          <Route path="/pago"         element={<Payment />}           />
          <Route path="/confirmacion" element={<OrderConfirmation />} />
          <Route path="/configurador" element={<PCConfigurator />}    />
          <Route path="/perfil"       element={<Profile />}           />
          <Route path="/pedidos"      element={<MyOrders />}          />
          <Route path="/favoritos"    element={<Favorites />}         />
          <Route path="/nosotros"     element={<AboutUs />}           />
          <Route path="/contacto"     element={<Contact />}           />
          <Route path="/soporte"      element={<FAQ />}               />
          <Route path="*"             element={<NotFound />}          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Panel admin — layout propio, sin Header/Footer de la tienda */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index             element={<AdminDashboard  />} />
              <Route path="productos"  element={<AdminProducts   />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="pedidos"    element={<AdminOrders     />} />
              <Route path="usuarios"   element={<AdminUsers      />} />
            </Route>

            {/* Tienda — layout público */}
            <Route path="/*" element={<StoreLayout />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
