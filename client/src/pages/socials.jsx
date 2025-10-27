import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Heart,
	MessageCircle,
	Share2,
	Plus,
	ChevronUp,
	Play,
	Pause,
	Volume2,
	VolumeX,
	MoreHorizontal,
	Trash2,
	X,
	Upload,
	Video as VideoIcon,
	Sparkles,
	Lightbulb,
	Zap,
	Code,
	Globe,
	TrendingUp,
} from 'lucide-react';
import { apiClient } from '../services/api.js';
import { getToken, decodeToken } from '../utils/handleTokens';
import useSocials from '../hooks/useSocials.js';

// Helper for time ago formatting
const formatTimeAgo = (dateString) => {
	const date = new Date(dateString);
	const now = new Date();
	const diff = Math.floor((now - date) / 1000);
	if (diff < 60) return `${diff}s ago`;
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return date.toLocaleDateString();
};

const PostCard = ({ post, currentUser, onDelete }) => {
	const [showOptions, setShowOptions] = useState(false);
	const [isLiked, setIsLiked] = useState(false);
	const [imageLoaded, setImageLoaded] = useState({});
	const [videoStates, setVideoStates] = useState({});
	const videoRefs = useRef({});

	const canDelete = currentUser.role === 'admin' || currentUser.id === post.user.id;

	const toggleVideo = (id) => {
		const video = videoRefs.current[id];
		if (video) {
			if (video.paused) {
				video.play();
				setVideoStates((prev) => ({ ...prev, [id]: { ...prev[id], playing: true } }));
			} else {
				video.pause();
				setVideoStates((prev) => ({ ...prev, [id]: { ...prev[id], playing: false } }));
			}
		}
	};

	const toggleMute = (id) => {
		const video = videoRefs.current[id];
		if (video) {
			video.muted = !video.muted;
			setVideoStates((prev) => ({ ...prev, [id]: { ...prev[id], muted: video.muted } }));
		}
	};

	// Normalize media for UI (combine images/videos)
	const media = [
		...(post.images?.map((img) => ({ ...img, type: 'image', id: img.publicId || img._id })) ||
			[]),
		...(post.videos?.map((vid) => ({ ...vid, type: 'video', id: vid.publicId || vid._id })) ||
			[]),
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -100 }}
			transition={{ duration: 0.5 }}
			className="bg-[#0d1326]/70 backdrop-blur-lg rounded-2xl overflow-hidden border border-[#2a3a72] shadow-[0_10px_30px_rgba(0,0,0,0.3)] group mb-8"
		>
			{/* Post Header */}
			<div className="p-6 pb-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="relative">
							<motion.img
								whileHover={{ scale: 1.05 }}
								src={post.user?.avatar || post.user?.profilePicture}
								alt={post.user?.name || post.user?.fullname}
								className="w-12 h-12 rounded-full object-cover ring-2 ring-[#3a56c9] transition-all duration-300"
							/>
							{post.user?.verified && (
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2 }}
									className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center"
								>
									<div className="w-2 h-2 bg-white rounded-full"></div>
								</motion.div>
							)}
						</div>
						<div>
							<div className="flex items-center space-x-2">
								<h3 className="font-semibold text-white hover:text-cyan-400 transition-colors cursor-pointer">
									{post.user?.name || post.user?.fullname}
								</h3>
								{post.user?.role === 'admin' && (
									<motion.span
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#3a56c9] to-[#5d7df5] text-white rounded-full"
									>
										Admin
									</motion.span>
								)}
							</div>
							<p className="text-sm text-[#9ca3d4]">
								{formatTimeAgo(post.createdAt)}
							</p>
						</div>
					</div>
					{canDelete && (
						<div className="relative">
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setShowOptions(!showOptions)}
								className="p-2 hover:bg-[#1a244f] rounded-full transition-colors opacity-0 group-hover:opacity-100"
							>
								<MoreHorizontal className="w-5 h-5 text-[#5d7df5]" />
							</motion.button>
							<AnimatePresence>
								{showOptions && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95, y: -10 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: -10 }}
										className="absolute right-0 top-full mt-2 bg-[#0d1326] backdrop-blur-lg rounded-lg shadow-lg border border-[#2a3a72] z-10"
									>
										<button
											onClick={() => {
												onDelete(post._id);
												setShowOptions(false);
											}}
											className="flex items-center space-x-2 px-4 py-3 text-red-400 hover:bg-[#1a244f] w-full text-left rounded-lg transition-colors"
										>
											<Trash2 className="w-4 h-4" />
											<span>Delete Post</span>
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					)}
				</div>
			</div>
			{/* Post Content */}
			<div className="px-6 pb-4">
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.1 }}
					className="text-[#d0d5f7] leading-relaxed"
				>
					{post.content}
				</motion.p>
			</div>
			{/* Media Grid */}
			{media.length > 0 && (
				<div className="mb-4">
					{media.length === 1 ? (
						<div className="px-6">
							<div className="rounded-xl overflow-hidden">
								{media[0].type === 'image' ? (
									<motion.div
										initial={{ opacity: 0, scale: 1.05 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.6 }}
										className="relative overflow-hidden"
									>
										<img
											src={media[0].url}
											alt="Post media"
											className="w-full h-96 object-cover transition-transform duration-700 hover:scale-105"
											onLoad={() =>
												setImageLoaded((prev) => ({
													...prev,
													[media[0].id]: true,
												}))
											}
										/>
										{!imageLoaded[media[0].id] && (
											<div className="absolute inset-0 bg-[#1a244f] animate-pulse"></div>
										)}
									</motion.div>
								) : (
									<div className="relative">
										<video
											ref={(el) => (videoRefs.current[media[0].id] = el)}
											src={media[0].url}
											poster={media[0].thumbnail}
											className="w-full h-96 object-cover"
											muted
											loop
										/>
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="flex space-x-4">
												<motion.button
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.95 }}
													onClick={() => toggleVideo(media[0].id)}
													className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
												>
													{videoStates[media[0].id]?.playing ? (
														<Pause className="w-6 h-6 text-white" />
													) : (
														<Play className="w-6 h-6 text-white ml-1" />
													)}
												</motion.button>
												<motion.button
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.95 }}
													onClick={() => toggleMute(media[0].id)}
													className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
												>
													{videoStates[media[0].id]?.muted !== false ? (
														<VolumeX className="w-6 h-6 text-white" />
													) : (
														<Volume2 className="w-6 h-6 text-white" />
													)}
												</motion.button>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					) : (
						<div className="px-6">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.6 }}
								className={`grid gap-2 rounded-xl overflow-hidden ${
									media.length === 2
										? 'grid-cols-2'
										: media.length === 3
											? 'grid-cols-3'
											: media.length === 4
												? 'grid-cols-2 grid-rows-2'
												: 'grid-cols-2 grid-rows-3'
								}`}
							>
								{media.slice(0, 4).map((m, index) => (
									<motion.div
										key={m.id}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										className={`relative overflow-hidden ${
											media.length === 5 && index === 0 ? 'row-span-2' : ''
										}`}
									>
										{m.type === 'image' ? (
											<img
												src={m.url}
												alt="Post media"
												className="w-full h-full object-cover min-h-[150px] transition-transform duration-300 hover:scale-110"
											/>
										) : (
											<div className="relative">
												<video
													ref={(el) => (videoRefs.current[m.id] = el)}
													src={m.url}
													poster={m.thumbnail}
													className="w-full h-full object-cover min-h-[150px]"
													muted
													loop
												/>
												<button
													onClick={() => toggleVideo(m.id)}
													className="absolute inset-0 flex items-center justify-center"
												>
													<motion.div
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.95 }}
														className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
													>
														{videoStates[m.id]?.playing ? (
															<Pause className="w-5 h-5 text-white" />
														) : (
															<Play className="w-5 h-5 text-white ml-0.5" />
														)}
													</motion.div>
												</button>
											</div>
										)}
										{media.length > 4 && index === 3 && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
											>
												<span className="text-white font-semibold text-lg">
													+{media.length - 4}
												</span>
											</motion.div>
										)}
									</motion.div>
								))}
							</motion.div>
						</div>
					)}
				</div>
			)}
			{/* Post Actions */}
			<div className="px-6 py-4 border-t border-[#2a3a72]">
				<div className="flex items-center space-x-6">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setIsLiked(!isLiked)}
						className={`flex items-center space-x-2 transition-all duration-300 ${
							isLiked ? 'text-[#ff5c8d]' : 'text-[#9ca3d4] hover:text-[#ff5c8d]'
						}`}
					>
						<Heart
							className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'fill-current scale-110' : ''}`}
						/>
						<span className="text-sm font-medium">
							{(post.likes || 0) + (isLiked ? 1 : 0)}
						</span>
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="flex items-center space-x-2 text-[#9ca3d4] hover:text-cyan-400 transition-colors"
					>
						<MessageCircle className="w-5 h-5" />
						<span className="text-sm font-medium">{post.comments || 0}</span>
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="flex items-center space-x-2 text-[#9ca3d4] hover:text-emerald-400 transition-colors"
					>
						<Share2 className="w-5 h-5" />
						<span className="text-sm font-medium">Share</span>
					</motion.button>
				</div>
			</div>
		</motion.div>
	);
};

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
	const [content, setContent] = useState('');
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const fileInputRef = useRef();

	const handleFileSelect = (e) => {
		const files = Array.from(e.target.files);
		if (selectedFiles.length + files.length > 5) return;
		const mapped = files.map((file) => ({
			id: Math.random().toString(36).substr(2, 9),
			url: URL.createObjectURL(file),
			file,
			type: file.type.startsWith('image') ? 'image' : 'video',
		}));
		setSelectedFiles((prev) => [...prev, ...mapped]);
	};

	const removeFile = (id) => {
		setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const token = getToken();
			const user = decodeToken(token);
			const formData = new FormData();
			formData.append('userId', user.id);
			formData.append('content', content);
			selectedFiles.forEach((f) => formData.append('files', f.file));
			await apiClient.post('/api/socials/create', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token}`,
				},
			});
			setContent('');
			setSelectedFiles([]);
			onSubmit();
			onClose();
		} catch (err) {
			// Optionally show error
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setContent('');
		setSelectedFiles([]);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="absolute inset-0 bg-[#0a0f1f]/90 backdrop-blur-sm"
				onClick={handleClose}
			></motion.div>
			<motion.div
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.9, y: 20 }}
				className="relative bg-[#0d1326] backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden border border-[#2a3a72]"
			>
				<div className="flex items-center justify-between p-6 border-b border-[#2a3a72]">
					<h2 className="text-xl font-semibold text-white">Create Post</h2>
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleClose}
						className="p-2 hover:bg-[#1a244f] rounded-full transition-colors"
					>
						<X className="w-5 h-5 text-[#5d7df5]" />
					</motion.button>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="What's on your mind?"
						className="w-full h-32 p-4 bg-[#1a244f] border border-[#2a3a72] text-white rounded-xl resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
					/>
					{selectedFiles.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="grid grid-cols-2 gap-4"
						>
							{selectedFiles.map((file, index) => (
								<motion.div
									key={file.id}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.1 }}
									className="relative group"
								>
									{file.type === 'image' ? (
										<img
											src={file.url}
											alt="Selected"
											className="w-full h-32 object-cover rounded-lg"
										/>
									) : (
										<div className="w-full h-32 bg-[#1a244f] rounded-lg flex items-center justify-center">
											<VideoIcon className="w-8 h-8 text-[#5d7df5]" />
										</div>
									)}
									<motion.button
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
										type="button"
										onClick={() => removeFile(file.id)}
										className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
									>
										<X className="w-4 h-4" />
									</motion.button>
								</motion.div>
							))}
						</motion.div>
					)}
					<div className="flex items-center justify-between pt-4 border-t border-[#2a3a72]">
						<div className="flex items-center space-x-4">
							<input
								ref={fileInputRef}
								type="file"
								multiple
								accept="image/*,video/*"
								onChange={handleFileSelect}
								className="hidden"
							/>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={selectedFiles.length >= 5}
								className="flex items-center space-x-2 px-4 py-2 bg-[#1a244f] text-cyan-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Upload className="w-5 h-5" />
								<span>Add Media ({selectedFiles.length}/5)</span>
							</motion.button>
						</div>
						<div className="flex items-center space-x-3">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								type="button"
								onClick={handleClose}
								className="px-6 py-2 text-[#9ca3d4] hover:bg-[#1a244f] rounded-lg transition-colors"
							>
								Cancel
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								type="submit"
								disabled={
									(!content.trim() && selectedFiles.length === 0) || isSubmitting
								}
								className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
							>
								{isSubmitting ? (
									<>
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										<span>Posting...</span>
									</>
								) : (
									<span>Post</span>
								)}
							</motion.button>
						</div>
					</div>
				</form>
			</motion.div>
		</div>
	);
};

const SocialsFeedPage = () => {
	const { socials, loading, refetch } = useSocials();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showScrollTop, setShowScrollTop] = useState(false);

	// Get current user from token
	const token = getToken();
	const user = token ? decodeToken(token) : null;
	const currentUser = user
		? {
				id: user.id,
				name: user.fullname,
				role: user.role,
				avatar: user.profilePicture,
			}
		: {
				id: 'guest',
				name: 'Guest',
				role: 'guest',
				avatar: '',
			};

	// Scroll to top logic
	React.useEffect(() => {
		const handleScroll = () => setShowScrollTop(window.scrollY > 200);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleDeletePost = async (id) => {
		try {
			await apiClient.delete(`/api/socials/${id}/delete`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			refetch();
		} catch (err) {
			// Optionally show error
		}
	};

	const handleCreatePost = () => {
		refetch();
	};

	const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] to-[#1a1f3a]">
			{/* Header */}
			<div className="bg-[#0a0f1f]/80 backdrop-blur-lg border-b border-[#2a3a72] sticky top-0 z-40">
				<div className="max-w-4xl mx-auto px-6 py-6">
					<div className="flex items-center justify-between mb-6">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6 }}
							className="flex items-center gap-3"
						>
							<div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-2 rounded-xl">
								<Sparkles className="w-8 h-8 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
									Vibrant Community
								</h1>
								<p className="text-[#9ca3d4] mt-1">
									Where technology meets purpose
								</p>
							</div>
						</motion.div>
						{(currentUser.role === 'admin' || currentUser.role === 'member') && (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setShowCreateModal(true)}
								className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/20 transition-all"
							>
								<Plus className="w-5 h-5" />
								<span>Create Post</span>
							</motion.button>
						)}
					</div>
				</div>
			</div>

			{/* Content Tips Banner */}
			<div className="max-w-4xl mx-auto px-4 py-3 bg-gradient-to-r from-[#1a244f] to-[#2a3a72] rounded-lg border border-[#3a56c9] m-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Lightbulb className="w-5 h-5 text-cyan-400" />
						<p className="text-cyan-300 text-sm">
							<span className="font-semibold">Content Tip:</span> Share your
							tech-for-good journey with #TechForGood
						</p>
					</div>
					<div className="flex gap-2">
						<motion.button
							whileHover={{ scale: 1.05 }}
							className="text-xs px-3 py-1 bg-[#0d1326]/60 rounded-full text-[#9ca3d4]"
						>
							#ImpactCoding
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							className="text-xs px-3 py-1 bg-[#0d1326]/60 rounded-full text-[#9ca3d4]"
						>
							#TechForGood
						</motion.button>
					</div>
				</div>
			</div>

			{/* Feed */}
			<div className="max-w-4xl mx-auto px-4 py-10">
				<AnimatePresence>
					{(!socials || socials.length === 0) && !loading && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							className="text-center text-[#9ca3d4] py-20"
						>
							No posts found. Be the first to share!
						</motion.div>
					)}
					{socials &&
						socials.map((post) => (
							<PostCard
								key={post._id}
								post={post}
								currentUser={currentUser}
								onDelete={handleDeletePost}
							/>
						))}
				</AnimatePresence>
				{loading && (
					<div className="flex justify-center py-10">
						<div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
					</div>
				)}
			</div>

			{/* Scroll to Top Button */}
			<AnimatePresence>
				{showScrollTop && (
					<motion.button
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 40 }}
						onClick={scrollToTop}
						className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white shadow-lg hover:scale-110 transition-transform"
						aria-label="Scroll to top"
					>
						<ChevronUp className="w-6 h-6" />
					</motion.button>
				)}
			</AnimatePresence>

			{/* Create Post Modal */}
			<CreatePostModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSubmit={handleCreatePost}
			/>
		</div>
	);
};

export default SocialsFeedPage;
