const pool = require("../config/db");
const withTransaction = require("../config/transaction");

// each role comes with its permission codes and how many users have it
const roleSelect = `
    SELECT
        roles.id,
        roles.name,
        roles.description,
        roles.is_system AS "isSystem",
        roles.is_default AS "isDefault",
        COALESCE(
            array_agg(permissions.code ORDER BY permissions.code) FILTER (WHERE permissions.code IS NOT NULL),
            '{}'
        ) AS permissions,
        (SELECT count(*)::int FROM user_roles WHERE user_roles.role_id = roles.id) AS "userCount"
    FROM roles
    LEFT JOIN role_permissions ON role_permissions.role_id = roles.id
    LEFT JOIN permissions ON permissions.id = role_permissions.permission_id
`;

const findAll = async() =>{
    const result = await pool.query(
        `${roleSelect}
        GROUP BY roles.id
        ORDER BY roles.id
        `
    );

    return result.rows;
}

const findById = async(id, client = pool) =>{
    const result = await client.query(
        `${roleSelect}
        WHERE roles.id = $1
        GROUP BY roles.id
        `, [id]
    );

    return result.rows[0];
}

// replaces the role's permissions with the given codes
const setPermissions = async(client, roleId, permissionCodes) =>{
    await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);

    await client.query(
        `INSERT INTO role_permissions (role_id, permission_id)
        SELECT $1, id FROM permissions WHERE code = ANY($2::text[])
        `, [roleId, permissionCodes]
    );
}

// only one role can be the default, so turn it off on the others first
const clearOtherDefaults = async(client, roleId) =>{
    await client.query(`UPDATE roles SET is_default = false WHERE is_default AND id <> $1`, [roleId]);
}

const create = async(role) =>{
    const {name, description, isDefault, permissions} = role;

    return withTransaction(async (client) =>{
        const result = await client.query(
            `INSERT INTO roles (name, description)
            VALUES ($1, $2)
            RETURNING id`,
            [name, description]);

        const id = result.rows[0].id;

        if(isDefault){
            await clearOtherDefaults(client, id);
            await client.query(`UPDATE roles SET is_default = true WHERE id = $1`, [id]);
        }

        await setPermissions(client, id, permissions);
        return findById(id, client);
    });
}

const update = async(id, role) =>{
    const {name, description, isDefault, permissions} = role;

    return withTransaction(async (client) =>{
        if(isDefault){
            await clearOtherDefaults(client, id);
        }

        const result = await client.query(
            `UPDATE roles SET name = $1,
            description = $2,
            is_default = $3
            WHERE id = $4
            RETURNING id`,
            [name, description, isDefault, id]);

        if(result.rowCount === 0){
            return undefined;
        }

        await setPermissions(client, id, permissions);
        return findById(id, client);
    });
}

const remove = async(id) =>{
    const result = await pool.query(
        `DELETE FROM roles
        WHERE id = $1
        RETURNING id, name`,
        [id]
    );

    return result.rows[0];
}

// replaces all of the user's roles
const setUserRoles = async(userId, roleIds) =>{
    return withTransaction(async (client) =>{
        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);

        await client.query(
            `INSERT INTO user_roles (user_id, role_id)
            SELECT $1, unnest($2::int[])
            `, [userId, roleIds]
        );
    });
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
    setUserRoles
}
