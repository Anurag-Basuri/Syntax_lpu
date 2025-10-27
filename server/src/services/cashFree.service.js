import axios from 'axios';
import { config } from 'dotenv';
config()

const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || 'https://api.cashfree.com';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || 'your_cashfree_app_id';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || 'your_cashfree_secret_key';
async function createCashfreeOrder(orderDetails) {
	try {
		const response = await axios.post(
			`${CASHFREE_BASE_URL}/orders`,
			orderDetails,
			{
				headers: {
					'x-api-version': '2022-09-01',
					'Content-Type': 'application/json',
					'accept': 'application/json',
					'x-client-id': CASHFREE_APP_ID,
					'x-client-secret': CASHFREE_SECRET_KEY,
				},
			}
		);

		return response.data;
	} catch (err) {
		if (err.response) {
			console.error('Cashfree error:', err.response.data);
			throw new Error(JSON.stringify(err.response.data));
		}
		throw new Error(err.message || 'Cashfree order creation failed');
	}
}

export default createCashfreeOrder;
