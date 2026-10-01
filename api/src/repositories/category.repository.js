const pool = require("../config/db");

const categoryColumns = `
        id,
        name,
        description,
        is_active AS "isActive",
        created_at AS "createdAt"
`;

const findAll = async() =>{
    const result = await pool.query(
        `SELECT ${categoryColumns}
        FROM categories
        ORDER BY id
        `
    );

    return result.rows;
}

const findById = async(id) =>{
    const result = await pool.query(
        `SELECT ${categoryColumns}
        FROM categories
        WHERE id = $1
        `, [id]
    );

    return result.rows[0];
}

const create = async(category) =>{
    const {name, description, isActive} = category;

    const result = await pool.query(
        `INSERT INTO categories (name, description, is_active, created_at)
        VALUES($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING ${categoryColumns}`,
        [name, description, isActive]);

    return result.rows[0];
}

const update = async(id, category) =>{
    const {name, description, isActive} = category;

    const result = await pool.query(
        `UPDATE categories SET name = $1,
        description = $2,
        is_active = $3
        WHERE id = $4
        RETURNING ${categoryColumns}`,
        [name, description, isActive, id]);

    return result.rows[0];
}

const remove = async(id) =>{
    const result = await pool.query(
        `DELETE FROM categories
        WHERE id = $1
        RETURNING ${categoryColumns}`,
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
