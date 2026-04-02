"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Delete, X } from "lucide-react";
import styles from "./calculator.module.css";

/* ── Types ──────────────────────────────────────────────────────────────── */

type CalcButton = {
	label: string | React.ReactNode;
	value: string;
	type: "number" | "operator" | "action";
};

/* ── Calculator logic ───────────────────────────────────────────────────── */

function calculate(expression: string): string {
	try {
		// Replace × and ÷ with JS operators
		const sanitized = expression
			.replace(/×/g, "*")
			.replace(/÷/g, "/")
			.replace(/[^0-9+\-*/.()]/g, "");

		// eslint-disable-next-line no-new-func
		const result = Function(`"use strict"; return (${sanitized})`)();

		if (!isFinite(result)) return "Error";

		// Return clean number — strip unnecessary decimals
		return parseFloat(result.toFixed(10)).toString();
	} catch {
		return "Error";
	}
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function CalculatorModal({
	setOpenCalculator,
	setValue,
}: {
	setOpenCalculator: (open: boolean) => void;
	setValue: (value: number) => void;
}) {
	const t = useTranslations("calculator");
	const [expression, setExpression] = useState("0");
	const [justEvaluated, setJustEvaluated] = useState(false);

	function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
		if (e.target === e.currentTarget) setOpenCalculator(false);
	}

	const press = useCallback(
		(value: string) => {
			setExpression((prev) => {
				const isError = prev === "Error";

				switch (value) {
					case "C":
						setJustEvaluated(false);
						return "0";

					case "⌫":
						setJustEvaluated(false);
						if (isError) return "0";
						return prev.length <= 1 ? "0" : prev.slice(0, -1);

					case "=": {
						const result = calculate(prev);
						setJustEvaluated(true);
						return result;
					}

					case "%": {
						const result = calculate(`(${prev})/100`);
						setJustEvaluated(true);
						return result;
					}

					case "+/-": {
						if (prev.startsWith("-")) return prev.slice(1);
						return `-${prev}`;
					}

					default: {
						// After an evaluation, a number starts fresh; an operator continues
						const isOperator = ["+", "-", "×", "÷", "."].includes(value);
						if (justEvaluated && !isOperator) {
							setJustEvaluated(false);
							return value;
						}
						setJustEvaluated(false);
						if (isError) return value;
						if (prev === "0" && !isOperator && value !== ".") return value;
						return prev + value;
					}
				}
			});
		},
		[justEvaluated],
	);

	function handleDone() {
		const result = expression === "Error" ? 0 : Number(expression);
		setValue(result);
		setOpenCalculator(false);
	}

	const BUTTONS: CalcButton[] = [
		{ label: "C", value: "C", type: "action" },
		{ label: "+/-", value: "+/-", type: "action" },
		{ label: "%", value: "%", type: "action" },
		{ label: "÷", value: "÷", type: "operator" },

		{ label: "7", value: "7", type: "number" },
		{ label: "8", value: "8", type: "number" },
		{ label: "9", value: "9", type: "number" },
		{ label: "×", value: "×", type: "operator" },

		{ label: "4", value: "4", type: "number" },
		{ label: "5", value: "5", type: "number" },
		{ label: "6", value: "6", type: "number" },
		{ label: "-", value: "-", type: "operator" },

		{ label: "1", value: "1", type: "number" },
		{ label: "2", value: "2", type: "number" },
		{ label: "3", value: "3", type: "number" },
		{ label: "+", value: "+", type: "operator" },

		{ label: "0", value: "0", type: "number" },
		{ label: ".", value: ".", type: "number" },
		{ label: <Delete size={16} strokeWidth={2} />, value: "⌫", type: "action" },
		{ label: "=", value: "=", type: "operator" },
	];

	return (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div className={styles.container}>
				{/* ── Close ── */}
				<button
					className={styles.closeBtn}
					onClick={() => setOpenCalculator(false)}
					aria-label={t("close")}
				>
					<X size={14} strokeWidth={2.5} />
				</button>

				{/* ── Header ── */}
				<div className={styles.header}>
					<h2 className={styles.title}>{t("title")}</h2>
					<p className={styles.subtitle}>{t("subtitle")}</p>
				</div>

				{/* ── Display ── */}
				<div className={styles.display}>
					<span
						className={`${styles.displayText} ${expression.length > 12 ? styles.displaySmall : ""}`}
					>
						{expression}
					</span>
				</div>

				{/* ── Buttons ── */}
				<div className={styles.grid}>
					{BUTTONS.map((btn, i) => (
						<button
							key={i}
							className={`${styles.btn} ${styles[`btn_${btn.type}`]} ${btn.value === "=" ? styles.btn_equals : ""}`}
							onClick={() => press(btn.value)}
						>
							{btn.label}
						</button>
					))}
				</div>

				{/* ── Footer ── */}
				<div className={styles.footer}>
					<button
						className={styles.btnSecondary}
						onClick={() => setOpenCalculator(false)}
					>
						{t("cancel")}
					</button>
					<button className={styles.btnPrimary} onClick={handleDone}>
						{t("done")}
					</button>
				</div>
			</div>
		</div>
	);
}
