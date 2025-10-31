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
			url: 'https://github.com/your-org',
		},
		{
			name: 'LinkedIn',
			icon: <FaLinkedin className="w-5 h-5" />,
			url: 'https://www.linkedin.com/company/syntax-club/',
		},
		{
			name: 'Instagram',
			icon: <FaInstagram className="w-5 h-5" />,
			url: 'https://www.instagram.com/syntax.club/',
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
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
					<div className="lg:col-span-2">
						<div className="flex items-center gap-3 mb-6">
							<h3 className="font-bold text-2xl brand-text">Syntax Club</h3>
						</div>
						<p className="text-secondary mb-8 max-w-md leading-relaxed">
							Empowering the next generation of innovators through hands-on projects,
							workshops, and community building.
						</p>
						<div className="flex gap-4">
							{socialLinks.map((social, index) => (
								<motion.a
									key={index}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									whileHover={{ scale: 1.1, y: -2 }}
									whileTap={{ scale: 0.95 }}
									className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-accent hover:text-white hover:bg-white/20 transition-all duration-300"
									aria-label={social.name}
								>
									{social.icon}
								</motion.a>
							))}
						</div>
					</div>

					<div>
						<h4 className="text-primary font-semibold mb-6 text-lg relative inline-block">
							Quick Links
							<div
								className="absolute bottom-0 left-0 w-full h-0.5"
								style={{
									background:
										'linear-gradient(90deg, var(--accent-1), var(--accent-2))',
								}}
							></div>
						</h4>
						<ul className="space-y-4 text-secondary">
							<li>
								<button
									onClick={() => navigate('/event')}
									className="hover:text-accent transition-colors"
								>
									Events
								</button>
							</li>
							<li>
								<button
									onClick={() => navigate('/team')}
									className="hover:text-accent transition-colors"
								>
									Team
								</button>
							</li>
							<li>
								<button
									onClick={() => navigate('/contact')}
									className="hover:text-accent transition-colors"
								>
									Contact
								</button>
							</li>
							<li>
								<button
									onClick={() => navigate('/socials')}
									className="hover:text-accent transition-colors"
								>
									Socials
								</button>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-primary font-semibold mb-6 text-lg relative inline-block">
							Contact Us
							<div
								className="absolute bottom-0 left-0 w-full h-0.5"
								style={{
									background:
										'linear-gradient(90deg, var(--accent-1), var(--accent-2))',
								}}
							></div>
						</h4>
						<ul className="space-y-4 text-secondary">
							<li className="flex items-start gap-3">
								<a
									href="mailto:syntax.helpdesk@gmail.com"
									className="flex items-start gap-3 hover:text-accent transition-colors"
								>
									<div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 text-accent"
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
									<span className="text-sm">syntax.helpdesk@gmail.com</span>
								</a>
							</li>
							<li className="flex items-start gap-3">
								<a
									href="https://maps.google.com/?q=Your+Institution+Address"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-start gap-3 hover:text-accent transition-colors"
								>
									<div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 text-accent"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
									</div>
									<span className="text-sm">Your Institution Address</span>
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
					<p className="text-secondary text-center md:text-left text-sm">
						© {new Date().getFullYear()} Syntax Club. All rights reserved.
					</p>
					<div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end">
						{footerLinks.map((item, idx) => (
							<button
								key={idx}
								type="button"
								onClick={() => navigate(item.to)}
								className="text-sm text-secondary hover:text-accent transition-colors"
							>
								{item.name}
							</button>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
