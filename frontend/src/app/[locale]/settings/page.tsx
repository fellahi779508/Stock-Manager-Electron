"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import styles from "./settings.module.css";
import {
	Globe,
	Sun,
	Moon,
	Sunset,
	Download,
	Upload,
	CheckCircle2,
	ChevronRight,
	Loader2,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */

type Theme = "light" | "dim" | "dark";

const LANGUAGES = [
	{ code: "en", label: "English", native: "English" },
	{ code: "fr", label: "French", native: "Français" },
	{ code: "ar", label: "Arabic", native: "العربية" },
] as const;

const THEMES: { value: Theme; icon: React.ReactNode }[] = [
	{ value: "light", icon: <Sun size={15} strokeWidth={2} /> },
	{ value: "dim", icon: <Sunset size={15} strokeWidth={2} /> },
	{ value: "dark", icon: <Moon size={15} strokeWidth={2} /> },
];

const API = "http://localhost:3001";

/* ── Helpers ────────────────────────────────────────────────────────────── */

function getSavedTheme(): Theme {
	try {
		return (localStorage.getItem("theme") as Theme) ?? "light";
	} catch {
		return "light";
	}
}

function applyTheme(theme: Theme) {
	document.documentElement.setAttribute("data-theme", theme);
	try {
		localStorage.setItem("theme", theme);
	} catch {}
}

function saveLang(code: string) {
	try {
		localStorage.setItem("lang", code);
	} catch {}
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
	const t = useTranslations("settings");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const [theme, setTheme] = useState<Theme>("light");
	const [exporting, setExporting] = useState(false);
	const [importing, setImporting] = useState(false);

	useEffect(() => {
		const saved = getSavedTheme();
		setTheme(saved);
		applyTheme(saved);
	}, []);

	/* ── Language ── */
	function handleLangChange(code: string) {
		saveLang(code);
		const segments = pathname.split("/");
		segments[1] = code;
		router.push(segments.join("/"));
		toast.success(t("toast.langChanged"));
	}

	/* ── Theme ── */
	function handleThemeChange(value: Theme) {
		setTheme(value);
		applyTheme(value);
		toast.success(t("toast.themeChanged"));
	}

	/* ── Export ── */
	async function handleExport() {
		setExporting(true);
		try {
			const res = await fetch(`${API}/backup/export`);

			if (!res.ok) {
				toast.error(t("toast.exportError"));
				return;
			}

			const blob = await res.blob();
			const filename = `StockData-backup-${Date.now()}.sqlite`;

			if ("showSaveFilePicker" in window) {
				const fileHandle = await (window as any).showSaveFilePicker({
					suggestedName: filename,
					types: [
						{
							description: "SQLite Database",
							accept: { "application/octet-stream": [".sqlite"] },
						},
					],
				});
				const writable = await fileHandle.createWritable();
				await writable.write(blob);
				await writable.close();
			} else {
				// Firefox fallback
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				a.click();
				URL.revokeObjectURL(url);
			}

			toast.success(t("toast.exportSuccess"));
		} catch (err: any) {
			if (err?.name === "AbortError") return;
			toast.error(t("toast.exportError"));
		} finally {
			setExporting(false);
		}
	}

	/* ── Import ── */
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function handleImportClick() {
		if ("showOpenFilePicker" in window) {
			try {
				const [fileHandle] = await (window as any).showOpenFilePicker({
					types: [
						{
							description: "SQLite Database",
							accept: { "application/octet-stream": [".sqlite"] },
						},
					],
					multiple: false,
				});
				const file: File = await fileHandle.getFile();
				await uploadFile(file);
			} catch (err: any) {
				if (err?.name === "AbortError") return;
				toast.error(t("toast.importError"));
			}
		} else {
			fileInputRef.current?.click();
		}
	}

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = "";
		await uploadFile(file);
	}

	async function uploadFile(file: File) {
		if (!file.name.endsWith(".sqlite")) {
			toast.error(t("toast.importInvalidFile"));
			return;
		}

		setImporting(true);
		try {
			// Use fetch directly — do NOT set Content-Type header manually.
			// The browser sets it automatically with the correct multipart boundary.
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch(`${API}/backup/import`, {
				method: "POST",
				body: formData,
			});

			const data = await res.json().catch(() => ({}));

			if (res.ok && data.status === 1) {
				toast.success(t("toast.importSuccess"));
			} else {
				toast.error(data.message ?? t("toast.importError"));
			}
		} catch {
			toast.error(t("toast.importError"));
		} finally {
			setImporting(false);
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.content}>
				{/* ── Page header ──────────────────────────────────────── */}
				<div className={styles.pageHeader}>
					<p className={styles.eyebrow}>{t("eyebrow")}</p>
					<h1 className={styles.pageTitle}>{t("title")}</h1>
					<p className={styles.pageDesc}>{t("desc")}</p>
				</div>

				{/* ── Language ─────────────────────────────────────────── */}
				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<Globe size={15} strokeWidth={2} />
						<h2 className={styles.sectionTitle}>{t("language.title")}</h2>
					</div>
					<p className={styles.sectionDesc}>{t("language.desc")}</p>

					<div className={styles.langGrid}>
						{LANGUAGES.map((l) => (
							<button
								key={l.code}
								className={`${styles.langCard} ${locale === l.code ? styles.langCardActive : ""}`}
								onClick={() => handleLangChange(l.code)}
							>
								{locale === l.code && (
									<CheckCircle2
										size={13}
										className={styles.checkIcon}
										strokeWidth={2.5}
									/>
								)}
								<span className={styles.langNative}>{l.native}</span>
								<span className={styles.langLabel}>{l.label}</span>
							</button>
						))}
					</div>
				</section>

				<div className={styles.divider} />

				{/* ── Theme ────────────────────────────────────────────── */}
				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<Sun size={15} strokeWidth={2} />
						<h2 className={styles.sectionTitle}>{t("theme.title")}</h2>
					</div>
					<p className={styles.sectionDesc}>{t("theme.desc")}</p>

					<div className={styles.themeGrid}>
						{THEMES.map(({ value, icon }) => (
							<button
								key={value}
								className={`${styles.themeCard} ${theme === value ? styles.themeCardActive : ""}`}
								onClick={() => handleThemeChange(value)}
							>
								<div
									className={`${styles.preview} ${styles[`preview_${value}`]}`}
								>
									<div className={styles.previewBar} />
									<div className={styles.previewBody}>
										<div
											className={styles.previewLine}
											style={{ width: "55%" }}
										/>
										<div
											className={styles.previewLine}
											style={{ width: "38%" }}
										/>
										<div className={styles.previewBlock} />
									</div>
								</div>
								<div className={styles.themeLabel}>
									{icon}
									<span>{t(`theme.${value}`)}</span>
									{theme === value && (
										<CheckCircle2
											size={13}
											className={styles.checkIcon}
											strokeWidth={2.5}
										/>
									)}
								</div>
							</button>
						))}
					</div>
				</section>

				<div className={styles.divider} />

				{/* ── Data ─────────────────────────────────────────────── */}
				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<Download size={15} strokeWidth={2} />
						<h2 className={styles.sectionTitle}>{t("data.title")}</h2>
					</div>
					<p className={styles.sectionDesc}>{t("data.desc")}</p>

					<div className={styles.dataActions}>
						<button
							className={styles.dataCard}
							onClick={handleExport}
							disabled={exporting || importing}
						>
							<div className={styles.dataIcon}>
								{exporting ? (
									<Loader2
										size={19}
										strokeWidth={1.8}
										className={styles.spinner}
									/>
								) : (
									<Download size={19} strokeWidth={1.8} />
								)}
							</div>
							<div className={styles.dataBody}>
								<span className={styles.dataTitle}>
									{t("data.export.title")}
								</span>
								<span className={styles.dataDesc}>{t("data.export.desc")}</span>
							</div>
							<ChevronRight size={15} className={styles.dataArrow} />
						</button>

						<button
							className={styles.dataCard}
							onClick={handleImportClick}
							disabled={exporting || importing}
						>
							<div className={styles.dataIcon}>
								{importing ? (
									<Loader2
										size={19}
										strokeWidth={1.8}
										className={styles.spinner}
									/>
								) : (
									<Upload size={19} strokeWidth={1.8} />
								)}
							</div>
							<div className={styles.dataBody}>
								<span className={styles.dataTitle}>
									{t("data.import.title")}
								</span>
								<span className={styles.dataDesc}>{t("data.import.desc")}</span>
							</div>
							<ChevronRight size={15} className={styles.dataArrow} />
						</button>
					</div>

					<input
						ref={fileInputRef}
						type="file"
						accept=".sqlite"
						className={styles.hiddenInput}
						onChange={handleFileChange}
					/>
				</section>
			</div>
			<ToastContainer />
		</div>
	);
}
