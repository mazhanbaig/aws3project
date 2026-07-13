const { query, success, error } = require('../shared/db');
const { verifyToken, getTokenFromEvent } = require('../shared/auth');

exports.handler = async (event) => {
  try {
    const token = getTokenFromEvent(event);
    const user = verifyToken(token);
    if (!user) return error('Unauthorized', 401);

    const { title, description, techStack, githubUrl, liveUrl, imageUrl } = JSON.parse(event.body || '{}');
    if (!title) return error('Title is required');

    const result = await query(
      `INSERT INTO projects (user_id, title, description, tech_stack, github_url, live_url, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user.userId, title, description || '', techStack || [], githubUrl || '', liveUrl || '', imageUrl || '']
    );

    return success({ project: result.rows[0] }, 201);
  } catch (err) {
    console.error('Create project error:', err);
    return error('Internal server error', 500);
  }
};
