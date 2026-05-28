import { Request, Response } from 'express';
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from '../models/faq.model.js';

export const listFAQs = async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const faqs = await getAllFAQs(activeOnly);
    res.json({ success: true, message: 'FAQs retrieved successfully', data: { items: faqs }, errors: null });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null, errors: null });
  }
};

export const addFAQ = async (req: Request, res: Response) => {
  try {
    const id = await createFAQ(req.body);
    res.status(201).json({ success: true, message: 'FAQ created successfully', data: { id }, errors: null });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null, errors: null });
  }
};

export const editFAQ = async (req: Request, res: Response) => {
  try {
    await updateFAQ(Number(req.params.id), req.body);
    res.json({ success: true, message: 'FAQ updated successfully', data: null, errors: null });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null, errors: null });
  }
};

export const removeFAQ = async (req: Request, res: Response) => {
  try {
    await deleteFAQ(Number(req.params.id));
    res.json({ success: true, message: 'FAQ deleted successfully', data: null, errors: null });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null, errors: null });
  }
};
