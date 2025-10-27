import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ title, children, onClose, size = 'md' }) => {
	const sizes = {
		sm: 'max-w-md',
		md: 'max-w-2xl',
		lg: 'max-w-4xl',
		xl: 'max-w-6xl',
	};

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					transition={{ duration: 0.2 }}
					className={`w-full ${sizes[size]} bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden`}
				>
					<div className="flex justify-between items-center p-4 border-b border-gray-700">
						<h3 className="text-lg font-semibold text-white">{title}</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-white rounded-full p-1"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
					<div className="p-6">{children}</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
};

export default Modal;
