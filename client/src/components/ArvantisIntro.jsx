import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const ArvantisIntro = () => {
	return (
		<section id="arvantis-intro" className="page-container py-12">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.5 }}
				transition={{ duration: 0.6 }}
				className="max-w-6xl mx-auto"
			>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
					<div>
						<h2 className="text-3xl sm:text-4xl font-display font-bold text-primary mb-3">
							Arvantis — Our annual tech fest
						</h2>
						<p className="text-lg text-secondary max-w-xl leading-relaxed mb-6">
							Arvantis is Syntax’s flagship tech festival — a celebration of ideas,
							competitions, workshops, and collaborations across engineering and
							design. Each year we host a curated lineup of events, partner showcases,
							and community-driven activities that bring students, industry, and
							creators together.
						</p>

						<div className="flex flex-wrap gap-3 items-center">
							<a
								href="/arvantis"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-white"
								style={{
									background:
										'linear-gradient(90deg,var(--accent-1),var(--accent-2))',
								}}
								aria-label="Learn more about Arvantis"
							>
								<ExternalLink className="w-4 h-4" />
								<span>Learn about Arvantis</span>
							</a>

							<a
								href="#events"
								className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm"
								aria-label="Browse Arvantis events"
							>
								Browse events
							</a>
						</div>
					</div>

					<div className="hidden md:flex items-center justify-center">
						{/* Decorative card that can be replaced with a poster or image later */}
						<div className="w-full max-w-sm rounded-2xl p-4 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg">
							<div className="h-40 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--accent-1)]/12 to-[var(--accent-2)]/8 flex items-center justify-center">
								<div className="text-center p-4">
									<div className="text-sm text-[var(--text-muted)] mb-2">
										Next edition
									</div>
									<div className="text-2xl font-semibold text-primary">
										Arvantis ’24
									</div>
									<div className="text-sm text-[var(--text-muted)] mt-2">
										Competitions · Workshops · Partners · Gallery
									</div>
								</div>
							</div>

							<div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
								<div>See lineup & partners</div>
								<div className="font-mono">arvantis/syntax</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</section>
	);
};

export default ArvantisIntro;
