"use client";
import Breadcrumb from "@/components/products/breadcrumb";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getAllBatchesOfVariant } from "@/api/variant-api";
import { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import styles from "./variant-details.module.css";
import {
	Search,
	RefreshCcw,
	Plus,
	Loader2,
	AlertCircle,
	Layers,
	Tag,
	Barcode,
	DollarSign,
	Percent,
	Package,
	Calendar,
	Bell,
	CheckCircle2,
	AlertTriangle,
	XCircle,
	ChevronLeft,
	ChevronRight,
	TrendingUp,
} from "lucide-react";

/* ── types ───────────────────────────────────────────────────────────────── */

type Stock = {
	id: number;
	quantity: number;
	createdAt: string;
	updatedAt: string;
};

type Batch = {
	id: number;
	nLot: string;
	status: "ok" | "expiring" | "expired";
	stockQTYStatus: "ok" | "low" | "empty";
	fabricationDate: string;
	expirationDate: string;
	alertPeriodPerDay: number;
	alertPeriodPerStock: number;
	stock: Stock;
	createdAt: string;
	updatedAt: string;
};

type Variant = {
	id: number;
	name: string;
	barcode: string;
	purchasePrice: number;
	sellingPriceHT: number;
	sellingPriceTTC: number;
	vatRate: number;
	profit: number;
	profitRate: number;
	promotionPrice: number;
	promotionRate: number;
	PPA: string;
	size: string | null;
	color: string | null;
	weight: number | null;
	height: number | null;
	flavor: string | null;
	createdAt: string;
	updatedAt: string;
};

/* ── helpers ─────────────────────────────────────────────────────────────── */

function formatDate(iso?: string) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function formatPrice(n?: number) {
	if (n == null) return "—";
	return n.toFixed(2);
}

/* ── component ───────────────────────────────────────────────────────────── */

export default function VariantDetails() {
	const param = useParams();
	const t = useTranslations("variantDetails");

	const [variant, setVariant] = useState<Variant | null>(null);
	const [batches, setBatches] = useState<Batch[]>([]);
	const [filtered, setFiltered] = useState<Batch[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const PER_PAGE = 8;

	/* ── fetch ── */
	const getBatches = useCallback(async () => {
		setLoading(true);
		setError(null);
		const response = await getAllBatchesOfVariant(
			Number(param?.variant_id) || 0,
		);
		if (response.status === 1) {
			setVariant(response.response.variant);
			setBatches(response.response.batches);
			setFiltered(response.response.batches);
		} else {
			setError(response.response ?? t("errorLoad"));
			toast.error(response.response ?? t("errorLoad"));
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		getBatches();
	}, []);

	/* ── search filter (client-side since batches are already loaded) ── */
	useEffect(() => {
		const q = search.toLowerCase();
		setFiltered(
			q
				? batches.filter(
						(b) =>
							b.nLot.toLowerCase().includes(q) ||
							b.status.toLowerCase().includes(q),
					)
				: batches,
		);
		setPage(1);
	}, [search, batches]);

	/* ── pagination ── */
	const totalPages = Math.ceil(filtered.length / PER_PAGE);
	const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	/* ── status helpers ── */
	function statusIcon(status: Batch["status"]) {
		if (status === "expired") return <XCircle size={13} strokeWidth={2.5} />;
		if (status === "expiring")
			return <AlertTriangle size={13} strokeWidth={2.5} />;
		return <CheckCircle2 size={13} strokeWidth={2.5} />;
	}

	function qtyIcon(s: Batch["stockQTYStatus"]) {
		if (s === "empty") return <XCircle size={13} strokeWidth={2.5} />;
		if (s === "low") return <AlertTriangle size={13} strokeWidth={2.5} />;
		return <CheckCircle2 size={13} strokeWidth={2.5} />;
	}

	return (
		<div className={styles.page}>
			<Breadcrumb
				items={[
					{ label: t("breadcrumb.products"), link: "/products" },
					{
						label: t("breadcrumb.product"),
						link: `/products/${param.product_id?.toString()}`,
					},
					{ label: variant?.name ?? param.variant_id?.toString() ?? "" },
				]}
			/>

			{/* ── Loading ── */}
			{loading && (
				<div className={styles.loadingState}>
					<Loader2 size={22} className={styles.spinner} />
					<span>{t("loading")}</span>
				</div>
			)}

			{/* ── Error ── */}
			{error && !loading && (
				<div className={styles.errorState}>
					<AlertCircle size={18} />
					<span>{error}</span>
				</div>
			)}

			{!loading && !error && variant && (
				<>
					{/* ══ Hero ══════════════════════════════════════════════════════ */}
					<div className={styles.hero}>
						<div className={styles.heroTop}>
							<div className={styles.heroIcon}>
								<Layers size={24} strokeWidth={1.5} />
							</div>
							<div className={styles.heroMeta}>
								<p className={styles.eyebrow}>{t("hero.eyebrow")}</p>
								<h1 className={styles.heroName}>{variant.name}</h1>
								<div className={styles.heroBadges}>
									<span className={styles.badge}>
										<Tag size={11} strokeWidth={2} />
										{variant.barcode}
									</span>
									{variant.size && (
										<span className={styles.badge}>
											{t("hero.size")} {variant.size}
										</span>
									)}
									{variant.color && (
										<span className={styles.badge}>
											{t("hero.color")} {variant.color}
										</span>
									)}
									{variant.flavor && (
										<span className={styles.badge}>
											{t("hero.flavor")} {variant.flavor}
										</span>
									)}
									{variant.weight && (
										<span className={styles.badge}>{variant.weight}g</span>
									)}
									{variant.height && (
										<span className={styles.badge}>{variant.height}cm</span>
									)}
								</div>
							</div>
							<div className={styles.heroId}>#{variant.id}</div>
						</div>

						{/* Pricing grid */}
						<div className={styles.pricingGrid}>
							<div className={styles.priceCard}>
								<span className={styles.priceLabel}>
									{t("hero.purchasePrice")}
								</span>
								<span className={styles.priceValue}>
									{formatPrice(variant.purchasePrice)}
								</span>
							</div>
							<div className={styles.priceCard}>
								<span className={styles.priceLabel}>{t("hero.sellingHT")}</span>
								<span className={styles.priceValue}>
									{formatPrice(variant.sellingPriceHT)}
								</span>
							</div>
							<div className={styles.priceCard}>
								<span className={styles.priceLabel}>
									{t("hero.sellingTTC")}
								</span>
								<span className={`${styles.priceValue} ${styles.priceAccent}`}>
									{formatPrice(variant.sellingPriceTTC)}
								</span>
							</div>
							<div className={styles.priceCard}>
								<span className={styles.priceLabel}>{t("hero.vat")}</span>
								<span className={styles.priceValue}>{variant.vatRate}%</span>
							</div>
							<div className={styles.priceCard}>
								<span className={styles.priceLabel}>{t("hero.profit")}</span>
								<span className={`${styles.priceValue} ${styles.priceGreen}`}>
									{formatPrice(variant.profit)}
								</span>
							</div>
							<div className={styles.priceCard}>
								<span className={styles.priceLabel}>
									{t("hero.profitRate")}
								</span>
								<span className={`${styles.priceValue} ${styles.priceGreen}`}>
									{variant.profitRate}%
								</span>
							</div>
							<div className={styles.priceCard}>
								<span className={styles.priceLabel}>{t("hero.promotion")}</span>
								<span className={styles.priceValue}>
									{formatPrice(variant.promotionPrice)}
								</span>
							</div>
							<div className={styles.priceCard}>
								<span className={styles.priceLabel}>
									{t("hero.promotionRate")}
								</span>
								<span className={styles.priceValue}>
									{variant.promotionRate}%
								</span>
							</div>
						</div>
					</div>

					{/* ══ Batches ═══════════════════════════════════════════════════ */}
					<div className={styles.section}>
						{/* Section header */}
						<div className={styles.sectionHeader}>
							<div className={styles.sectionLeft}>
								<Package size={15} strokeWidth={2} />
								<h2 className={styles.sectionTitle}>{t("batches.title")}</h2>
								<span className={styles.countBadge}>{batches.length}</span>
							</div>
							<button
								className={styles.addBtn}
								onClick={() => {
									/* TODO: open add batch modal */
								}}
							>
								<Plus size={15} strokeWidth={2.5} />
								{t("batches.add")}
							</button>
						</div>

						{/* Search */}
						<div className={styles.searchRow}>
							<div className={styles.searchBox}>
								<Search size={14} className={styles.searchIcon} />
								<input
									type="text"
									className={styles.searchInput}
									placeholder={t("batches.searchPlaceholder")}
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
								{search && (
									<button
										className={styles.clearBtn}
										onClick={() => setSearch("")}
									>
										×
									</button>
								)}
								<div
									className={styles.refreshBtn}
									onClick={() => {
										setSearch("");
										getBatches();
									}}
								>
									<RefreshCcw size={14} />
								</div>
							</div>
						</div>

						{/* Empty */}
						{filtered.length === 0 && (
							<div className={styles.emptyState}>
								<Package size={28} strokeWidth={1.2} />
								<p>{search ? t("batches.emptySearch") : t("batches.empty")}</p>
							</div>
						)}

						{/* Table */}
						{filtered.length > 0 && (
							<div className={styles.tableWrapper}>
								<table className={styles.table}>
									<thead>
										<tr>
											<th className={styles.th}>{t("col.nLot")}</th>
											<th className={styles.th}>{t("col.status")}</th>
											<th className={styles.th}>{t("col.quantity")}</th>
											<th className={styles.th}>{t("col.qtyStatus")}</th>
											<th className={styles.th}>{t("col.fabricationDate")}</th>
											<th className={styles.th}>{t("col.expirationDate")}</th>
											<th className={styles.th}>{t("col.alertDay")}</th>
											<th className={styles.th}>{t("col.alertStock")}</th>
										</tr>
									</thead>
									<tbody>
										{paginated.map((batch) => (
											<tr
												key={batch.id}
												className={`${styles.row}
                          ${batch.status === "expired" ? styles.rowExpired : ""}
                          ${batch.status === "expiring" ? styles.rowExpiring : ""}`}
											>
												<td className={styles.td}>
													<span className={styles.nLot}>{batch.nLot}</span>
												</td>
												<td className={styles.td}>
													<span
														className={`${styles.statusBadge} ${styles[`status_${batch.status}`]}`}
													>
														{statusIcon(batch.status)}
														{t(`status.${batch.status}`)}
													</span>
												</td>
												<td className={styles.td}>
													<span className={styles.qty}>
														{batch.stock?.quantity ?? "—"}
													</span>
												</td>
												<td className={styles.td}>
													<span
														className={`${styles.qtyBadge} ${styles[`qty_${batch.stockQTYStatus}`]}`}
													>
														{qtyIcon(batch.stockQTYStatus)}
														{t(`qtyStatus.${batch.stockQTYStatus}`)}
													</span>
												</td>
												<td className={styles.td}>
													<span className={styles.date}>
														{formatDate(batch.fabricationDate)}
													</span>
												</td>
												<td className={styles.td}>
													<span
														className={`${styles.date}
                            ${batch.status === "expired" ? styles.dateExpired : ""}
                            ${batch.status === "expiring" ? styles.dateExpiring : ""}`}
													>
														{formatDate(batch.expirationDate)}
													</span>
												</td>
												<td className={styles.td}>
													<span className={styles.alertBadge}>
														<Bell size={11} strokeWidth={2} />
														{batch.alertPeriodPerDay}d
													</span>
												</td>
												<td className={styles.td}>
													<span className={styles.alertBadge}>
														<Package size={11} strokeWidth={2} />
														{batch.alertPeriodPerStock}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}

						{/* Pagination */}
						{totalPages > 1 && (
							<div className={styles.pagination}>
								<button
									className={styles.pageBtn}
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									<ChevronLeft size={15} />
								</button>
								<div className={styles.pageNumbers}>
									{Array.from({ length: totalPages }, (_, i) => i + 1)
										.filter(
											(p) =>
												p === 1 || p === totalPages || Math.abs(p - page) <= 1,
										)
										.reduce<(number | "...")[]>((acc, p, idx, arr) => {
											if (idx > 0 && p - (arr[idx - 1] as number) > 1)
												acc.push("...");
											acc.push(p);
											return acc;
										}, [])
										.map((p, i) =>
											p === "..." ? (
												<span key={`e-${i}`} className={styles.ellipsis}>
													…
												</span>
											) : (
												<button
													key={p}
													className={`${styles.pageNumber} ${page === p ? styles.pageActive : ""}`}
													onClick={() => setPage(p as number)}
												>
													{p}
												</button>
											),
										)}
								</div>
								<button
									className={styles.pageBtn}
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
								>
									<ChevronRight size={15} />
								</button>
								<span className={styles.pageInfo}>
									{t("pageInfo", { page, pages: totalPages })}
								</span>
							</div>
						)}
					</div>
				</>
			)}

			<ToastContainer />
		</div>
	);
}
