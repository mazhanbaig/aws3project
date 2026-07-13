const { query, success, error } = require('../shared/db');

exports.handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return error('Project ID required');

    const result = await query(
      `SELECT p.*, u.display_name, u.avatar_url, u.email
       FROM projects p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) return error('Project not found', 404);

    return success({ project: result.rows[0] });
  } catch (err) {
    console.error('Get project error:', err);
    return error('Internal server error', 500);
  }
};
