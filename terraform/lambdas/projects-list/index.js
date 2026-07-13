const { query, success, error } = require('../shared/db');

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const search = params.search || '';
    const tech = params.tech || '';
    const userId = params.userId || '';
    const page = parseInt(params.page || '1');
    const limit = Math.min(parseInt(params.limit || '20'), 50);
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    let values = [];
    let idx = 1;

    if (search) {
      where += ` AND (p.title ILIKE $${idx} OR p.description ILIKE $${idx})`;
      values.push(`%${search}%`);
      idx++;
    }
    if (tech) {
      where += ` AND $${idx} = ANY(p.tech_stack)`;
      values.push(tech);
      idx++;
    }
    if (userId) {
      where += ` AND p.user_id = $${idx}`;
      values.push(parseInt(userId));
      idx++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM projects p ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    values.push(limit);
    values.push(offset);
    const result = await query(
      `SELECT p.*, u.display_name, u.avatar_url
       FROM projects p
       JOIN users u ON p.user_id = u.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    return success({
      projects: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('List projects error:', err);
    return error('Internal server error', 500);
  }
};
