"use client";
import { Batch, Meta, Stock } from "@/utils/types";
import {
	Search,
	RefreshCcw,
	AlertCircle,
	Loader2,
	Layers,
	ChevronLeft,
	ChevronRight,
	Bell,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import styles from "./stock.module.css";
import { getAllStocks } from "@/api/stock-api";

/* helpers */

function formatDate(iso?: string) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function isExpiringSoon(iso?: string, alertDays?: number) {
	if (!iso || !alertDays) return false;
	const diff = (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
	return diff <= alertDays && diff >= 0;
}

function isExpired(iso?: string) {
	if (!iso) return false;
	return new Date(iso).getTime() < Date.now();
}

export default function StockPage() {
	const t = useTranslations("stock");

	const [stocks, setStocks] = useState<Stock[]>([]);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState<Meta>({
		total: 0,
		page: 1,
		limit: 12,
		pages: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [successToast, setSuccessToast] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, 350);
		return () => clearTimeout(timer);
	}, [search]);

	const fetchStocks = useCallback(async () => {
		setSuccessToast(false);
		setLoading(true);
		setError(null);
		const response = await getAllStocks(page, debouncedSearch);
		if (response.status === 1) {
			setStocks(response.response.data);
			setMeta(response.response.meta);
		} else {
			setError(response.response?.message || t("errorLoad"));
		}
		setLoading(false);
	}, [page, debouncedSearch, refreshKey, t]);

	useEffect(() => {
		fetchStocks();
	}, [fetchStocks, successToast]);

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<div className={styles.headerLeft}>
					<h1 className={styles.title}>{t("title")}</h1>
					<span className={styles.totalBadge}>
						{t("total", { count: meta.total })}
					</span>
				</div>
			</div>

			<div className={styles.searchRow}>
				<div className={styles.searchBox}>
					<Search size={15} className={styles.searchIcon} />
					<input
						type="text"
						className={styles.searchInput}
						placeholder={t("searchPlaceholder")}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					{search && (
						<button className={styles.clearBtn} onClick={() => setSearch("")}>
							×
						</button>
					)}
					<div
						className={styles.refreshBtn}
						onClick={() => {
							setSearch("");
							setRefreshKey((k) => k + 1);
						}}
					>
						<span>{t("refresh")}</span>
						<RefreshCcw size={16} />
					</div>
				</div>
			</div>

			{error && (
				<div className={styles.errorState}>
					<AlertCircle size={18} />
					<span>{error}</span>
				</div>
			)}

			{loading && (
				<div className={styles.loadingState}>
					<Loader2 size={22} className={styles.spinner} />
					<span>{t("loading")}</span>
				</div>
			)}

			{!loading && !error && stocks.length === 0 && (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>
						<Layers size={32} strokeWidth={1.2} />
					</div>
					<p className={styles.emptyTitle}>{t("emptyTitle")}</p>
					<p className={styles.emptySubtitle}>
						{debouncedSearch
							? t("emptySearchSubtitle", { query: debouncedSearch })
							: t("emptySubtitle")}
					</p>
				</div>
			)}

			{!loading && !error && stocks.length > 0 && (
				<>
					<div className={styles.tableWrapper}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th className={styles.th}>{t("col.variant")}</th>
									<th className={styles.th}>{t("col.barcode")}</th>
									<th className={styles.th}>{t("col.lot")}</th>
									<th className={styles.th}>{t("col.quantity")}</th>
									<th className={styles.th}>{t("col.purchasePrice")}</th>
									<th className={styles.th}>{t("col.sellingPriceTTC")}</th>
									<th className={styles.th}>{t("col.vatRate")}</th>
									<th className={styles.th}>{t("col.profit")}</th>
									<th className={styles.th}>{t("col.profitRate")}</th>
									<th className={styles.th}>{t("col.promotion")}</th>
									<th className={styles.th}>{t("col.supplier")}</th>
									<th className={styles.th}>{t("col.fabricationDate")}</th>
									<th className={styles.th}>{t("col.expirationDate")}</th>
									<th className={styles.th}>{t("col.alert")}</th>
								</tr>
							</thead>
							<tbody>
								{stocks.map((stock) => {
									const batch = stock.batch;
									const variant = (batch as Batch)?.variant;

									const expired = isExpired(batch?.expirationDate);
									const expiring = isExpiringSoon(
										batch?.expirationDate,
										batch?.alertPeriodPerDay,
									);

									return (
										<tr
											key={stock.id}
											className={`${styles.row} ${
												expired
													? styles.rowExpired
													: expiring
														? styles.rowExpiring
														: ""
											}`}
										>
											<td className={styles.td}>
												<div className={styles.variantCell}>
													<div className={styles.variantIcon}>
														<Layers size={14} strokeWidth={1.8} />
													</div>
													<span className={styles.variantName}>
														{variant?.name ?? "—"}
													</span>
												</div>
											</td>

											<td className={styles.td}>{variant?.barcode ?? "—"}</td>

											<td className={styles.td}>{batch?.nLot ?? "—"}</td>

											<td className={styles.td}>
												<span
													className={`${styles.qtyBadge} ${
														stock.quantity === 0
															? styles.qtyEmpty
															: stock.quantity < 5
																? styles.qtyLow
																: styles.qtyOk
													}`}
												>
													{stock.quantity}
												</span>
											</td>

											<td className={styles.td}>
												{variant?.purchasePrice?.toFixed(2) ?? "—"}
											</td>

											<td className={styles.td}>
												{variant?.sellingPriceTTC?.toFixed(2) ?? "—"}
											</td>

											<td className={styles.td}>
												{variant?.vatRate != null ? `${variant.vatRate}%` : "—"}
											</td>

											<td className={styles.td}>
												{variant?.profit?.toFixed(2) ?? "—"}
											</td>

											<td className={styles.td}>
												{variant?.profitRate != null
													? `${variant.profitRate}%`
													: "—"}
											</td>

											<td className={styles.td}>
												{variant?.promotionPrice
													? `${variant.promotionPrice.toFixed(2)} (${variant.promotionRate ?? 0}%)`
													: "—"}
											</td>

											<td className={styles.td}>
												{batch?.supplier?.name ?? "—"}
											</td>

											<td className={styles.td}>
												{formatDate(batch?.fabricationDate)}
											</td>

											<td className={styles.td}>
												<span
													className={`${styles.date} ${
														expired
															? styles.dateExpired
															: expiring
																? styles.dateExpiring
																: ""
													}`}
												>
													{formatDate(batch?.expirationDate)}
												</span>
											</td>

											<td className={styles.td}>
												{batch?.alertPeriodPerDay ? (
													<span className={styles.alertBadge}>
														<Bell size={11} />
														{batch.alertPeriodPerDay}d
													</span>
												) : (
													"—"
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{meta.pages > 1 && (
						<div className={styles.pagination}>
							<button
								className={styles.pageBtn}
								onClick={() => {
									setPage((p) => Math.max(1, p - 1));
									setSuccessToast(true);
								}}
								disabled={page === 1}
							>
								<ChevronLeft size={16} />
							</button>

							<div className={styles.pageNumbers}>
								{Array.from({ length: meta.pages }, (_, i) => i + 1)
									.filter(
										(p) =>
											p === 1 || p === meta.pages || Math.abs(p - page) <= 1,
									)
									.reduce<(number | "...")[]>((acc, p, idx, arr) => {
										if (idx > 0 && p - (arr[idx - 1] as number) > 1)
											acc.push("...");
										acc.push(p);
										return acc;
									}, [])
									.map((p, i) =>
										p === "..." ? (
											<span key={`ellipsis-${i}`} className={styles.ellipsis}>
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
								onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
								disabled={page === meta.pages}
							>
								<ChevronRight size={16} />
							</button>

							<span className={styles.pageInfo}>
								{t("pageInfo", { page, pages: meta.pages })}
							</span>
						</div>
					)}
				</>
			)}

			<ToastContainer />
		</div>
	);
}
