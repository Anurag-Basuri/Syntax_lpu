import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

const GalleryGrid = ({ gallery, onImageClick }) => {
	if (!gallery?.length) return null;
	return (
		<section>
			<h3 className="text-2xl font-bold mb-4 text-white">Gallery</h3>
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
				{gallery.map((m, idx) => (
					<motion.button
						key={m?.publicId || idx}
						onClick={() => onImageClick(m)}
						className="group relative rounded-xl overflow-hidden border border-white/10 aspect-w-16 aspect-h-9"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.05 * idx, duration: 0.5 }}
					>
						<img
							src={m?.url}
							alt={m?.caption || `Gallery ${idx + 1}`}
							loading="lazy"
							className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
						/>
						<div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
							<Eye className="text-white" size={32} />
						</div>
					</motion.button>
				))}
			</div>
		</section>
	);
};

export default GalleryGrid;
