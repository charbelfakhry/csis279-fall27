import graphqlFetch from "./graphqlFetch";

const ORDER = `id productId productName quantity unitPrice`;

// GraphQL rejects fields the schema doesn't know, so only send the ones it expects
const toInput = (order) => ({
    productId: order.productId,
    quantity: order.quantity,
    unitPrice: order.unitPrice
});

export const getOrders = async () => {
    const data = await graphqlFetch(`query Orders { orders { ${ORDER} } }`);
    return data.orders;
}

export const getOrderById = async (id) => {
    const data = await graphqlFetch(
        `query Order($id: Int!) { order(id: $id) { ${ORDER} } }`,
        { id: Number(id) }
    );
    return data.order;
}

export const createOrder = async (order) => {
    const data = await graphqlFetch(
        `mutation CreateOrder($input: OrderInput!) { createOrder(input: $input) { ${ORDER} } }`,
        { input: toInput(order) }
    );
    return data.createOrder;
}

export const updateOrder = async (id, order) => {
    const data = await graphqlFetch(
        `mutation UpdateOrder($id: Int!, $input: OrderInput!) { updateOrder(id: $id, input: $input) { ${ORDER} } }`,
        { id: Number(id), input: toInput(order) }
    );
    return data.updateOrder;
}

export const deleteOrder = async (id) => {
    const data = await graphqlFetch(
        `mutation DeleteOrder($id: Int!) { deleteOrder(id: $id) }`,
        { id: Number(id) }
    );
    return data.deleteOrder;
}
