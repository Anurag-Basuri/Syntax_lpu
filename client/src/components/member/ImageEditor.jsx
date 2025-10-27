import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	RotateCw,
	ZoomIn,
	ZoomOut,
	RefreshCw,
	X,
	Upload,
	Save,
	Edit3,
	FlipHorizontal,
	FlipVertical,
	Contrast,
	Palette,
	Crop,
	RotateCcw,
	Grid,
	Eye,
	EyeOff,
} from 'lucide-react';

const CONTROL_BTN =
	'inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-700 transition-colors text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400';
const SLIDER = 'w-full accent-blue-500 h-2 rounded-lg appearance-none bg-gray-200 dark:bg-gray-700';
const TAB_BTN = 'px-4 py-2 rounded-lg font-semibold transition-colors text-sm focus:outline-none';
const TAB_BTN_ACTIVE = 'bg-blue-600 text-white shadow';
const TAB_BTN_INACTIVE =
	'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-700';

const FILTERS = [
	{ name: 'None', fn: () => 'none' },
	{ name: 'Grayscale', fn: () => 'grayscale(100%)' },
	{ name: 'Sepia', fn: () => 'sepia(100%)' },
	{ name: 'Invert', fn: () => 'invert(100%)' },
	{ name: 'Blur', fn: () => 'blur(2px)' },
	{ name: 'Hue Rotate', fn: () => 'hue-rotate(90deg)' },
	{ name: 'Cool', fn: () => 'brightness(110%) contrast(120%) saturate(120%) hue-rotate(200deg)' },
	{ name: 'Warm', fn: () => 'brightness(110%) contrast(110%) saturate(120%) hue-rotate(-20deg)' },
];

const ASPECT_RATIOS = [
	{ name: 'Square', value: 1 },
	{ name: '16:9', value: 16 / 9 },
	{ name: '4:3', value: 4 / 3 },
	{ name: '3:4', value: 3 / 4 },
];

const ImageEditor = ({
	image,
	onSave,
	onCancel,
	isEditing,
	onUploadNew,
	setIsEditingImage,
	viewOriginal = false,
	setViewOriginal,
}) => {
	const canvasRef = useRef(null);
	const imageRef = useRef(null);
	const containerRef = useRef(null);

	const [transform, setTransform] = useState({
		scale: 1,
		rotation: 0,
		x: 0,
		y: 0,
		flipX: false,
		flipY: false,
	});
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [imageLoaded, setImageLoaded] = useState(false);
	const [canvasSize, setCanvasSize] = useState(320);
	const [brightness, setBrightness] = useState(100);
	const [contrast, setContrast] = useState(100);
	const [saturation, setSaturation] = useState(100);
	const [activeTab, setActiveTab] = useState('transform');
	const [filterIndex, setFilterIndex] = useState(0);
	const [aspectRatio, setAspectRatio] = useState(1);
	const [showGrid, setShowGrid] = useState(true);
	const [controlsExpanded, setControlsExpanded] = useState(true);

	// Responsive canvas sizing
	useEffect(() => {
		const updateSize = () => {
			if (containerRef.current) {
				const container = containerRef.current;
				const maxSize = Math.min(
					container.offsetWidth - 16,
					window.innerHeight * 0.45,
					500
				);
				setCanvasSize(Math.max(200, maxSize));
			}
		};
		updateSize();
		window.addEventListener('resize', updateSize);
		return () => window.removeEventListener('resize', updateSize);
	}, []);

	// Load image and auto-fit to crop area
	useEffect(() => {
		if (!image) return;

		setImageLoaded(false);
		const img = new Image();
		img.onload = () => {
			imageRef.current = img;
			setImageLoaded(true);

			const cropW = canvasSize * 0.8;
			const cropH = cropW / aspectRatio;
			const scaleX = cropW / img.width;
			const scaleY = cropH / img.height;
			const autoScale = Math.max(scaleX, scaleY);

			setTransform({
				scale: autoScale,
				rotation: 0,
				x: 0,
				y: 0,
				flipX: false,
				flipY: false,
			});
		};
		img.src = image;
	}, [image, canvasSize, aspectRatio]);

	// Update the draw function to make the crop area clearer
	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		const img = imageRef.current;
		if (!canvas || !img || !imageLoaded) return;

		const ctx = canvas.getContext('2d');
		const { scale, rotation, x, y, flipX, flipY } = transform;

		const cropW = canvasSize * 0.8;
		const cropH = cropW / aspectRatio;
		const centerX = canvasSize / 2;
		const centerY = canvasSize / 2;

		// Clear canvas
		ctx.clearRect(0, 0, canvasSize, canvasSize);

		// Draw background
		ctx.fillStyle = '#f0f0f0';
		ctx.fillRect(0, 0, canvasSize, canvasSize);

		// Calculate crop area boundaries
		const cropLeft = centerX - cropW / 2;
		const cropTop = centerY - cropH / 2;
		const cropRight = centerX + cropW / 2;
		const cropBottom = centerY + cropH / 2;

		// First draw the image
		ctx.save();
		ctx.translate(centerX + x, centerY + y);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.scale(scale * (flipX ? -1 : 1), scale * (flipY ? -1 : 1));

		if (!viewOriginal) {
			ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${FILTERS[filterIndex].fn()}`;
		}

		ctx.drawImage(img, -img.width / 2, -img.height / 2);
		ctx.restore();

		// Draw overlay for non-crop areas (darker but not as faded)
		ctx.save();
		// Top rectangle
		ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		ctx.fillRect(0, 0, canvasSize, cropTop);

		// Bottom rectangle
		ctx.fillRect(0, cropBottom, canvasSize, canvasSize - cropBottom);

		// Left rectangle
		ctx.fillRect(0, cropTop, cropLeft, cropH);

		// Right rectangle
		ctx.fillRect(cropRight, cropTop, canvasSize - cropRight, cropH);
		ctx.restore();

		// Draw crop border with a clearer appearance
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.rect(cropLeft, cropTop, cropW, cropH);
		ctx.stroke();

		// Add a second border for better visibility
		ctx.strokeStyle = '#3b82f6';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.rect(cropLeft - 1, cropTop - 1, cropW + 2, cropH + 2);
		ctx.stroke();

		// Draw grid lines if enabled
		if (showGrid) {
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
			ctx.lineWidth = 1;
			ctx.setLineDash([5, 5]);

			// Vertical lines
			for (let i = 1; i < 3; i++) {
				const xPos = centerX - cropW / 2 + (cropW / 3) * i;
				ctx.moveTo(xPos, centerY - cropH / 2);
				ctx.lineTo(xPos, centerY + cropH / 2);
			}

			// Horizontal lines
			for (let i = 1; i < 3; i++) {
				const yPos = centerY - cropH / 2 + (cropH / 3) * i;
				ctx.moveTo(centerX - cropW / 2, yPos);
				ctx.lineTo(centerX + cropW / 2, yPos);
			}

			ctx.stroke();
			ctx.setLineDash([]);
		}
	}, [
		transform,
		imageLoaded,
		canvasSize,
		brightness,
		contrast,
		saturation,
		filterIndex,
		viewOriginal,
		aspectRatio,
		showGrid,
	]);

	useEffect(() => {
		draw();
	}, [draw]);

	// Mouse/Touch handlers
	const getEventPos = (e) => {
		const rect = canvasRef.current.getBoundingClientRect();
		const clientX = e.touches?.[0]?.clientX ?? e.clientX;
		const clientY = e.touches?.[0]?.clientY ?? e.clientY;
		return {
			x: clientX - rect.left,
			y: clientY - rect.top,
		};
	};

	const handleStart = (e) => {
		if (!isEditing) return;
		const pos = getEventPos(e);
		setIsDragging(true);
		setDragStart({
			x: pos.x - transform.x,
			y: pos.y - transform.y,
		});
	};

	const handleMove = (e) => {
		if (!isDragging) return;
		const pos = getEventPos(e);
		setTransform((prev) => ({
			...prev,
			x: pos.x - dragStart.x,
			y: pos.y - dragStart.y,
		}));
	};

	const handleEnd = () => {
		setIsDragging(false);
	};

	// Control functions
	const updateTransform = (updates) => {
		setTransform((prev) => ({ ...prev, ...updates }));
	};

	const resetImage = () => {
		if (!imageRef.current) return;

		const img = imageRef.current;
		const cropW = canvasSize * 0.8;
		const cropH = cropW / aspectRatio;
		const scaleX = cropW / img.width;
		const scaleY = cropH / img.height;
		const autoScale = Math.max(scaleX, scaleY);

		setTransform({
			scale: autoScale,
			rotation: 0,
			x: 0,
			y: 0,
			flipX: false,
			flipY: false,
		});

		setBrightness(100);
		setContrast(100);
		setSaturation(100);
		setFilterIndex(0);
	};

	const fitImage = () => {
		if (!imageRef.current) return;

		const img = imageRef.current;
		const cropW = canvasSize * 0.8;
		const cropH = cropW / aspectRatio;
		const scaleX = cropW / img.width;
		const scaleY = cropH / img.height;
		const autoScale = Math.max(scaleX, scaleY);

		setTransform({
			scale: autoScale,
			rotation: 0,
			x: 0,
			y: 0,
			flipX: false,
			flipY: false,
		});
	};

	// Save cropped image
	const handleSave = async () => {
		if (!canvasRef.current || !imageRef.current) return;

		const img = imageRef.current;
		const outputW = 800;
		const cropW = canvasSize * 0.8;
		const outputH = Math.round(outputW / aspectRatio);
		const outputCanvas = document.createElement('canvas');
		const outputCtx = outputCanvas.getContext('2d');

		outputCanvas.width = outputW;
		outputCanvas.height = outputH;

		const { scale, rotation, x, y, flipX, flipY } = transform;
		const center = canvasSize / 2;
		const scaleFactor = outputW / cropW;

		// Apply filters
		outputCtx.filter = viewOriginal
			? 'none'
			: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${FILTERS[filterIndex].fn()}`;

		// Draw transformed image
		outputCtx.save();
		outputCtx.translate(outputW / 2, outputH / 2);
		outputCtx.rotate((rotation * Math.PI) / 180);
		outputCtx.scale(
			scale * (flipX ? -1 : 1) * scaleFactor,
			scale * (flipY ? -1 : 1) * scaleFactor
		);
		outputCtx.drawImage(
			img,
			-img.width / 2 + x * scaleFactor,
			-img.height / 2 + y * scaleFactor
		);
		outputCtx.restore();

		outputCanvas.toBlob(onSave, 'image/jpeg', 0.92);
	};

	// Render control sections
	const renderTransformControls = () => (
		<div className="space-y-4 sm:space-y-6">
			{/* Aspect Ratio */}
			<div>
				<div className="flex items-center justify-between mb-1">
					<span className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
						Aspect Ratio
					</span>
				</div>
				<div className="grid grid-cols-2 gap-1 sm:gap-2">
					{ASPECT_RATIOS.map((ratio) => (
						<button
							key={ratio.name}
							className={`px-2 py-1.5 text-xs rounded-md font-medium transition-colors ${
								aspectRatio === ratio.value
									? 'bg-blue-500 text-white'
									: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
							}`}
							onClick={() => {
								setAspectRatio(ratio.value);
								setTimeout(fitImage, 100);
							}}
						>
							{ratio.name}
						</button>
					))}
				</div>
			</div>

			{/* Quick Actions */}
			<div className="flex flex-wrap gap-1 sm:gap-2">
				<button
					className={`${CONTROL_BTN} ${showGrid ? 'bg-blue-500 text-white' : ''}`}
					onClick={() => setShowGrid(!showGrid)}
					title="Toggle Grid"
				>
					<Grid size={18} />
				</button>
				<button
					className={CONTROL_BTN}
					onClick={() => updateTransform({ x: 0, y: 0 })}
					title="Center Image"
				>
					<RefreshCw size={18} />
				</button>
				<button className={CONTROL_BTN} onClick={fitImage} title="Fit to Frame">
					<Crop size={18} />
				</button>
				<button
					className={`${CONTROL_BTN} ${transform.flipX ? 'bg-blue-500 text-white' : ''}`}
					onClick={() => updateTransform({ flipX: !transform.flipX })}
					title="Flip Horizontal"
				>
					<FlipHorizontal size={18} />
				</button>
				<button
					className={`${CONTROL_BTN} ${transform.flipY ? 'bg-blue-500 text-white' : ''}`}
					onClick={() => updateTransform({ flipY: !transform.flipY })}
					title="Flip Vertical"
				>
					<FlipVertical size={18} />
				</button>
			</div>

			{/* Zoom */}
			<div>
				<div className="flex items-center justify-between mb-1">
					<span className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
						Zoom
					</span>
					<span className="text-xs text-gray-500">
						{Math.round(transform.scale * 100)}%
					</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						className={CONTROL_BTN}
						onClick={() =>
							updateTransform({ scale: Math.max(0.1, transform.scale - 0.1) })
						}
					>
						<ZoomOut size={18} />
					</button>
					<input
						type="range"
						min={10}
						max={300}
						value={Math.round(transform.scale * 100)}
						onChange={(e) => updateTransform({ scale: Number(e.target.value) / 100 })}
						className={SLIDER}
					/>
					<button
						className={CONTROL_BTN}
						onClick={() =>
							updateTransform({ scale: Math.min(5, transform.scale + 0.1) })
						}
					>
						<ZoomIn size={18} />
					</button>
				</div>
			</div>

			{/* Rotate */}
			<div>
				<div className="flex items-center justify-between mb-1">
					<span className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
						Rotate
					</span>
					<span className="text-xs text-gray-500">{transform.rotation}°</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						className={CONTROL_BTN}
						onClick={() =>
							updateTransform({ rotation: (transform.rotation - 90 + 360) % 360 })
						}
					>
						<RotateCcw size={18} />
					</button>
					<input
						type="range"
						min={0}
						max={359}
						value={transform.rotation}
						onChange={(e) => updateTransform({ rotation: Number(e.target.value) })}
						className={SLIDER}
					/>
					<button
						className={CONTROL_BTN}
						onClick={() =>
							updateTransform({ rotation: (transform.rotation + 90) % 360 })
						}
					>
						<RotateCw size={18} />
					</button>
				</div>
			</div>
		</div>
	);

	const renderAdjustControls = () => (
		<div className="space-y-4 sm:space-y-6">
			{/* Brightness */}
			<div>
				<div className="flex items-center justify-between mb-1">
					<span className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
						Brightness
					</span>
					<span className="text-xs text-gray-500">{brightness}%</span>
				</div>
				<input
					type="range"
					min={0}
					max={200}
					value={brightness}
					onChange={(e) => setBrightness(Number(e.target.value))}
					className={SLIDER}
				/>
			</div>

			{/* Contrast */}
			<div>
				<div className="flex items-center justify-between mb-1">
					<span className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
						Contrast
					</span>
					<span className="text-xs text-gray-500">{contrast}%</span>
				</div>
				<input
					type="range"
					min={0}
					max={200}
					value={contrast}
					onChange={(e) => setContrast(Number(e.target.value))}
					className={SLIDER}
				/>
			</div>

			{/* Saturation */}
			<div>
				<div className="flex items-center justify-between mb-1">
					<span className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
						Saturation
					</span>
					<span className="text-xs text-gray-500">{saturation}%</span>
				</div>
				<input
					type="range"
					min={0}
					max={200}
					value={saturation}
					onChange={(e) => setSaturation(Number(e.target.value))}
					className={SLIDER}
				/>
			</div>

			{/* Reset */}
			<button
				className={CONTROL_BTN}
				onClick={() => {
					setBrightness(100);
					setContrast(100);
					setSaturation(100);
				}}
			>
				<RefreshCw size={18} />
			</button>
		</div>
	);

	const renderFilterControls = () => (
		<div className="space-y-4 sm:space-y-6">
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
				{FILTERS.map((f, idx) => (
					<button
						key={f.name}
						className={`p-2 rounded-lg transition-colors text-xs ${
							filterIndex === idx
								? 'bg-blue-500 text-white'
								: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
						}`}
						onClick={() => setFilterIndex(idx)}
					>
						{f.name}
					</button>
				))}
			</div>
		</div>
	);

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.98 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-1 sm:p-4"
				style={{ overflowY: 'auto' }}
			>
				<div
					ref={containerRef}
					className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl mx-auto p-2 sm:p-4 flex flex-col"
					style={{ maxHeight: '98vh' }}
				>
					{/* Header */}
					<div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
						<span className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
							{isEditing ? 'Edit Image' : 'Image Preview'}
						</span>
						<button onClick={onCancel} className={CONTROL_BTN}>
							<X size={20} />
						</button>
					</div>

					{/* Main Content */}
					<div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 p-1 sm:p-4 overflow-y-auto">
						{/* Canvas */}
						<div className="flex-1 flex flex-col items-center justify-center min-w-0">
							<canvas
								ref={canvasRef}
								width={canvasSize}
								height={canvasSize}
								className="rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 touch-none cursor-move w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
								style={{
									background: '#222',
									height: 'auto',
									maxWidth: '100%',
								}}
								onMouseDown={handleStart}
								onMouseMove={handleMove}
								onMouseUp={handleEnd}
								onMouseLeave={handleEnd}
								onTouchStart={handleStart}
								onTouchMove={handleMove}
								onTouchEnd={handleEnd}
								onClick={() => setViewOriginal && setViewOriginal(!viewOriginal)}
							/>
						</div>

						{/* Controls */}
						{isEditing && (
							<div className="w-full lg:w-80 space-y-4 lg:space-y-6 overflow-auto pt-2 lg:pt-0">
								{/* Mobile Controls Toggle */}
								<div className="lg:hidden flex justify-between items-center">
									<span className="text-sm font-medium text-gray-700 dark:text-gray-200">
										Edit Controls
									</span>
									<button
										className="text-blue-500 p-2"
										onClick={() => setControlsExpanded(!controlsExpanded)}
									>
										{controlsExpanded ? 'Hide' : 'Show'}
									</button>
								</div>

								{/* Controls Content */}
								<div
									className={`${controlsExpanded ? 'block' : 'hidden lg:block'} max-h-[40vh] lg:max-h-none overflow-y-auto`}
								>
									{/* Tabs */}
									<div className="flex gap-1 sm:gap-2 mb-2 overflow-x-auto pb-1">
										<button
											className={
												activeTab === 'transform'
													? TAB_BTN + ' ' + TAB_BTN_ACTIVE
													: TAB_BTN + ' ' + TAB_BTN_INACTIVE
											}
											onClick={() => setActiveTab('transform')}
										>
											Transform
										</button>
										<button
											className={
												activeTab === 'adjust'
													? TAB_BTN + ' ' + TAB_BTN_ACTIVE
													: TAB_BTN + ' ' + TAB_BTN_INACTIVE
											}
											onClick={() => setActiveTab('adjust')}
										>
											Adjust
										</button>
										<button
											className={
												activeTab === 'filters'
													? TAB_BTN + ' ' + TAB_BTN_ACTIVE
													: TAB_BTN + ' ' + TAB_BTN_INACTIVE
											}
											onClick={() => setActiveTab('filters')}
										>
											Filters
										</button>
									</div>

									{activeTab === 'transform' && renderTransformControls()}
									{activeTab === 'adjust' && renderAdjustControls()}
									{activeTab === 'filters' && renderFilterControls()}

									{/* Reset All Button */}
									<div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
										<button
											onClick={resetImage}
											className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
										>
											<RefreshCw size={16} />
											Reset All
										</button>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row justify-end gap-2 mt-1 sm:mt-4 px-2 sm:px-4 pb-2 sm:pb-4 border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-4">
						<div className="flex-1 flex items-center gap-2">
							{!isEditing && onUploadNew && (
								<>
									<button
										onClick={onUploadNew}
										className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all text-sm"
									>
										<Upload size={16} />
										<span className="hidden xs:inline">Upload New</span>
										<span className="xs:hidden">Upload</span>
									</button>
									{setIsEditingImage && (
										<button
											onClick={() => setIsEditingImage(true)}
											className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all text-sm"
										>
											<Edit3 size={16} />
											Edit
										</button>
									)}
								</>
							)}
						</div>
						<div className="flex gap-2">
							<button
								onClick={onCancel}
								className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium text-sm"
							>
								{isEditing ? 'Cancel' : 'Close'}
							</button>
							{isEditing && (
								<button
									onClick={handleSave}
									disabled={!imageLoaded}
									className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all text-sm"
								>
									<Save size={16} />
									<span className="hidden xs:inline">Save Image</span>
									<span className="xs:hidden">Save</span>
								</button>
							)}
						</div>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

export default ImageEditor;
