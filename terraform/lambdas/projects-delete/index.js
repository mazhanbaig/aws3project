const { query, success, error } = require('../shared/db');
const { verifyToken, getTokenFromEvent } = require('../shared/auth');

exports.handler = async (event) => {
  try {
    const token = getTokenFromEvent(event);
    const user = verifyToken(token);
    if (!user) return error('Unauthorized', 401);

    const id = event.pathParameters?.id;
    if (!id) return error('Project ID required');

    const project = await query('SELECT * FROM projects WHERE id = $1', [parseInt(id)]);
    if (project.rows.length === 0) return error('Project not found', 404);
    if (project.rows[0].user_id !== user.userId) return error('Forbidden', 403);

    await query('DELETE FROM projects WHERE id = $1', [parseInt(id)]);

    return success({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    return error('Internal server error', 500);
  }
};
