"use client";

import { motion } from "framer-motion";
import { FaChartLine, FaLayerGroup, FaWaveSquare } from "react-icons/fa";

interface Step {
	step: string;
	title: string;
	description: string;
}

const STEPS: Step[] = [
	{
		step: "01",
		title: "Reading the Market's Pulse",
		description:
			"Every moment, Rthmn takes the market's pulse by measuring how energy is distributed across eight fundamental states. Think of it like a doctor checking vital signs - we're looking at the market's natural rhythms.",
	},
	{
		step: "02",
		title: "Identifying the Current State",
		description:
			"Just as you can tell if water is about to boil by watching its behavior, Rthmn recognizes which state the market is in by observing how energy moves between positions.",
	},
	{
		step: "03",
		title: "Predicting the Flow",
		description:
			"Once we know the current state, we can predict where the energy will flow next. It's like knowing that water will always flow downhill - market energy follows similar natural laws.",
	},
	{
		step: "04",
		title: "Measuring Momentum",
		description:
			"We track how strongly the market is moving between states. This tells us not just where the market is going, but how powerful the move might be.",
	},
	{
		step: "05",
		title: "Pattern Recognition",
		description:
			"As these states change, they create patterns. Like learning to read music, once you understand these patterns, you can predict what comes next.",
	},
];

const CORE_CONCEPTS = [
	{
		title: "Rhythmic State Theory",
		description:
			"Understanding market structure through the lens of 8 distinct rhythmic states that interact in a deterministic pattern.",
		icon: FaLayerGroup,
	},
	{
		title: "Wave Propagation",
		description:
			"Market energy flows through positions like ripples in water, creating predictable patterns of movement.",
		icon: FaWaveSquare,
	},
	{
		title: "Pattern Recognition",
		description:
			"Identifying recurring market structures through rhythmic state analysis and wave mechanics.",
		icon: FaChartLine,
	},
];

const AlgorithmPage = () => {
	return (
		<div className="min-h-screen bg-black">
			{/* Hero Section */}
			<section className="relative overflow-hidden py-20">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
				<div className="mx-auto max-w-7xl px-8">
					<div className="flex flex-col items-center text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-8"
						>
							<div
								className={`font-dmmono mb-6 flex items-center gap-3 text-sm tracking-wider text-white/60`}
							>
								<div className="h-[1px] w-12 bg-linear-to-r from-transparent via-[#32353C] to-transparent" />
								THE TECHNOLOGY
								<div className="h-[1px] w-12 bg-linear-to-r from-transparent via-[#32353C] to-transparent" />
							</div>
							<h1
								className={`font-outfit bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-6xl font-bold tracking-tight text-transparent lg:text-7xl`}
							>
								The Algorithm
							</h1>
						</motion.div>
						<p
							className={`font-dmmono mx-auto max-w-3xl text-lg leading-relaxed text-white/60`}
						>
							At the heart of Rthmn lies a revolutionary approach to market
							analysis. Our algorithm decodes market structure through the lens
							of position-based mathematics, revealing patterns that emerge from
							the complex interaction of 8 distinct market positions.
						</p>
					</div>
				</div>
			</section>

			{/* Additional Technical Details */}
			<section className="py-20">
				<div className="mx-auto max-w-7xl px-8">
					<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
						{/* Left Column - Technical Specs */}
						<div className="space-y-8">
							<h2 className={`font-outfit text-3xl font-bold text-white`}>
								Technical Specifications
							</h2>
							<div className="space-y-6">
								<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6">
									<h3
										className={`font-dmmono mb-4 text-xl font-semibold text-white/90`}
									>
										Processing Architecture
									</h3>
									<ul className="space-y-3 text-white/60">
										<li>• Position state processing: {"<"}1ms latency</li>
										<li>• Pattern validation rate: 100k checks/second</li>
										<li>• Real-time market data integration</li>
									</ul>
								</div>
								<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6">
									<h3
										className={`font-dmmono mb-4 text-xl font-semibold text-white/90`}
									>
										Pattern Recognition
									</h3>
									<ul className="space-y-3 text-white/60">
										<li>• 8-dimensional position analysis</li>
										<li>• Wave propagation tracking</li>
										<li>• State transition validation</li>
									</ul>
								</div>
							</div>
						</div>

						{/* Right Column - Core Concepts */}
						<div className="space-y-8">
							<h2 className={`font-outfit text-3xl font-bold text-white`}>
								Core Concepts
							</h2>
							<div className="grid gap-6">
								{CORE_CONCEPTS.map((concept, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, x: 20 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										className="group relative rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6 transition-all duration-300 hover:bg-[#1C1E23]"
									>
										<div className="flex items-start gap-4">
											<div className="rounded-full bg-[#1C1E23] p-3">
												<concept.icon className="h-6 w-6 text-white" />
											</div>
											<div>
												<h3
													className={`font-outfit mb-2 text-xl font-semibold text-white`}
												>
													{concept.title}
												</h3>
												<p className="text-white/60">{concept.description}</p>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Algorithm Metrics Section */}
			<section className="py-20">
				<div className="mx-auto max-w-7xl px-8">
					<div className="mb-16 text-center">
						<div
							className={`font-dmmono mb-6 flex items-center justify-center gap-3 text-sm tracking-wider text-white/60`}
						>
							<div className="h-[1px] w-12 bg-linear-to-r from-transparent via-[#32353C] to-transparent" />
							PERFORMANCE METRICS
							<div className="h-[1px] w-12 bg-linear-to-r from-transparent via-[#32353C] to-transparent" />
						</div>
						<h2
							className={`font-outfit bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl`}
						>
							Algorithm Performance
						</h2>
					</div>

					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						{[
							{
								metric: "99.99%",
								label: "Position Accuracy",
								description:
									"Precise identification of market positions across all timeframes",
							},
							{
								metric: "< 0.5ms",
								label: "Processing Time",
								description:
									"Ultra-fast pattern recognition and position state analysis",
							},
							{
								metric: "8D",
								label: "Analysis Depth",
								description:
									"Eight-dimensional market structure analysis for complete coverage",
							},
						].map((item, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className="group relative rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8 backdrop-blur-lg"
							>
								<div className="mb-4">
									<div
										className={`font-dmmono mb-1 text-4xl font-bold text-white`}
									>
										{item.metric}
									</div>
									<div
										className={`font-outfit text-lg font-semibold primary-text`}
									>
										{item.label}
									</div>
								</div>
								<p className="text-white/60">{item.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Wave Analysis Section */}
			<section className="relative py-20">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
				<div className="mx-auto max-w-7xl px-8">
					<div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div
								className={`font-dmmono mb-6 text-sm tracking-wider text-white/60`}
							>
								WAVE MECHANICS
							</div>
							<h2
								className={`font-outfit mb-8 bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl`}
							>
								Position Wave Analysis
							</h2>
							<div className="space-y-6">
								{[
									{
										title: "Wave Formation Detection",
										description:
											"Identifies emerging market structures through position-based wave patterns before they complete",
									},
									{
										title: "Energy Flow Mapping",
										description:
											"Tracks the propagation of market energy through positions to predict likely continuation or reversal points",
									},
									{
										title: "Pattern Confluence",
										description:
											"Analyzes multiple wave patterns simultaneously to identify high-probability trade setups",
									},
								].map((item, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 10 }}
										whileInView={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6"
									>
										<h3
											className={`font-outfit mb-2 text-xl font-semibold text-white/90`}
										>
											{item.title}
										</h3>
										<p className="text-white/60">{item.description}</p>
									</motion.div>
								))}
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="relative aspect-square rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8"
						>
							<div className="absolute inset-0 -z-10 bg-linear-to-br from-white/[0.03] to-transparent" />
							<div className="flex h-full items-center justify-center">
								<div className={`font-dmmono text-center primary-text`}>
									[Wave Visualization Placeholder]
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Position States Section */}
			<section className="py-20">
				<div className="mx-auto max-w-7xl px-8">
					<div className="mb-16 text-center">
						<div
							className={`font-dmmono mb-6 flex items-center justify-center gap-3 text-sm tracking-wider text-white/60`}
						>
							<div className="h-[1px] w-12 bg-linear-to-r from-transparent via-[#32353C] to-transparent" />
							POSITION STATES
							<div className="h-[1px] w-12 bg-linear-to-r from-transparent via-[#32353C] to-transparent" />
						</div>
						<h2
							className={`font-outfit mb-8 bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl`}
						>
							8-Dimensional Analysis
						</h2>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{[
							{
								state: "P1",
								name: "Accumulation Base",
								description: "Initial position building phase",
							},
							{
								state: "P2",
								name: "Early Momentum",
								description: "First signs of directional bias",
							},
							{
								state: "P3",
								name: "Momentum Acceleration",
								description: "Increased position commitment",
							},
							{
								state: "P4",
								name: "Peak Extension",
								description: "Maximum position extension",
							},
							{
								state: "P5",
								name: "Initial Reversal",
								description: "First signs of position unwinding",
							},
							{
								state: "P6",
								name: "Momentum Shift",
								description: "Clear change in position bias",
							},
							{
								state: "P7",
								name: "Distribution Phase",
								description: "Advanced position unwinding",
							},
							{
								state: "P8",
								name: "Reset State",
								description: "Return to neutral positioning",
							},
						].map((item, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className="group relative rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6 transition-all duration-300 hover:bg-[#1C1E23]"
							>
								<div className="mb-4 flex items-center gap-4">
									<div className="rounded-full bg-[#1C1E23] p-3">
										<div
											className={`font-dmmono text-lg font-bold primary-text`}
										>
											{item.state}
										</div>
									</div>
									<h3
										className={`font-outfit text-lg font-semibold text-white/90`}
									>
										{item.name}
									</h3>
								</div>
								<p className="text-sm text-white/60">{item.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Philosophy Section */}
			<section className="relative overflow-hidden py-32">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
				<div className="mx-auto max-w-7xl px-8">
					<div className="grid grid-cols-1 gap-24 lg:grid-cols-2">
						<div>
							<div
								className={`font-dmmono mb-6 text-sm tracking-wider text-white/60`}
							>
								PHILOSOPHICAL FOUNDATION
							</div>
							<h2
								className={`font-outfit mb-8 bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl`}
							>
								Beyond Traditional
								<br />
								Market Theory
							</h2>
							<div className="space-y-6 text-lg text-white/60">
								<p>
									At its core, our algorithm challenges the fundamental
									assumptions of traditional market analysis. Instead of viewing
									markets through the lens of price action alone, we see them as
									complex energy systems governed by the interaction of eight
									distinct position states.
								</p>
								<p>
									This perspective draws inspiration from quantum mechanics,
									where particles exist in multiple states simultaneously until
									observed. Similarly, market positions exist in a state of
									probabilistic flux until they crystallize into definitive
									patterns.
								</p>
								<div className="mt-12 flex items-center gap-8">
									<div className="h-[2px] w-12 bg-linear-to-r from-white/40 to-transparent" />
									<span className={`font-dmmono primary-text`}>
										Position State Theory
									</span>
								</div>
							</div>
						</div>

						<div className="relative">
							<div className="absolute -inset-4 rounded-xl border border-[#1C1E23] bg-[#1C1E23] backdrop-blur-sm" />
							<div className="relative space-y-8 p-8">
								<div>
									<h3
										className={`font-outfit mb-4 text-2xl font-semibold text-white/90`}
									>
										The Observer Effect
									</h3>
									<p className="text-white/60">
										Markets, like quantum systems, are influenced by the act of
										observation. The collective observation of positions by
										market participants creates a feedback loop that influences
										future state transitions.
									</p>
								</div>
								<div>
									<h3
										className={`font-outfit mb-4 text-2xl font-semibold text-white/90`}
									>
										Energy Conservation
									</h3>
									<p className="text-white/60">
										Market energy is neither created nor destroyed, but flows
										between positions in predictable patterns. Understanding
										these flows allows us to anticipate future market movements.
									</p>
								</div>
								<div>
									<h3
										className={`font-outfit mb-4 text-2xl font-semibold text-white/90`}
									>
										Deterministic Chaos
									</h3>
									<p className="text-white/60">
										While markets appear chaotic at the surface, they follow
										deterministic patterns at the position level. These patterns
										emerge from the complex interaction of the eight fundamental
										position states.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Market Mechanics Deep Dive */}
			<section className="py-32">
				<div className="mx-auto max-w-7xl px-8">
					<div className="mx-auto max-w-3xl text-center">
						<div
							className={`font-dmmono mb-6 text-sm tracking-wider text-white/60`}
						>
							MARKET MECHANICS
						</div>
						<h2
							className={`font-outfit mb-8 bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl`}
						>
							The Mathematics of Markets
						</h2>
						<p className="text-lg text-white/60">
							Understanding market structure through the lens of mathematical
							physics reveals patterns that are invisible to traditional
							analysis.
						</p>
					</div>

					<div className="mt-24 space-y-24">
						{/* Core Equations Section */}
						<div className="relative rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-12">
							<div className="absolute -inset-px rounded-lg bg-linear-to-b from-[#1C1E23] to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />
							<div className="relative">
								<h3
									className={`font-outfit mb-6 text-3xl font-semibold text-white/90`}
								>
									Core Position State Mathematics
								</h3>
								<div className="grid gap-12 lg:grid-cols-2">
									<div className="space-y-6">
										<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6">
											<div className={`font-dmmono mb-2 text-sm primary-text`}>
												Position State Evolution
											</div>
											<div className={`font-dmmono text-lg primary-text`}>
												P(t+1) = ∑[P(t) × W(s)] + ε
											</div>
											<div className="mt-4 text-sm text-white/60">
												Where:
												<ul className="mt-2 ml-4 space-y-1">
													<li>• P(t) = Current position state</li>
													<li>• W(s) = State transition weights</li>
													<li>• ε = Market noise factor</li>
												</ul>
											</div>
										</div>

										<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6">
											<div className={`font-dmmono mb-2 text-sm primary-text`}>
												Wave Propagation Function
											</div>
											<div className={`font-dmmono text-lg primary-text`}>
												ψ(p,t) = A·sin(kp - ωt + φ)
											</div>
											<div className="mt-4 text-sm text-white/60">
												Where:
												<ul className="mt-2 ml-4 space-y-1">
													<li>• A = Wave amplitude</li>
													<li>• k = Position wavenumber</li>
													<li>• ω = Angular frequency</li>
													<li>• φ = Phase offset</li>
												</ul>
											</div>
										</div>
									</div>

									<div className="space-y-6">
										<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6">
											<div className={`font-dmmono mb-2 text-sm primary-text`}>
												Energy Conservation Law
											</div>
											<div className={`font-dmmono text-lg primary-text`}>
												E = ∑[Pi²] = constant
											</div>
											<div className="mt-4 text-sm text-white/60">
												The sum of squared position energies remains constant
												across the system, only redistributing between states.
											</div>
										</div>

										<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-6">
											<div className={`font-dmmono mb-2 text-sm primary-text`}>
												State Transition Probability
											</div>
											<div className={`font-dmmono text-lg primary-text`}>
												T(i→j) = |⟨ψj|H|ψi⟩|²
											</div>
											<div className="mt-4 text-sm text-white/60">
												Quantum-inspired transition probability between position
												states i and j under market Hamiltonian H.
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Mathematical Framework Section */}
						<div className="space-y-12">
							<h3
								className={`font-outfit text-3xl font-semibold text-white/90`}
							>
								Understanding the Framework
							</h3>

							<div className="grid gap-8 lg:grid-cols-2">
								<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8">
									<h4
										className={`font-outfit mb-4 text-xl font-semibold text-white/90`}
									>
										Step 1: Position State Space
									</h4>
									<div className="space-y-4 text-white/60">
										<p>
											Each market position (P1-P8) exists as a quantum-like
											state vector in an 8-dimensional Hilbert space. The
											magnitude of each vector represents the energy of that
											position.
										</p>
										<div className="rounded-lg bg-[#1C1E23] p-4">
											<div className={`font-dmmono text-sm`}>
												|ψ⟩ = ∑ ci|Pi⟩
											</div>
										</div>
									</div>
								</div>

								<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8">
									<h4
										className={`font-outfit mb-4 text-xl font-semibold text-white/90`}
									>
										Step 2: Wave Propagation
									</h4>
									<div className="space-y-4 text-white/60">
										<p>
											Position waves propagate through the market according to
											the wave equation. The phase relationship between waves
											determines market structure.
										</p>
										<div className="rounded-lg bg-[#1C1E23] p-4">
											<div className={`font-dmmono text-sm`}>
												∂²ψ/∂t² = v²∇²ψ
											</div>
										</div>
									</div>
								</div>

								<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8">
									<h4
										className={`font-outfit mb-4 text-xl font-semibold text-white/90`}
									>
										Step 3: Energy Flow
									</h4>
									<div className="space-y-4 text-white/60">
										<p>
											Energy flows between positions following the principle of
											least action. The Hamiltonian operator H describes the
											total energy of the system.
										</p>
										<div className="rounded-lg bg-[#1C1E23] p-4">
											<div className={`font-dmmono text-sm`}>
												H = T + V = -ℏ²/2m ∇² + V(x)
											</div>
										</div>
									</div>
								</div>

								<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8">
									<h4
										className={`font-outfit mb-4 text-xl font-semibold text-white/90`}
									>
										Step 4: Pattern Formation
									</h4>
									<div className="space-y-4 text-white/60">
										<p>
											Market patterns emerge from the interference of position
											waves. The correlation function C(r) measures pattern
											strength.
										</p>
										<div className="rounded-lg bg-[#1C1E23] p-4">
											<div className={`font-dmmono text-sm`}>
												C(r) = ⟨ψ(x)ψ(x+r)⟩
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Simplified Explanation Section */}
			<section className="relative py-32">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
				<div className="mx-auto max-w-7xl px-8">
					<div className="mx-auto max-w-3xl text-center">
						<div
							className={`font-dmmono mb-6 text-sm tracking-wider text-white/60`}
						>
							UNDERSTANDING RTHMN
						</div>
						<h2
							className={`font-outfit mb-8 bg-linear-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl`}
						>
							The Algorithm Explained
						</h2>
						<p className="text-lg text-white/60">
							Let's break down how Rthmn sees and understands markets, from the
							ground up.
						</p>
					</div>

					<div className="mt-24 space-y-16">
						{/* Basic Concept Cards */}
						<div className="grid gap-8 lg:grid-cols-3">
							<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8">
								<h3
									className={`font-outfit mb-4 text-2xl font-semibold text-white/90`}
								>
									Think of Water
								</h3>
								<p className="text-white/60">
									Markets flow like water. Just as water moves in waves and
									currents, market energy flows in predictable patterns. When
									you drop a stone in water, you can predict how the ripples
									will move. Rthmn does the same with market movements.
								</p>
							</div>

							<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8">
								<h3
									className={`font-outfit mb-4 text-2xl font-semibold text-white/90`}
								>
									Eight Natural States
								</h3>
								<p className="text-white/60">
									Just like water can be ice, liquid, or vapor, markets have
									eight natural states. These aren't just arbitrary numbers -
									they're like the fundamental shapes that all market movements
									are built from.
								</p>
							</div>

							<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8">
								<h3
									className={`font-outfit mb-4 text-2xl font-semibold text-white/90`}
								>
									Energy Never Dies
								</h3>
								<p className="text-white/60">
									Market energy doesn't disappear - it transforms. When one
									trend ends, that energy flows into a new pattern. Rthmn tracks
									these energy flows to anticipate where the market will move
									next.
								</p>
							</div>
						</div>

						{/* Step by Step Explanation */}
						<div className="space-y-12">
							<h3
								className={`font-outfit text-3xl font-semibold text-white/90`}
							>
								How It Works
							</h3>

							<div className="space-y-8">
								{STEPS.map((item, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										className="relative rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-8"
									>
										<div className="flex items-start gap-8">
											<div
												className={`font-dmmono text-3xl font-bold primary-text`}
											>
												{item.step}
											</div>
											<div>
												<h4
													className={`font-outfit mb-3 text-xl font-semibold text-white/90`}
												>
													{item.title}
												</h4>
												<p className="text-lg text-white/60">
													{item.description}
												</p>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>

						{/* Real World Example */}
						<div className="rounded-lg border border-[#1C1E23] bg-[#1C1E23] p-12">
							<h3
								className={`font-outfit mb-6 text-3xl font-semibold text-white/90`}
							>
								A Simple Example
							</h3>
							<div className="space-y-6 text-lg text-white/60">
								<p>
									Imagine you're watching waves at the beach. You notice that
									after a big wave (State 1), there's usually a calm period
									(State 2), followed by another big wave (State 3). This
									pattern repeats predictably.
								</p>
								<p>
									Markets work the same way. After a strong upward move (like
									our big wave), there's often a period of calm (our State 2),
									followed by another strong move. Rthmn identifies these
									patterns automatically, across all eight states.
								</p>
								<p>
									The key difference? While ocean waves are affected only by
									wind and tide, market waves are created by the collective
									actions of all traders. Rthmn reads these collective actions
									and predicts where they'll lead next.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AlgorithmPage;
