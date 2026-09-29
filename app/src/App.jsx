import { Navigate, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import AppNavbar from "./components/AppNavbar";
import UserViews from "./views/UsersView";
import ProductsView from "./views/ProductsView";
import ProductFormView from "./views/ProductFormView";
import NotFoundView from "./views/NotFoundView";
import ContactUs from "./views/ContuctUs";

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
          <Route path="/contactus" element={ContactUs} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
