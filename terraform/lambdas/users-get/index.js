const { query, success, error } = require('../shared/db');

exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return error('User ID required');

    const result = await query(
      `SELECT id, email, display_name, avatar_url, created_at FROM users WHERE id = $1`,
      [parseInt(userId)]
    );

    if (result.rows.length === 0) return error('User not found', 404);

    const user = result.rows[0];

    const projectCount = await query(
      'SELECT COUNT(*) FROM projects WHERE user_id = $1',
      [parseInt(userId)]
    );

    return success({
      user: {
        ...user,
        project_count: parseInt(projectCount.rows[0].count),
      },
    });
  } catch (err) {
    console.error('Get user error:', err);
    return error('Internal server error', 500);
  }
};
