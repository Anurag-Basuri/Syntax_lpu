import React from 'react';
import { useNavigate } from 'react-router-dom';
import './policies.css'; // NEW

const PrivacyPolicy = () => {
	const navigate = useNavigate();

	return (
		<div className="policy-container" aria-live="polite">
			<main className="policy-card policy-prose" aria-labelledby="privacy-heading">
				<nav className="policy-nav" aria-hidden={false}>
					<button
						onClick={() => navigate(-1)}
						className="policy-back-btn"
						aria-label="Go back"
					>
						← Back
					</button>
				</nav>

				<header className="text-center" style={{ marginBottom: 16 }}>
					<h1 id="privacy-heading">Privacy & Student Data Policy</h1>
					<p style={{ marginTop: 8 }}>
						Effective: <strong>July 2025</strong> — clear explanation of the student
						data we collect, why we collect it, how we protect it and your rights.
					</p>
				</header>

				<section aria-labelledby="what-we-collect" style={{ marginBottom: 16 }}>
					<h2 id="what-we-collect">What student data we collect</h2>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						<div>
							<ul style={{ paddingLeft: 18 }}>
								<li>
									<strong>Account details:</strong> name, LPU ID, email, password
									hash.
								</li>
								<li>
									<strong>Contact:</strong> phone, hostel/address (for events &
									coordination).
								</li>
								<li>
									<strong>Academic & enrollment:</strong> course, department,
									year/semester.
								</li>
								<li>
									<strong>Participation:</strong> event registrations, attendance.
								</li>
								<li>
									<strong>Content & media:</strong> photos, project samples,
									public profile info.
								</li>
							</ul>
						</div>

						<div>
							<p>
								We collect only the information necessary to operate the club,
								manage events and communicate with members. Sensitive data is
								collected only when strictly necessary and with explicit consent.
							</p>
							<p style={{ marginTop: 8 }}>
								If you have concerns about any field, contact the club data officer
								(details below) to request clarification or limited processing.
							</p>
						</div>
					</div>
				</section>

				<section aria-labelledby="data-usage" style={{ marginBottom: 16 }}>
					<h2 id="data-usage">Why we collect it (purposes)</h2>
					<dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						<div>
							<dt style={{ fontWeight: 600 }}>Service delivery</dt>
							<dd>Manage accounts, registrations, tickets and member services.</dd>
						</div>
						<div>
							<dt style={{ fontWeight: 600 }}>Communications</dt>
							<dd>Send announcements, event updates and membership messages.</dd>
						</div>
						<div>
							<dt style={{ fontWeight: 600 }}>Safety & logistics</dt>
							<dd>Ensure safety at events and manage accommodation when needed.</dd>
						</div>
						<div>
							<dt style={{ fontWeight: 600 }}>Research & improvements</dt>
							<dd>
								Aggregate, anonymized data to improve club programs and resources.
							</dd>
						</div>
					</dl>
				</section>

				<section aria-labelledby="security" style={{ marginBottom: 16 }}>
					<h2 id="security">Data security & third parties</h2>
					<p>
						We use reasonable organizational and technical safeguards to protect data.
						Access is limited to authorized club personnel and selected service
						providers (hosting, email, payments). We require data protection provisions
						in vendor agreements.
					</p>
				</section>

				<section aria-labelledby="contact" style={{ marginBottom: 8 }}>
					<h2 id="contact">Contact & data officer</h2>
					<p>Questions, access requests or complaints may be sent to:</p>
					<address style={{ marginTop: 8 }}>
						<div>
							<strong>Data Controller:</strong> Syntax Club
						</div>
						<div>
							<strong>Email:</strong>{' '}
							<a href="mailto:syntax.studorg@gmail.com">syntax.studorg@gmail.com</a>
						</div>
						<div
							style={{
								marginTop: 8,
								fontSize: '.95rem',
								color: 'var(--text-secondary)',
							}}
						>
							We aim to respond to data requests within 10 business days.
						</div>
					</address>
				</section>

				<footer style={{ marginTop: 8, textAlign: 'center' }}>
					<p style={{ color: 'var(--text-secondary)' }}>
						By using club services you consent to processing described above. For legal
						questions consult official university guidance.
					</p>
				</footer>
			</main>
		</div>
	);
};

export default PrivacyPolicy;
