import {
  createQuestion as createQuestionModel,
  findQuestionsByProduct,
  findAllRootQuestions as findAllRootQuestionsModel,
  findQuestionThread,
  deleteQuestion as deleteQuestionModel,
} from '../models/question.model.js';
import type { ListQuery } from '../utils/pagination.js';

export const addQuestion = async (
  userId: number,
  productId: number,
  content: string,
  parentId: number | null,
  userRole: 'admin' | 'user'
) => {
  return createQuestionModel(userId, productId, content, parentId, userRole);
};

export const getQuestionsForProduct = async (productId: number) => {
  const all = await findQuestionsByProduct(productId);
  
  // Group replies inside parent questions
  const roots = all.filter(q => q.parentId === null);
  const replies = all.filter(q => q.parentId !== null);

  const result = roots.map(root => {
    return {
      ...root,
      replies: replies.filter(r => r.parentId === root.id)
    };
  });

  return result;
};

export const getRootQuestionsList = async (query: ListQuery) => {
  return findAllRootQuestionsModel(query);
};

export const getQuestionThreadById = async (rootId: number) => {
  const all = await findQuestionThread(rootId);
  const root = all.find(q => q.parentId === null);
  if (!root) return null;

  return {
    ...root,
    replies: all.filter(q => q.parentId === root.id)
  };
};

export const removeQuestion = async (id: number) => {
  return deleteQuestionModel(id);
};
