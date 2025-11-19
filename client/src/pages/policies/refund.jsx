import React from 'react';
import { useNavigate } from 'react-router-dom';

const RefundPolicy = () => {
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
				aria-labelledby="refund-heading"
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
						id="refund-heading"
						className="text-2xl md:text-3xl font-semibold"
						style={{ color: 'var(--accent-1, #7c3aed)' }}
					>
						Refund & Cancellation Policy
					</h1>
					<p
						className="mt-2 text-sm md:text-base"
						style={{ color: 'var(--text-secondary)' }}
					>
						Effective: <strong>July 2025</strong> — fair, transparent rules for ticket
						and registration refunds.
					</p>
				</header>

				<section className="mb-6">
					<h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
						Quick summary
					</h2>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						Unless an event explicitly states otherwise, registrations and ticket
						purchases are non‑refundable by default. We will issue full refunds when the
						club or its vendors fail to deliver a purchased service, when an event is
						cancelled by Syntax Club, or when an event is materially changed and you are
						unable to attend.
					</p>
				</section>

				<section className="mb-6" aria-labelledby="eligible-refunds">
					<h3
						id="eligible-refunds"
						className="text-md font-semibold"
						style={{ color: 'var(--text)' }}
					>
						When we will issue a refund
					</h3>
					<ul
						className="list-disc pl-5 mt-2 text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
						<li>
							<strong>Organizer error:</strong> Full refund if we fail to deliver your
							ticket or registration due to a club or vendor error (technical,
							administrative or payment failure).
						</li>
						<li>
							<strong>Event cancelled:</strong> Full refund if Syntax Club cancels an
							event and the event listing does not explicitly deny refunds.
						</li>
						<li>
							<strong>Material change:</strong> If an event’s date, location or format
							changes substantially and you cannot attend, you may request a refund;
							eligible requests are handled case‑by‑case.
						</li>
						<li>
							<strong>Duplicate / erroneous charge:</strong> Full refund after
							verification for clear billing mistakes.
						</li>
					</ul>
				</section>

				<section className="mb-6" aria-labelledby="exceptions">
					<h3
						id="exceptions"
						className="text-md font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Exceptions & non‑refundable items
					</h3>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						The following are generally non‑refundable unless the event listing
						specifies otherwise:
					</p>
					<ul
						className="list-disc pl-5 mt-2 text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
						<li>Transactions explicitly marked non‑refundable on the event page.</li>
						<li>Donations and sponsorship payments.</li>
						<li>Merchandise or physical goods unless faulty or misdelivered.</li>
						<li>
							Fees retained by third‑party payment providers where those fees are
							non‑recoverable.
						</li>
					</ul>
				</section>

				<section className="mb-6" aria-labelledby="how-to-request">
					<h3
						id="how-to-request"
						className="text-md font-semibold"
						style={{ color: 'var(--text)' }}
					>
						How to request a refund
					</h3>
					<ol
						className="list-decimal pl-5 mt-2 text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
						<li>
							Contact us by email at <strong>syntax.studorg@gmail.com</strong> or via
							the site contact form. Include: registration/ticket ID, your full name,
							event name and a short explanation.
						</li>
						<li>
							Attach supporting evidence where relevant (payment receipt, screenshots,
							correspondence).
						</li>
						<li>
							We will acknowledge receipt within 3 business days and begin review. We
							may request additional information to verify the claim.
						</li>
						<li>
							If approved, refunds are issued to the original payment method when
							feasible. If not feasible, we will offer an alternative mutually agreed
							method.
						</li>
					</ol>
				</section>

				<section className="mb-6" aria-labelledby="timelines">
					<h3
						id="timelines"
						className="text-md font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Timelines & processing
					</h3>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						Approved refunds are typically processed within{' '}
						<strong>7–14 business days</strong>. The time until funds appear in your
						account depends on your bank/payment provider. We will notify you by email
						when a refund has been initiated.
					</p>
				</section>

				<section className="mb-6" aria-labelledby="chargebacks">
					<h3
						id="chargebacks"
						className="text-md font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Chargebacks & disputes
					</h3>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						If you open a dispute with your bank before contacting us, we may pause your
						account or place holds pending investigation. Please contact the club first
						so we can resolve issues quickly — chargebacks may result in additional
						administrative actions if fraudulent.
					</p>
				</section>

				<section className="mb-6" aria-labelledby="examples">
					<h3
						id="examples"
						className="text-md font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Examples (common scenarios)
					</h3>
					<ul
						className="list-disc pl-5 mt-2 text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
						<li>
							<strong>Event cancelled by organizer:</strong> Full refund to affected
							registrants.
						</li>
						<li>
							<strong>
								Payment succeeded but no ticket delivered due to system error:
							</strong>{' '}
							Full refund after verification.
						</li>
						<li>
							<strong>Registrant decides not to attend:</strong> No refund unless the
							event page allows cancellations.
						</li>
					</ul>
				</section>

				<section className="mb-6" aria-labelledby="contact">
					<h3
						id="contact"
						className="text-md font-semibold"
						style={{ color: 'var(--text)' }}
					>
						Contact & support
					</h3>
					<p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
						For refund requests or questions, contact:
					</p>
					<address
						className="mt-3 not-italic text-sm"
						style={{ color: 'var(--text-secondary)' }}
					>
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
							<strong>Response target:</strong> We aim to respond within 3 business
							days.
						</div>
					</address>
				</section>

				<footer
					className="mt-6 text-center text-sm"
					style={{ color: 'var(--text-secondary)' }}
				>
					<p>
						These terms are intended to be fair to participants while protecting club
						operations. Syntax Club may update this policy; material changes will be
						communicated on the site. Last updated: July 2025.
					</p>
				</footer>
			</main>
		</div>
	);
};

export default RefundPolicy;
