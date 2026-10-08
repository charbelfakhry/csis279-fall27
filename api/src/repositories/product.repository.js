const pool = require("../config/db");

const productColumns = `
        id,
        name,
        description,
        price::float AS price,
        quantity,
        category_id AS "categoryId",
        created_at AS "createdAt"
`;

const findAll = async() =>{
    const result = await pool.query(
        `SELECT ${productColumns}
        FROM products
        ORDER BY id
        `
    );

    return result.rows;
}

const findById = async(id) =>{
    const result = await pool.query(
        `SELECT ${productColumns}
        FROM products
        WHERE id = $1
        `, [id]
    );

    return result.rows[0];
}

const create = async(product) =>{
    const {name, description, price, quantity, categoryId} = product;

    const result = await pool.query(
        `INSERT INTO products (name, description, price, quantity, category_id) 
        VALUES($1, $2, $3, $4, $5)
        RETURNING ${productColumns}`,
        [name, description, price, quantity, categoryId ?? null]);

    return result.rows[0];
}

const update = async(id, product) =>{
    const {name, description, price, quantity, categoryId} = product;

    const result = await pool.query(
        `UPDATE products SET name = $1, 
        description = $2, 
        price = $3, 
        quantity = $4,
        category_id = $5
        WHERE id = $6
        RETURNING ${productColumns}`,
        [name, description, price, quantity, categoryId ?? null, id]);

    return result.rows[0];
}

const remove = async(id) =>{
    const result = await pool.query(
        `DELETE FROM products
        WHERE id = $1
        RETURNING ${productColumns}`,
        [id]
    );

    return result.rows[0]
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
}
