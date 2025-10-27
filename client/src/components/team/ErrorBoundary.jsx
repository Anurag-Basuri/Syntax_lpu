import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error('Team page error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-gradient-to-br from-[#080b17] via-[#0f1228] to-[#0a0c20] text-white flex items-center justify-center p-4">
					<motion.div
						className="text-center p-8 rounded-2xl bg-slate-900/95 border border-red-500/30 max-w-md backdrop-blur-xl"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.3 }}
					>
						<AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-red-400 mb-4">
							Something went wrong
						</h2>
						<p className="text-slate-300 mb-6">
							We're sorry, but something unexpected happened while loading the team
							page.
						</p>
						<motion.button
							onClick={() => window.location.reload()}
							className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 
                                text-white font-medium hover:opacity-90 transition-opacity mx-auto"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<RefreshCw size={18} />
							Try Again
						</motion.button>
					</motion.div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
