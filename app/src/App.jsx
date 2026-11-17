import { Route, Routes } from "react-router-dom";
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
import PermissionRoute from "./components/PermissionRoute";
import HomeView from "./views/HomeView";
import RolesView from "./views/RolesView";
import RoleFormView from "./views/RoleFormView";
import UserRolesView from "./views/UserRolesView";

// each page and the permission needed to open it (the API checks the same permissions)
const pages = [
  { path: "/users", element: <UsersView />, permission: "users:read" },
  { path: "/users/new", element: <UserFormView />, permission: "users:create" },
  { path: "/users/:id/edit", element: <UserFormView />, permission: "users:update" },
  { path: "/users/:id/roles", element: <UserRolesView />, permission: "roles:manage" },
  { path: "/products", element: <ProductsView />, permission: "products:read" },
  { path: "/products/new", element: <ProductFormView />, permission: "products:create" },
  { path: "/products/:id/edit", element: <ProductFormView />, permission: "products:update" },
  { path: "/suppliers", element: <SuppliersView />, permission: "suppliers:read" },
  { path: "/suppliers/new", element: <SupplierFormView />, permission: "suppliers:create" },
  { path: "/suppliers/:id/edit", element: <SupplierFormView />, permission: "suppliers:update" },
  { path: "/orders", element: <OrdersView />, permission: "orders:read" },
  { path: "/orders/new", element: <OrderFormView />, permission: "orders:create" },
  { path: "/orders/:id/edit", element: <OrderFormView />, permission: "orders:update" },
  { path: "/categories", element: <CategoriesView />, permission: "categories:read" },
  { path: "/categories/new", element: <CategoryFormView />, permission: "categories:create" },
  { path: "/categories/:id/edit", element: <CategoryFormView />, permission: "categories:update" },
  { path: "/roles", element: <RolesView />, permission: "roles:read" },
  { path: "/roles/new", element: <RoleFormView />, permission: "roles:manage" },
  { path: "/roles/:id/edit", element: <RoleFormView />, permission: "roles:manage" }
];

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
            <Route path="/" element={<HomeView />} />
            {
              pages.map(({ path, element, permission }) => (
                <Route key={path} element={<PermissionRoute permission={permission} />}>
                  <Route path={path} element={element} />
                </Route>
              ))
            }
          </Route>
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
