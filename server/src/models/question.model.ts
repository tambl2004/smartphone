import { getDb } from './mysql.js';
import type { ListQuery } from '../utils/pagination.js';

export type QuestionRecord = {
  id: number;
  productId: number;
  userId: number;
  parentId: number | null;
  content: string;
  status: 'pending' | 'answered' | 'new_message';
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userAvatar?: string | null;
  userRole?: 'admin' | 'user';
  productName?: string;
  productImage?: string | null;
  userEmail?: string;
};

/**
 * Check rate limit for root questions.
 * Max 3 root questions per user per product in the last 24 hours.
 */
export const checkRateLimit = async (userId: number, productId: number): Promise<boolean> => {
  const [rows] = await getDb().query(
    `SELECT COUNT(*) AS count 
     FROM product_questions 
     WHERE user_id = ? AND product_id = ? AND parent_id IS NULL 
       AND created_at >= NOW() - INTERVAL 1 DAY`,
    [userId, productId]
  );
  const count = (rows as Array<{ count: number }>)[0]?.count ?? 0;
  return count < 3;
};

/**
 * Create a new question or reply.
 */
export const createQuestion = async (
  userId: number,
  productId: number,
  content: string,
  parentId: number | null,
  userRole: 'admin' | 'user'
): Promise<number> => {
  const db = getDb();

  // If it's a root question, check rate limit (for regular users only, admin shouldn't have limit)
  if (parentId === null && userRole !== 'admin') {
    const allowed = await checkRateLimit(userId, productId);
    if (!allowed) {
      throw new Error('Bạn đã đạt giới hạn gửi câu hỏi cho sản phẩm này trong hôm nay (tối đa 3 câu hỏi/ngày).');
    }
  }

  // Insert the question/reply
  const [result] = await db.execute(
    `INSERT INTO product_questions (product_id, user_id, parent_id, content, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [productId, userId, parentId, content]
  );
  const insertId = Number((result as { insertId: number }).insertId);

  // If it is a reply, update parent status accordingly
  if (parentId !== null) {
    if (userRole === 'admin') {
      // Admin replied -> mark parent as answered
      await db.execute(
        `UPDATE product_questions SET status = 'answered' WHERE id = ?`,
        [parentId]
      );
    } else {
      // User replied -> check if current status is answered, if so, change to new_message
      const [parentRows] = await db.query(
        `SELECT status FROM product_questions WHERE id = ? LIMIT 1`,
        [parentId]
      );
      const parent = (parentRows as Array<{ status: string }>)[0];
      if (parent && parent.status === 'answered') {
        await db.execute(
          `UPDATE product_questions SET status = 'new_message' WHERE id = ?`,
          [parentId]
        );
      }
    }
  }

  return insertId;
};

/**
 * Retrieve all questions (with replies) for a single product.
 */
export const findQuestionsByProduct = async (productId: number) => {
  const [rows] = await getDb().query(
    `SELECT q.id, q.product_id AS productId, q.user_id AS userId, q.parent_id AS parentId,
            q.content, q.status, q.created_at AS createdAt,
            u.full_name AS userName, u.avatar_url AS userAvatar, u.role AS userRole
     FROM product_questions q
     LEFT JOIN users u ON u.id = q.user_id
     WHERE q.product_id = ?
     ORDER BY q.created_at ASC`,
    [productId]
  );
  return rows as QuestionRecord[];
};

/**
 * Retrieve all root questions (parent_id IS NULL) for Admin list.
 */
export const findAllRootQuestions = async (query: ListQuery) => {
  const where: string[] = ['q.parent_id IS NULL'];
  const params: unknown[] = [];

  if (query.search) {
    where.push('(u.full_name LIKE ? OR p.name LIKE ? OR q.content LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }

  for (const [key, value] of Object.entries(query.filter ?? {})) {
    if (key === 'status') {
      where.push('q.status = ?');
      params.push(value);
    }
    if (key === 'productId') {
      where.push('q.product_id = ?');
      params.push(value);
    }
  }

  const offset = (query.page - 1) * query.limit;
  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await getDb().query(
    `SELECT COUNT(*) AS total FROM product_questions q
     LEFT JOIN users u ON u.id = q.user_id
     LEFT JOIN products p ON p.id = q.product_id
     ${whereSql}`,
    params
  );
  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);

  // Sorting: Prioritize unanswered (pending) and new messages first, then answered, then latest
  const [rows] = await getDb().query(
    `SELECT q.id, q.product_id AS productId, q.user_id AS userId, q.content, q.status, q.created_at AS createdAt,
            p.name AS productName,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS productImage,
            u.full_name AS userName, u.email AS userEmail, u.avatar_url AS userAvatar
     FROM product_questions q
     LEFT JOIN users u ON u.id = q.user_id
     LEFT JOIN products p ON p.id = q.product_id
     ${whereSql}
     ORDER BY 
       CASE 
         WHEN q.status = 'pending' THEN 1 
         WHEN q.status = 'new_message' THEN 2 
         ELSE 3 
       END ASC, 
       q.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, query.limit, offset]
  );

  return {
    items: rows as QuestionRecord[],
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

/**
 * Retrieve a full question thread (root question + replies) by root ID.
 */
export const findQuestionThread = async (rootId: number) => {
  const [rows] = await getDb().query(
    `SELECT q.id, q.product_id AS productId, q.user_id AS userId, q.parent_id AS parentId,
            q.content, q.status, q.created_at AS createdAt,
            u.full_name AS userName, u.avatar_url AS userAvatar, u.role AS userRole
     FROM product_questions q
     LEFT JOIN users u ON u.id = q.user_id
     WHERE q.id = ? OR q.parent_id = ?
     ORDER BY q.created_at ASC`,
    [rootId, rootId]
  );
  return rows as QuestionRecord[];
};

/**
 * Delete a question (and its replies).
 */
export const deleteQuestion = async (id: number): Promise<boolean> => {
  const [result] = await getDb().execute(
    `DELETE FROM product_questions WHERE id = ?`,
    [id]
  );
  return (result as any).affectedRows > 0;
};
