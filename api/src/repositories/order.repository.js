const pool = require("../config/db");

const orderColumns = `
        order_id AS id,
        product_id AS "productId",
        quantity,
        unit_price::float AS "unitPrice"
`;

const findAll = async() =>{
    const result = await pool.query(
        `SELECT ${orderColumns}
        FROM orders
        ORDER BY order_id
        `
    );

    return result.rows;
}

const findById = async(id) =>{
    const result = await pool.query(
        `SELECT ${orderColumns}
        FROM orders
        WHERE order_id = $1
        `, [id]
    );

    return result.rows[0];
}

// unit_price defaults to the product's current price so the order keeps it even if the price changes later
const create = async(order) =>{
    const {productId, quantity, unitPrice} = order;

    const result = await pool.query(
        `INSERT INTO orders (product_id, quantity, unit_price)
        SELECT id, $2, COALESCE($3, price)
        FROM products
        WHERE id = $1
        RETURNING ${orderColumns}`,
        [productId, quantity, unitPrice ?? null]);

    return result.rows[0];
}

const update = async(id, order) =>{
    const {productId, quantity, unitPrice} = order;

    const result = await pool.query(
        `UPDATE orders SET product_id = $1,
        quantity = $2,
        unit_price = COALESCE($3, (SELECT price FROM products WHERE id = $1))
        WHERE order_id = $4
        RETURNING ${orderColumns}`,
        [productId, quantity, unitPrice ?? null, id]);

    return result.rows[0];
}

const remove = async(id) =>{
    const result = await pool.query(
        `DELETE FROM orders
        WHERE order_id = $1
        RETURNING ${orderColumns}`,
        [id]
    );

    return result.rows[0];
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
}
