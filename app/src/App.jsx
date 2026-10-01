import { Navigate, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import AppNavbar from "./components/AppNavbar";
import UserViews from "./views/UsersView";
import ProductsView from "./views/ProductsView";
import ProductFormView from "./views/ProductFormView";
import CategoriesView from "./views/CategoriesView";
import CategoryFormView from "./views/CategoryFormView";
import NotFoundView from "./views/NotFoundView";
import ContactUs from "./views/ContactUs";

function App() {
  return (
    <>
      <AppNavbar />
      <Container>
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UserViews />} />
          <Route path="/products" element={<ProductsView />} />
          <Route path="/products/new" element={<ProductFormView />} />
          <Route path="/products/:id/edit" element={<ProductFormView />} />
          <Route path="/categories" element={<CategoriesView />} />
          <Route path="/categories/new" element={<CategoryFormView />} />
          <Route path="/categories/:id/edit" element={<CategoryFormView />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
