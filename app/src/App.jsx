import { Navigate, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import AppNavbar from "./components/AppNavbar";
import UsersView from "./views/UsersView";
import UserFormView from "./views/UserFormView";
import ProductsView from "./views/ProductsView";
import ProductFormView from "./views/ProductFormView";
import CategoriesView from "./views/CategoriesView";
import CategoryFormView from "./views/CategoryFormView";
import NotFoundView from "./views/NotFoundView";
import ContactUs from "./views/ContactUs";
import SuppliersView from "./views/SuppliersView";
import SupplierFormView from "./views/SupplierFormView";
import OrdersView from "./views/OrdersView";
import OrderFormView from "./views/OrderFormView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <>
      <AppNavbar />
      <Container className="pb-5">
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
          </Route>
          {/* everything below needs a logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/users" replace />} />
            <Route path="/users" element={<UsersView />} />
            <Route path="/users/new" element={<UserFormView />} />
            <Route path="/users/:id/edit" element={<UserFormView />} />
            <Route path="/products" element={<ProductsView />} />
            <Route path="/products/new" element={<ProductFormView />} />
            <Route path="/products/:id/edit" element={<ProductFormView />} />
            <Route path="/suppliers" element={<SuppliersView />} />
            <Route path="/suppliers/new" element={<SupplierFormView />} />
            <Route path="/suppliers/:id/edit" element={<SupplierFormView />} />
            <Route path="/orders" element={<OrdersView />} />
            <Route path="/orders/new" element={<OrderFormView />} />
            <Route path="/orders/:id/edit" element={<OrderFormView />} />
            <Route path="/categories" element={<CategoriesView />} />
            <Route path="/categories/new" element={<CategoryFormView />} />
            <Route path="/categories/:id/edit" element={<CategoryFormView />} />
          </Route>
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
