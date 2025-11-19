import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
	const navigate = useNavigate();

	return (
		<div
			className="min-h-screen px-4 py-12 flex justify-center items-start"
			style={{ background: 'transparent' }}
		>
			<main
				className="w-full max-w-4xl rounded-2xl p-6 md:p-10 shadow-xl"
				style={{
					// keep card readable in both themes using CSS tokens defined globally
					background: 'var(--card-bg, rgba(255,255,255,0.04))',
					border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
					color: 'var(--text,  #e6eef8)',
					backdropFilter: 'blur(8px)',
				}}
				aria-labelledby="privacy-heading"
			>
				<nav className="mb-6">
					<button
						onClick={() => navigate(-1)}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition"
						style={{
							background: 'transparent',
							border: '1px solid rgba(255,255,255,0.04)',
							color: 'var(--text-secondary, #9aa6b2)',
						}}
					>
						← Back
					</button>
				</nav>

				<header className="text-center mb-6">
					<h1
						id="privacy-heading"
						className="text-2xl md:text-3xl font-semibold"
						style={{ color: 'var(--accent-1, #7c3aed)' }}
					>
						Privacy & Student Data Policy
					</h1>
					<p
						className="mt-2 text-sm md:text-base"
						style={{ color: 'var(--text-secondary)' }}
					>
						Effective: <strong>July 2025</strong> — explains what student data we
						collect, why we collect it, how we protect it, and your rights.
					</p>
				</header>

				<section
					className="prose prose-invert max-w-none mb-6"
					aria-labelledby="what-we-collect"
				>
					<h2
						id="what-we-collect"
						className="text-lg font-semibold"
						style={{ color: 'var(--text)' }}
					>
						What student data we collect
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
						{/* left column: concise bullets */}
						<div>
							<ul
								className="list-disc pl-5 space-y-2 text-sm"
								style={{ color: 'var(--text-secondary)' }}
							>
								<li>
									<strong>Account details:</strong> name, LPU ID, email, password
									hash.
								</li>
								<li>
									<strong>Contact:</strong> phone, hostel/address (for events &
									coordination).
								</li>
								<li>
									<strong>Academic & enrollment:</strong> course, department, year
									/ semester.
								</li>
								<li>
									<strong>Participation:</strong> event registrations, attendance,
									tickets.
								</li>
								<li>
									<strong>Content & media:</strong> photos, project samples,
									public profile info.
								</li>
							</ul>
						</div>

						{/* right column: short explanation */}
						<div>
							<p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
								We collect only information necessary to provide club services,
								manage events, share opportunities and communicate with members.
								Sensitive information is only collected when strictly necessary and
								with explicit consent.
							</p>
							<p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
								If you have concerns about any field, contact the club data officer
								(contact info below) to request clarification or limited processing.
							</p>
						</div>
					</div>
				</section>

				<section className="mb-6" aria-labelledby="data-usage">
					<h3
						id="data-usage"
						className="text-lg font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Why we collect it (purposes)
					</h3>

					<dl className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<dt className="font-medium" style={{ color: 'var(--text)' }}>
								Service delivery
							</dt>
							<dd style={{ color: 'var(--text-secondary)' }}>
								Manage member accounts, event registrations, issue tickets and
								follow-ups.
							</dd>
						</div>
						<div>
							<dt className="font-medium" style={{ color: 'var(--text)' }}>
								Communications
							</dt>
							<dd style={{ color: 'var(--text-secondary)' }}>
								Send announcements, event updates, and membership-related messages.
							</dd>
						</div>
						<div>
							<dt className="font-medium" style={{ color: 'var(--text)' }}>
								Safety & logistics
							</dt>
							<dd style={{ color: 'var(--text-secondary)' }}>
								Ensure safety during events, manage accommodations and emergency
								contact needs.
							</dd>
						</div>
						<div>
							<dt className="font-medium" style={{ color: 'var(--text)' }}>
								Research & improvements
							</dt>
							<dd style={{ color: 'var(--text-secondary)' }}>
								Aggregate, anonymized usage data to improve club activities and
								resources.
							</dd>
						</div>
					</dl>
				</section>

				<section className="mb-6" aria-labelledby="legal-retention">
					<h3
						id="legal-retention"
						className="text-lg font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Legal basis & retention
					</h3>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						We process data on the grounds of member consent and legitimate interests
						necessary for club operations (e.g., event organization). We retain personal
						data only as long as needed for the purposes described — typically
						membership duration plus up to 2 years for administrative records, unless a
						longer legal retention period applies.
					</p>
				</section>

				<section className="mb-6" aria-labelledby="your-rights">
					<h3
						id="your-rights"
						className="text-lg font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Your rights
					</h3>
					<ul
						className="list-disc pl-5 mt-3 text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
						<li>Access: request a copy of your personal data we hold.</li>
						<li>Correction: ask us to rectify inaccurate or incomplete data.</li>
						<li>
							Deletion: request deletion where we are not legally required to retain
							it.
						</li>
						<li>
							Portability: request a machine-readable copy of the data you provided.
						</li>
						<li>Objection: restrict processing for direct marketing or profiling.</li>
					</ul>
				</section>

				<section className="mb-6" aria-labelledby="security">
					<h3
						id="security"
						className="text-lg font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Data security & third parties
					</h3>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						We implement reasonable organizational and technical measures to protect
						data (confidentiality, integrity, availability). Access is limited to
						authorized club personnel and trusted service providers (hosting, email,
						payments). We require contracts to protect data and only share the minimum
						necessary information.
					</p>
				</section>

				<section className="mb-6" aria-labelledby="contact">
					<h3
						id="contact"
						className="text-lg font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Contact & data officer
					</h3>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						Questions, access requests or complaints can be sent to:
					</p>

					<address
						className="mt-3 not-italic text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
						<div>
							<strong>Data Controller:</strong> Syntax Club
						</div>
						<div>
							<strong>Email:</strong>{' '}
							<a
								href="mailto:syntax.studorg@gmail.com"
								className="underline"
								style={{ color: 'var(--accent-2)' }}
							>
								syntax.studorg@gmail.com
							</a>
						</div>
						<div>
							<strong>Processing inquiries:</strong> use the contact form in the site
							or email the address above.
						</div>
					</address>
				</section>

				<footer
					className="mt-6 text-center text-sm"
					style={{ color: 'var(--text-secondary)' }}
				>
					<p>
						By using club services you consent to data processing described above. For
						legal questions, please consult official university guidance.
					</p>
				</footer>
			</main>
		</div>
	);
};

export default PrivacyPolicy;
