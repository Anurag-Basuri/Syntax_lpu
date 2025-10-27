import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Check } from 'lucide-react';

const DepartmentFilter = ({ departments, selectedDepartment, onSelect }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 px-4 py-2 bg-[#1a244f]/70 rounded-lg border border-[#3a56c9]/40 text-[#d0d5f7] hover:bg-[#243260]/70 transition-colors"
			>
				<Filter size={16} className="text-[#5d7df5]" />
				<span>{selectedDepartment ? selectedDepartment : 'All Departments'}</span>
				<ChevronDown
					size={16}
					className={`text-[#5d7df5] transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#0d1326]/95 backdrop-blur-md border border-[#3a56c9]/40 rounded-lg z-20 shadow-xl max-h-60 overflow-y-auto"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						<button
							onClick={() => {
								onSelect(null);
								setIsOpen(false);
							}}
							className={`flex items-center justify-between w-full px-3 py-2 rounded-lg ${
								!selectedDepartment
									? 'bg-[#3a56c9]/20 text-white'
									: 'text-[#d0d5f7] hover:bg-[#1a244f]/70'
							} transition-colors mb-1`}
						>
							<span>All Departments</span>
							{!selectedDepartment && <Check size={16} className="text-[#5d7df5]" />}
						</button>

						{departments.map((dept) => (
							<button
								key={dept}
								onClick={() => {
									onSelect(dept);
									setIsOpen(false);
								}}
								className={`flex items-center justify-between w-full px-3 py-2 rounded-lg ${
									selectedDepartment === dept
										? 'bg-[#3a56c9]/20 text-white'
										: 'text-[#d0d5f7] hover:bg-[#1a244f]/70'
								} transition-colors mb-1`}
							>
								<span>{dept}</span>
								{selectedDepartment === dept && (
									<Check size={16} className="text-[#5d7df5]" />
								)}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default DepartmentFilter;
