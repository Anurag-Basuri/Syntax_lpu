import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Instagram, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
	const socialLinks = [
		{
			name: 'LinkedIn',
			icon: <Linkedin className="w-4 h-4" />,
			url: 'https://www.linkedin.com/company/syntax-club/',
		},
		{
			name: 'Instagram',
			icon: <Instagram className="w-4 h-4" />,
			url: 'https://www.instagram.com/syntax.club/',
		},
	];

	const quickLinks = [
		{ name: 'Join Us', to: '/join' },
		{ name: 'Events', to: '/event' },
		{ name: 'Team', to: '/team' },
		{ name: 'Contact', to: '/contact' },
		{ name: 'Socials', to: '/socials' },
	];

	const policiesLinks = [
		{ name: 'Privacy Policy', to: '/policies/privacy' },
		{ name: 'Terms of Service', to: '/policies/terms' },
		{ name: 'Refund Policy', to: '/policies/refund' },
	];

	return (
		<footer className="py-10 px-6 bg-transparent">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
					{/* Brand */}
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-3">
							<h3 className="font-bold text-xl brand-text">Syntax Club</h3>
						</div>
						<p className="text-secondary text-sm max-w-sm leading-relaxed">
							Hands-on projects, workshops and a supportive community for students
							building real technical skills.
						</p>

						{/* Social icons: compact */}
						<div className="flex gap-3 mt-1">
							{socialLinks.map((social, i) => (
								<motion.a
									key={i}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									whileHover={{ scale: 1.05 }}
									className="w-8 h-8 rounded-full bg-white/6 border border-white/6 flex items-center justify-center text-accent hover:bg-white/12 transition-colors"
									aria-label={social.name}
								>
									{social.icon}
								</motion.a>
							))}
						</div>
					</div>

					{/* Links: quick links + policies grouped for compactness */}
					<div className="flex flex-col md:flex-row gap-6 md:gap-12">
						<div>
							<h4 className="text-sm font-semibold mb-3">Quick Links</h4>
							<ul className="space-y-2 text-sm text-secondary">
								{quickLinks.map((link) => (
									<li key={link.to}>
										<Link
											to={link.to}
											className="hover:text-accent transition-colors"
										>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h4 className="text-sm font-semibold mb-3">Policies</h4>
							<ul className="space-y-2 text-sm text-secondary">
								{policiesLinks.map((p) => (
									<li key={p.to}>
										<Link
											to={p.to}
											className="hover:text-accent transition-colors"
										>
											{p.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Contact */}
					<div>
						<h4 className="text-sm font-semibold mb-3">Contact</h4>
						<ul className="space-y-3 text-sm text-secondary">
							<li>
								<a
									href="mailto:syntax.studorg@gmail.com"
									className="flex items-center gap-3 hover:text-accent transition-colors"
								>
									<span className="w-8 h-8 rounded-full bg-white/6 border border-white/8 flex items-center justify-center">
										<Mail className="w-4 h-4 text-accent" />
									</span>
									<span>syntax.studorg@gmail.com</span>
								</a>
							</li>
							<li>
								<a
									href="https://maps.google.com/?q=Lovely+Professional+University"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 hover:text-accent transition-colors"
								>
									<span className="w-8 h-8 rounded-full bg-white/6 border border-white/8 flex items-center justify-center">
										<MapPin className="w-4 h-4 text-accent" />
									</span>
									<span>Lovely Professional University, Punjab</span>
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom legal row: compact */}
				<div className="mt-8 pt-6 border-t border-white/6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-secondary">
					<p>© {new Date().getFullYear()} Syntax Club. All rights reserved.</p>
					<p className="text-xs text-secondary/60">Developed by the Syntax Dev Team</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
