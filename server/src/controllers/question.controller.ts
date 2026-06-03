import type { Request, Response } from 'express';
import {
  addQuestion,
  getQuestionsForProduct,
  getRootQuestionsList,
  getQuestionThreadById,
  removeQuestion,
} from '../services/question.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';
import { parseListQuery } from '../utils/pagination.js';

/**
 * POST /questions
 * Body: { productId, content, parentId? }
 */
export const createQuestionController = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { productId, content, parentId } = req.body;

  if (!productId || !content || content.trim() === '') {
    return sendError(res, 400, 'Mã sản phẩm và nội dung không được để trống.');
  }

  try {
    const questionId = await addQuestion(
      userId,
      Number(productId),
      content.trim(),
      parentId ? Number(parentId) : null,
      userRole
    );
    return sendSuccess(res, 201, 'Gửi câu hỏi/phản hồi thành công.', { id: questionId });
  } catch (error: any) {
    return sendError(res, 400, error.message || 'Lỗi khi đặt câu hỏi.');
  }
};

/**
 * GET /questions/product/:productId
 * Public: list Q&As for a product
 */
export const getProductQuestionsController = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const list = await getQuestionsForProduct(Number(productId));
  return sendSuccess(res, 200, 'Product questions retrieved', { items: list });
};

/**
 * GET /questions (admin only)
 * List root questions for Q&A management
 */
export const listRootQuestionsController = async (req: Request, res: Response) => {
  const result = await getRootQuestionsList(parseListQuery(req.query as Record<string, unknown>));
  return sendSuccess(res, 200, 'Root questions retrieved', result);
};

/**
 * GET /questions/thread/:id
 * Retrieve a full question thread (root question + replies)
 */
export const getQuestionThreadController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const thread = await getQuestionThreadById(Number(id));
  if (!thread) {
    return sendError(res, 404, 'Không tìm thấy cuộc trò chuyện.');
  }
  return sendSuccess(res, 200, 'Thread retrieved', thread);
};

/**
 * DELETE /questions/:id
 * Delete a question and its replies
 */
export const deleteQuestionController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await removeQuestion(Number(id));
  if (!success) {
    return sendError(res, 404, 'Không tìm thấy câu hỏi để xóa.');
  }
  return sendSuccess(res, 200, 'Xóa câu hỏi thành công.', null);
};
