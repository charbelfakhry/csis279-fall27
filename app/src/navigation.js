// pages in the navbar, each shown only to users with its permission
const navItems = [
    { to: "/users", label: "Users", permission: "users:read" },
    { to: "/products", label: "Products", permission: "products:read" },
    { to: "/categories", label: "Categories", permission: "categories:read" },
    { to: "/suppliers", label: "Suppliers", permission: "suppliers:read" },
    { to: "/orders", label: "Orders", permission: "orders:read" },
    { to: "/roles", label: "Roles", permission: "roles:read" }
];

export default navItems;
