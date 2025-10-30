import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
	const navigate = useNavigate();

	const socialLinks = [
		{
			name: 'GitHub',
			icon: <FaGithub className="w-5 h-5" />,
			url: 'https://github.com/your-org', // Replace with your GitHub org URL
		},
		{
			name: 'LinkedIn',
			icon: <FaLinkedin className="w-5 h-5" />,
			url: 'https://www.linkedin.com/company/syntax-club/', // Updated URL
		},
		{
			name: 'Instagram',
			icon: <FaInstagram className="w-5 h-5" />,
			url: 'https://www.instagram.com/syntax.club/', // Updated URL
		},
	];

	const footerLinks = [
		{ name: 'Terms and Conditions', to: '/policy/terms' },
		{ name: 'Cancellation and Refund', to: '/policy/refund-policy' },
		{ name: 'Privacy Policy', to: '/policy/privacy' },
		{ name: 'Cookie Policy', to: '/policy/cookie' },
	];

	return (
		<footer className="pt-24 pb-12 px-4 relative z-10 overflow-hidden bg-transparent">
			{/* Background elements */}
			<div className="absolute inset-0 -z-10 pointer-events-none">
				<div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-900/20 to-indigo-900/0 backdrop-blur-2xl"></div>
				<div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl"></div>
			</div>

			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
					{/* Brand column */}
					<div className="lg:col-span-2">
						<div className="flex items-center gap-3 mb-6">
							<h3 className="text-white font-bold text-2xl bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
								Syntax Club
							</h3>
						</div>

						<p className="text-blue-200 mb-8 max-w-md leading-relaxed">
							Empowering the next generation of innovators through hands-on projects,
							workshops, and community building.
						</p>

						{/* Social links */}
						<div className="flex gap-4 mb-8">
							{socialLinks.map((social, index) => (
								<motion.a
									key={index}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									className="w-10 h-10 rounded-full bg-blue-900/20 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-blue-800/30 transition-colors"
									whileHover={{
										y: -5,
										backgroundColor: 'rgba(99, 102, 241, 0.2)',
									}}
									whileTap={{ scale: 0.9 }}
									aria-label={social.name}
								>
									{social.icon}
								</motion.a>
							))}
						</div>
					</div>

					{/* Empty columns for spacing */}
					<div></div>
					<div></div>

					{/* Contact column */}
					<div>
						<h4 className="text-white font-semibold mb-6 text-lg relative inline-block">
							Contact Us
							<div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
						</h4>
						<ul className="space-y-5 text-blue-200">
							<li className="flex items-start gap-3">
								<a
									href="mailto:syntax.helpdesk@gmail.com"
									className="flex items-start gap-3 hover:text-blue-400 transition-colors"
								>
									<div className="w-8 h-8 rounded-full bg-blue-900/20 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 text-blue-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											/>
										</svg>
									</div>
									<span>syntax.helpdesk@gmail.com</span>
								</a>
							</li>
							<li className="flex items-start gap-3">
								<a
									href="tel:+919771072294"
									className="flex items-start gap-3 hover:text-blue-400 transition-colors"
								>
									<div className="w-8 h-8 rounded-full bg-blue-900/20 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 text-blue-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
											/>
										</svg>
									</div>
									<span>+91 9771072294</span>
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
					<p className="text-blue-300 text-center md:text-left text-sm">
						© 2024 Syntax Club. All rights reserved.
					</p>

					<div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end">
						{footerLinks.map((item, idx) => (
							<button
								key={idx}
								type="button"
								onClick={() => navigate(item.to)}
								className="text-sm text-blue-200 hover:text-blue-400 transition-colors bg-transparent p-0 m-0 border-none cursor-pointer"
							>
								{item.name}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Floating elements */}
			<motion.div
				className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-xl -z-10"
				animate={{
					y: [0, -20, 0],
					rotate: [0, 20, 0],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					repeatType: 'reverse',
					ease: 'easeInOut',
				}}
			/>

			<motion.div
				className="absolute bottom-40 left-20 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-xl -z-10"
				animate={{
					y: [0, -15, 0],
					rotate: [0, -15, 0],
				}}
				transition={{
					duration: 6,
					repeat: Infinity,
					repeatType: 'reverse',
					ease: 'easeInOut',
					delay: 1,
				}}
			/>
		</footer>
	);
};

export default Footer;
