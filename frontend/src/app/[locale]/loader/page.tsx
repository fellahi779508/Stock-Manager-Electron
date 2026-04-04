"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ------------------------------------------------------------------
   LoadingScreen Component
   Fully theme-aware (light / dim / dark) using your provided CSS variables.
   Can be used in controlled mode (pass status/progress) or uncontrolled demo mode.
------------------------------------------------------------------ */

export interface LoadingScreenProps {
	/**
	 * Main status message (e.g., "Loading workspace...").
	 * If not provided, the component runs an internal simulation with auto-updating statuses.
	 */
	status?: string;
	/**
	 * Numeric progress 0-100. When provided, shows a determinate progress bar.
	 * If omitted in controlled mode, only the spinner is shown.
	 */
	progress?: number;
	/**
	 * Optional secondary / detail text shown below the main status.
	 */
	subtext?: string;
	/**
	 * Force visibility of progress bar when progress is defined.
	 * Default: true when progress is a number.
	 */
	showProgressBar?: boolean;
	/**
	 * Custom array of status messages for the internal simulation.
	 * Only used when `status` prop is NOT provided (uncontrolled mode).
	 */
	simulationSteps?: string[];
	/**
	 * Milliseconds between each status update in simulation mode.
	 * @default 1800
	 */
	simulationIntervalMs?: number;
}

// Default loading steps for the internal simulation
const DEFAULT_STEPS = [
	"Initializing environment...",
	"Loading configurations...",
	"Connecting to services...",
	"Preparing workspace...",
	"Almost ready...",
	"Launching application...",
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({
	status: externalStatus,
	progress: externalProgress,
	subtext: externalSubtext,
	showProgressBar: externalShowProgressBar,
	simulationSteps = DEFAULT_STEPS,
	simulationIntervalMs = 1800,
}) => {
	// ──────────────────────────────────────────────────────────────────
	// Internal state (used only when component is uncontrolled)
	// ──────────────────────────────────────────────────────────────────
	const [internalStatus, setInternalStatus] = useState<string>(
		simulationSteps[0] || "Loading...",
	);
	const [internalProgress, setInternalProgress] = useState<number>(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const stepIndexRef = useRef<number>(0);

	// Determine if we are in controlled mode (parent provides status)
	const isControlled = externalStatus !== undefined;

	// The effective status message to display
	const displayStatus = isControlled
		? externalStatus || "Loading..."
		: internalStatus;
	// The effective progress value (0-100). If undefined, no progress bar (or just spinner)
	const displayProgress = isControlled ? externalProgress : internalProgress;
	// Determine whether to show the progress bar
	const shouldShowProgressBar = isControlled
		? (externalShowProgressBar ?? displayProgress !== undefined)
		: true; // uncontrolled always shows progress bar

	// Helper to update simulation step
	const updateSimulation = useCallback(() => {
		if (isControlled) return; // never run simulation when controlled

		setInternalStatus(simulationSteps[stepIndexRef.current]);

		// Increment progress smoothly based on current step index and total steps
		const totalSteps = simulationSteps.length;
		const targetProgress = Math.min(
			100,
			Math.floor(((stepIndexRef.current + 1) / totalSteps) * 100),
		);
		setInternalProgress(targetProgress);

		// Move to next step, but stop at the last step
		if (stepIndexRef.current < totalSteps - 1) {
			stepIndexRef.current += 1;
		} else {
			// When we reach the final step, keep the last status but stop interval
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}
	}, [isControlled, simulationSteps]);

	// Start / stop simulation interval (uncontrolled mode only)
	useEffect(() => {
		if (isControlled) {
			// If switching from uncontrolled to controlled, clean up simulation
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		// Reset simulation state when entering uncontrolled mode
		stepIndexRef.current = 0;
		setInternalStatus(simulationSteps[0] || "Loading...");
		setInternalProgress(0);

		// Set interval to update steps progressively
		if (intervalRef.current) clearInterval(intervalRef.current);
		intervalRef.current = setInterval(() => {
			updateSimulation();
		}, simulationIntervalMs);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isControlled, simulationSteps, simulationIntervalMs, updateSimulation]);

	// Format progress percentage for display
	const progressPercent =
		displayProgress !== undefined
			? Math.min(100, Math.max(0, displayProgress))
			: 0;

	// Effective subtext: external subtext takes precedence, otherwise fallback for uncontrolled
	const displaySubtext =
		externalSubtext !== undefined
			? externalSubtext
			: !isControlled && displayProgress !== undefined && displayProgress < 100
				? `Please wait — ${Math.floor(progressPercent)}% complete`
				: "";

	return (
		<div className="ts-loading-screen">
			{/* Raw CSS styles — fully uses your global theme variables */}
			<style>{`
        .ts-loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background: var(--background);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          z-index: 9999;
          transition: background 0.2s ease;
        }

        .ts-loading-card {
          max-width: 480px;
          width: 90%;
          background: var(--surface);
          border-radius: 1.5rem;
          padding: 2rem 2rem 2.25rem;
          box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--border);
          text-align: center;
          backdrop-filter: blur(0px);
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }

        /* Spinner animation */
        .ts-spinner {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem auto;
          border: 4px solid var(--border);
          border-top: 4px solid var(--accent);
          border-radius: 50%;
          animation: ts-spin 0.9s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
          transition: border-color 0.2s ease;
        }

        @keyframes ts-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Status text */
        .ts-status {
          font-size: 1.3rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--foreground);
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
          transition: color 0.2s ease;
        }

        /* Subtext / details */
        .ts-subtext {
          font-size: 0.9rem;
          color: var(--foreground-muted);
          margin: 0 0 1.25rem 0;
          line-height: 1.5;
          transition: color 0.2s ease;
        }

        /* Progress bar container */
        .ts-progress-container {
          width: 100%;
          background: var(--background-secondary);
          border-radius: 999px;
          height: 6px;
          overflow: hidden;
          margin: 0.75rem 0 0.25rem 0;
          transition: background 0.2s ease;
        }

        .ts-progress-fill {
          width: ${progressPercent}%;
          height: 100%;
          background: var(--accent);
          border-radius: 999px;
          transition: width 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }

        .ts-progress-percentage {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--accent);
          margin-top: 0.5rem;
          letter-spacing: 0.3px;
          transition: color 0.2s ease;
        }

        /* Optional subtle hint / app info (only for visual polish) */
        .ts-app-badge {
          margin-top: 1.75rem;
          font-size: 0.7rem;
          color: var(--foreground-muted);
          opacity: 0.7;
          border-top: 1px solid var(--border);
          padding-top: 1rem;
          display: inline-block;
          width: 100%;
          transition: opacity 0.2s ease, border-color 0.2s ease;
        }

        /* Accessibility: screen reader live region */
        .ts-live-region {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .ts-loading-card {
            padding: 1.5rem 1.25rem;
          }
          .ts-status {
            font-size: 1.1rem;
          }
          .ts-spinner {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>

			<div className="ts-loading-card">
				<div className="ts-spinner" aria-hidden="true" />

				<h2 className="ts-status">{displayStatus}</h2>

				{displaySubtext && <p className="ts-subtext">{displaySubtext}</p>}

				{shouldShowProgressBar && displayProgress !== undefined && (
					<div>
						<div className="ts-progress-container">
							<div className="ts-progress-fill" />
						</div>
						<div className="ts-progress-percentage">
							{Math.floor(progressPercent)}%
						</div>
					</div>
				)}

				{/* Optional decorative badge — you can replace or remove */}
				<div className="ts-app-badge">Electron App • Loading environment</div>
			</div>

			{/* ARIA live region for screen readers */}
			<div className="ts-live-region" aria-live="polite" aria-atomic="true">
				{displayStatus}{" "}
				{displayProgress !== undefined
					? `${Math.floor(progressPercent)} percent complete`
					: ""}
			</div>
		</div>
	);
};

export default LoadingScreen;
