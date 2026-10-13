const pool = require("../config/db");

const supplierColumns = `
        supplier_id AS id,
        name,
        email,
        phone,
        created_at AS "createdAt"
`;

const findAll = async() =>{
    const result = await pool.query(
        `SELECT ${supplierColumns}
        FROM supplier
        ORDER BY supplier_id
        `
    );

    return result.rows;
}

const findById = async(id) =>{
    const result = await pool.query(
        `SELECT ${supplierColumns}
        FROM supplier
        WHERE supplier_id = $1
        `, [id]
    );

    return result.rows[0];
}

const create = async(supplier) =>{
    const {name, email, phone} = supplier;

    const result = await pool.query(
        `INSERT INTO supplier (name, email, phone, created_at)
        VALUES($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING ${supplierColumns}`,
        [name, email, phone]);

    return result.rows[0];
}

const update = async(id, supplier) =>{
    const {name, email, phone} = supplier;

    const result = await pool.query(
        `UPDATE supplier SET name = $1,
        email = $2,
        phone = $3
        WHERE supplier_id = $4
        RETURNING ${supplierColumns}`,
        [name, email, phone, id]);

    return result.rows[0];
}

const remove = async(id) =>{
    const result = await pool.query(
        `DELETE FROM supplier
        WHERE supplier_id = $1
        RETURNING ${supplierColumns}`,
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
