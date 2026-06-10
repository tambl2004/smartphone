import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.js';
import crypto from 'crypto';
import axios from 'axios';
import { updateOrderStatusByCode } from '../models/order.model.js';

const router = Router();

// Helper to get MoMo config dynamically (handles ES Module import lifecycle before dotenv.config())
const getMomoConfig = () => {
  return {
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
    secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    momoEndpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/payment-result',
    ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:5000/api/momo/callback',
  };
};

router.post('/payment', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { amount, orderId, orderInfo } = req.body;
    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: 'Amount and orderId are required' });
    }

    const { partnerCode, accessKey, secretKey, momoEndpoint, redirectUrl, ipnUrl } = getMomoConfig();
    const requestId = orderId; // Use orderId as requestId
    const requestType = 'payWithATM';
    const extraData = '';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      accessKey,
      partnerName: 'NexPhone Store',
      storeId: 'NexPhoneStore',
      requestId,
      amount: Number(amount),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      extraData,
      signature,
    };

    const response = await axios.post(momoEndpoint, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });

    return res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('MoMo Payment Error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, error: 'Internal Server Error', details: error.response?.data || error.message });
  }
});

router.post('/callback', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      partnerCode: respPartnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    const { accessKey, secretKey } = getMomoConfig();

    const paramExtraData = extraData || '';
    const paramMessage = message || '';
    const paramOrderInfo = orderInfo || '';
    const paramOrderType = orderType || '';
    const paramPayType = payType || '';
    const paramResponseTime = responseTime || '';
    const paramResultCode = resultCode !== undefined ? String(resultCode) : '';
    const paramTransId = transId || '';

    // Verify signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${paramExtraData}&message=${paramMessage}&orderId=${orderId}&orderInfo=${paramOrderInfo}&orderType=${paramOrderType}&partnerCode=${respPartnerCode}&payType=${paramPayType}&requestId=${requestId}&responseTime=${paramResponseTime}&resultCode=${paramResultCode}&transId=${paramTransId}`;

    const computedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');



    if (computedSignature !== signature) {
      console.error('Invalid MoMo IPN signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    if (String(resultCode) === '0') {
      console.log(`MoMo Payment Success for Order ${orderId}`);
      await updateOrderStatusByCode(orderId, 'confirmed');
    } else {
      console.warn(`MoMo Payment Failed/Cancelled for Order ${orderId}: resultCode=${resultCode}`);
    }

    return res.status(204).send();
  } catch (error: any) {
    console.error('MoMo IPN Callback Error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/verify', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      partnerCode: respPartnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    if (!orderId || !signature) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const { accessKey, secretKey } = getMomoConfig();

    const paramExtraData = extraData || '';
    const paramMessage = message || '';
    const paramOrderInfo = orderInfo || '';
    const paramOrderType = orderType || '';
    const paramPayType = payType || '';
    const paramResponseTime = responseTime || '';
    const paramResultCode = resultCode !== undefined ? String(resultCode) : '';
    const paramTransId = transId || '';

    // Verify signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${paramExtraData}&message=${paramMessage}&orderId=${orderId}&orderInfo=${paramOrderInfo}&orderType=${paramOrderType}&partnerCode=${respPartnerCode}&payType=${paramPayType}&requestId=${requestId}&responseTime=${paramResponseTime}&resultCode=${paramResultCode}&transId=${paramTransId}`;

    const computedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');



    if (computedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature verification' });
    }

    const isSuccess = String(resultCode) === '0';
    if (isSuccess) {
      await updateOrderStatusByCode(orderId, 'confirmed');
    }

    return res.status(200).json({
      success: true,
      message: 'Xác thực thanh toán thành công',
      data: {
        isSuccess,
        orderId,
        amount,
        message,
        resultCode,
      }
    });
  } catch (error: any) {
    console.error('MoMo verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
