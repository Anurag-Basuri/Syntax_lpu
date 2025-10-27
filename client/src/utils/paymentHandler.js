import { publicClient } from '../services/api.js';
import { load } from '@cashfreepayments/cashfree-js';

export const handlePayment = async ({
	formData,
	eventData,
	setLoading,
	setError,
	setShowPaymentForm,
	onSuccess,
	onFailure,
}) => {
	setLoading(true);
	setError('');

	try {
		// Validate form data
		const { fullName, email, phone, lpuId, gender, hosteler, hostel, course, club, amount } =
			formData;
		if (
			!fullName ||
			!email ||
			!phone ||
			!lpuId ||
			!gender ||
			hosteler === undefined ||
			!course
		) {
			setError('Please fill all required fields.');
			setLoading(false);
			return;
		}
		if (!/^\d{8}$/.test(lpuId)) {
			setError('LPU ID must be exactly 8 digits.');
			setLoading(false);
			return;
		}
		if (!['Male', 'Female'].includes(gender)) {
			setError('Gender must be Male or Female.');
			setLoading(false);
			return;
		}
		const hostelerBool = hosteler === true || hosteler === 'true';
		if (hostelerBool && !hostel) {
			setError('Hostel name is required for hosteler.');
			setLoading(false);
			return;
		}

		// Prepare payload for backend
		const payload = {
			fullName,
			email,
			phone,
			lpuId: lpuId.trim(),
			gender,
			hosteler: hostelerBool,
			hostel: hostelerBool ? hostel : undefined,
			course,
			club: club || '',
			amount: Number(amount),
			eventId: eventData?._id,
		};

		// Create payment order
		const response = await publicClient.post('api/cashfree/create-order', payload);

		const orderData = response.data?.data;
		if (!orderData?.payment_session_id) {
			throw new Error('Invalid order response from server.');
		}

		// Load and initialize Cashfree
		const cashfree = await load({
			mode: import.meta.env.VITE_CASHFREE_MODE || 'sandbox',
		});

		// Close the payment form before redirecting
		// if (setShowPaymentForm) {
		// 	setShowPaymentForm(false);
		// }

		// Initiate payment
		await cashfree.checkout({
			paymentSessionId: orderData.payment_session_id,
			container: 'cashfree-dropin-container',
			redirectTarget: '_self',
		});

		// Call success callback if provided
		if (onSuccess) {
			onSuccess(orderData);
		}
	} catch (error) {
		console.error('Payment error:', error);
		const errorMessage =
			error?.response?.data?.message || error?.message || 'Payment failed. Please try again.';
		setError(errorMessage);

		// Call failure callback if provided
		if (onFailure) {
			onFailure(error);
		}
	} finally {
		setLoading(false);
	}
};

export default handlePayment;
{
	/*
import { publicClient } from '../services/api.js';
	
	export const handlePayment = async ({
		formData,
		eventData,
		setLoading,
		setError,
		setShowPaymentForm,
		onSuccess,
		onFailure,
	}) => {
		setLoading(true);
		setError('');
	
		try {
			// Validate form data
			const { fullName, email, phone, lpuId, gender, hosteler, hostel, course, club, amount } =
				formData;
			if (
				!fullName ||
				!email ||
				!phone ||
				!lpuId ||
				!gender ||
				hosteler === undefined ||
				!course
			) {
				setError('Please fill all required fields.');
				setLoading(false);
				return;
			}
			if (!/^\d{8}$/.test(lpuId)) {
				setError('LPU ID must be exactly 8 digits.');
				setLoading(false);
				return;
			}
			if (!['Male', 'Female'].includes(gender)) {
				setError('Gender must be Male or Female.');
				setLoading(false);
				return;
			}
			const hostelerBool = hosteler === true || hosteler === 'true';
			if (hostelerBool && !hostel) {
				setError('Hostel name is required for hosteler.');
				setLoading(false);
				return;
			}
	
			// Prepare payload for backend
			const payload = {
				fullName,
				email,
				phone,
				lpuId: lpuId.trim(),
				gender,
				hosteler: hostelerBool,
				hostel: hostelerBool ? hostel : undefined,
				course,
				club: club || '',
				amount: Number(amount),
				eventId: eventData?._id,
			};
	
			// Create payment order via Instamojo
			const response = await publicClient.post('api/instamojo/create-order', payload);
	
			const paymentData = response.data?.data;
			if (!paymentData?.payment_request?.longurl) {
				throw new Error('Invalid order response from server.');
			}
	
			// Optionally close the payment form before redirecting
			if (setShowPaymentForm) {
				setShowPaymentForm(false);
			}
	
			// Redirect user to Instamojo payment page
			window.location.href = paymentData.payment_request.longurl;
	
			// Call success callback if provided (optional, as redirect happens)
			if (onSuccess) {
				onSuccess(paymentData);
			}
		} catch (error) {
			console.error('Payment error:', error);
			const errorMessage =
				error?.response?.data?.message || error?.message || 'Payment failed. Please try again.';
			setError(errorMessage);
	
			// Call failure callback if provided
			if (onFailure) {
				onFailure(error);
			}
		} finally {
			setLoading(false);
		}
};

export default handlePayment;*/
}
