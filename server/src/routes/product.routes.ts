import { Router } from 'express';
import { createProductHandler, deleteProductHandler, detailProduct, listProducts, updateProductHandler } from '../controllers/product.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { productCreateRules } from '../schemas/product.schema.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', detailProduct);
router.post('/', validateBody(productCreateRules), createProductHandler);
router.put('/:id', validateBody(productCreateRules), updateProductHandler);
router.delete('/:id', deleteProductHandler);

export default router;
