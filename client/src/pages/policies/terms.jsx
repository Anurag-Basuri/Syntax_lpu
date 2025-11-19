import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsPolicy = () => {
	const navigate = useNavigate();

	return (
		<div
			className="min-h-screen px-4 py-12 flex justify-center items-start"
			style={{ background: 'transparent' }}
		>
			<main
				className="w-full max-w-4xl rounded-2xl p-6 md:p-10 shadow-xl"
				style={{
					background: 'var(--card-bg, rgba(255,255,255,0.04))',
					border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
					color: 'var(--text, #e6eef8)',
					backdropFilter: 'blur(8px)',
				}}
				aria-labelledby="terms-heading"
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
						id="terms-heading"
						className="text-2xl md:text-3xl font-semibold"
						style={{ color: 'var(--accent-1, #7c3aed)' }}
					>
						Terms of Service
					</h1>
					<p
						className="mt-2 text-sm md:text-base"
						style={{ color: 'var(--text-secondary)' }}
					>
						Effective: <strong>July 2025</strong> — these Terms govern your access to
						and use of Syntax Club services, membership, events and related features.
					</p>
				</header>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						1. Acceptance
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						By registering for a Syntax Club account, applying for membership, attending
						events, or otherwise using our services you agree to these Terms and our
						Privacy Policy. If you do not agree, do not use the services.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						2. Eligibility & Membership
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						Syntax Club is a student organization. Membership is limited to students who
						meet the eligibility criteria described on our Join page. Acceptance may
						require verification of institutional affiliation (LPU ID or equivalent).
						Membership grants access to member-only content, events and benefits;
						membership may be revoked for violations.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						3. Accounts & Security
					</h2>
					<ul
						className="list-disc pl-5 mt-2 text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
						<li>
							You are responsible for maintaining the confidentiality of your account
							credentials and for all activity under your account.
						</li>
						<li>
							Notify the club immediately if you suspect unauthorized access. We may
							suspend or terminate accounts to protect the community or comply with
							legal obligations.
						</li>
						<li>
							Do not share sensitive login data over public channels; we will never
							ask for your password by email.
						</li>
					</ul>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						4. Events, Registrations & Tickets
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						Event registration, ticketing and attendance are subject to event-specific
						rules. When you register you agree to pay any applicable fees and to follow
						event instructions. Cancellation, refund or transfer policies are published
						per event; when unsure contact organizers before purchasing.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						5. Code of Conduct
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						Members and participants must act respectfully. Prohibited behavior includes
						harassment, discrimination, unlawful activity, disrupting events, or sharing
						personal data without consent. Violations may lead to warnings, suspension
						or permanent removal from membership and events.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						6. Content & Intellectual Property
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						All club-created content (branding, guides, event materials, code snippets
						hosted by the club) is owned by Syntax Club unless otherwise stated. Members
						retain ownership of their personal submissions (projects, posts, media) but
						grant the club a non-exclusive, worldwide license to use, display and
						promote that content in connection with club activities.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						7. Moderation & Removal
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						The club reserves the right to remove content that violates these Terms,
						applicable laws or community standards. We may also block or suspend
						accounts engaging in repeated violations. When feasible, we will provide
						notice and an opportunity to appeal.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						8. Privacy
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						Our Privacy Policy explains how we collect, use and protect student data. By
						using the service you consent to such processing as described. For sensitive
						or special-category data we will obtain explicit consent before collection.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						9. Third-party Services
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						We may integrate with third-party tools (payment processors, hosting,
						analytics). Those services are governed by their own terms and privacy
						practices — we are not responsible for third-party conduct. We take steps to
						select reputable providers and require data protection provisions where
						applicable.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						10. Disclaimers & Limitation of Liability
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						Services are provided "as is" and "as available". To the maximum extent
						permitted by law, Syntax Club disclaims all warranties, and will not be
						liable for incidental, consequential, indirect or special damages arising
						from use of the services, events or content — except where such limitation
						is prohibited by law.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						11. Indemnification
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						You agree to indemnify and hold harmless Syntax Club and its officers,
						volunteers and partners from claims arising out of your breach of these
						Terms, your misconduct, or your violation of third-party rights.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						12. Termination
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						The club may suspend or terminate access for breaches or when required by
						law. You may close your account by contacting the club; certain information
						may remain in archives for record-keeping, legal compliance or dispute
						resolution.
					</p>
				</section>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						13. Changes to Terms
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						We may update these Terms periodically. When changes are material we will
						provide notice (email or site announcement). Continued use after the
						effective date constitutes acceptance of the updated Terms.
					</p>
				</section>

				<section className="mb-6" aria-labelledby="governing-law">
					<h2
						id="governing-law"
						className="text-lg font-semibold"
						style={{ color: 'var(--text)' }}
					>
						14. Governing Law & Dispute Resolution
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						These Terms are governed by the laws of the jurisdiction where Syntax Club
						operates. Before initiating legal action parties will try to resolve
						disputes in good faith — contact us to begin the process.
					</p>
				</section>

				<section className="mb-6" aria-labelledby="contact-terms">
					<h2
						id="contact-terms"
						className="text-lg font-semibold"
						style={{ color: 'var(--text)' }}
					>
						15. Contact
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						For questions, requests or notices under these Terms:
					</p>
					<address
						className="mt-3 not-italic text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
						<div>
							<strong>Syntax Club</strong>
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
					</address>
				</section>

				<footer
					className="mt-6 text-center text-sm"
					style={{ color: 'var(--text-secondary)' }}
				>
					<p>Last updated: July 2025</p>
				</footer>
			</main>
		</div>
	);
};

export default TermsPolicy;
