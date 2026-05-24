"use client";
import { Cart, Sale } from "@/utils/types";
import styles from "./historyModal.module.css";
import { useCallback, useEffect, useState } from "react";
import { getTodaysSales } from "@/api/sale-api";
import { useTranslations } from "next-intl";
import {
	X,
	ReceiptText,
	Loader2,
	AlertCircle,
	CheckCircle2,
	Package,
	Tag,
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────────────────────────── */
type soldItem = {
	batchId: number;
	quantity: number;
	total: number;
	name: string;
	barcode: string;
	sellingPriceTTC: number;
};
function fmt(n: number) {
	return n.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

function fmtTime(iso: string) {
	return new Date(iso).toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	});
}

/* ── component ───────────────────────────────────────────────────────────── */

export default function HistoryModal({
	setOpenHistoryModal,
	setIsSaleLoaded,
	setIsCreditActivated,
	setIsRemiseActivated,
	setRemise,
	setClientId,
	setPaidAmount,
	setSaleId,
	setCart,
}: {
	setOpenHistoryModal: (value: boolean) => void;
	setIsSaleLoaded: (value: boolean) => void;
	setIsCreditActivated: (value: boolean) => void;
	setIsRemiseActivated: (value: boolean) => void;
	setRemiseAmount: (value: number) => void;
	setRemise: (value: number) => void;
	setClientId: (value: number) => void;
	setPaidAmount: (value: number) => void;
	setSaleId: (value: number) => void;

	setCart: (value: Cart) => void;
}) {
	const t = useTranslations("historyModal");

	const [sales, setSales] = useState<Sale[]>([]);
	const [selected, setSelected] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSales = useCallback(async () => {
		setLoading(true);
		setError(null);
		const res = await getTodaysSales();
		if (res.status === 1) {
			setSales(res.response);
		} else {
			setError(t("errorLoad"));
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchSales();
	}, []);

	function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
		if (e.target === e.currentTarget) setOpenHistoryModal(false);
	}

	function handleLoad() {
		if (selected == null) return;
		setIsSaleLoaded(true);
		const selectedSoldItems =
			selectedSale?.soldItems.map((item) => ({
				batchId: item.batch.id,
				quantity: item.quantity,
				name: item.batch?.variant?.name || "",
				total: item.quantity * item.sellingPrice,
				barcode: item.batch?.variant?.barcode || "",
				sellingPriceTTC: item.sellingPrice * item.quantity,
			})) || [];
		if (selectedSale?.remise === true) {
			setIsRemiseActivated(true);
			setRemise(selectedSale?.remiseAmount || 0);
		} else {
			setIsRemiseActivated(false);
			setRemise(0);
		}
		if (
			selectedSale?.paid &&
			selectedSale?.total &&
			selectedSale?.paid < selectedSale?.total
		) {
			setPaidAmount(selectedSale?.paid || 0);
			setIsCreditActivated(true);
			setClientId(selectedSale.client?.id || 0);
		} else {
			setIsCreditActivated(false);
			setClientId(0);
			setPaidAmount(0);
		}

		setCart({
			soldItems: selectedSoldItems,
			total: selectedSale?.remise
				? selectedSale?.total + selectedSale?.remiseAmount
				: selectedSale?.total || 0,
		});
		setSaleId(selected);
		setOpenHistoryModal(false);
		setIsSaleLoaded(true);
	}

	const selectedSale = sales.find((s) => s.id === selected);

	return (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div className={styles.container}>
				{/* ── Close ── */}
				<button
					className={styles.closeBtn}
					onClick={() => setOpenHistoryModal(false)}
					aria-label={t("close")}
				>
					<X size={14} strokeWidth={2.5} />
				</button>

				{/* ── Header ── */}
				<div className={styles.header}>
					<h2 className={styles.title}>{t("title")}</h2>
					<p className={styles.subtitle}>{t("subtitle")}</p>
				</div>

				{/* ── Body ── */}
				<div className={styles.formBody}>
					{/* Loading */}
					{loading && (
						<div className={styles.loadingState}>
							<Loader2 size={20} className={styles.spinner} />
							<span>{t("loading")}</span>
						</div>
					)}

					{/* Error */}
					{error && !loading && (
						<div className={styles.errorState}>
							<AlertCircle size={16} />
							<span>{error}</span>
						</div>
					)}

					{/* Empty */}
					{!loading && !error && sales.length === 0 && (
						<div className={styles.emptyState}>
							<ReceiptText size={28} strokeWidth={1.2} />
							<p>{t("empty")}</p>
						</div>
					)}

					{/* Sales list */}
					{!loading && !error && sales.length > 0 && (
						<div className={styles.salesList}>
							{sales.map((sale) => {
								const isSelected = selected === sale.id;
								return (
									<button
										key={sale.id}
										className={`${styles.saleCard} ${isSelected ? styles.saleCardActive : ""}`}
										onClick={() => setSelected(isSelected ? null : sale.id)}
									>
										{/* Left — receipt icon + id */}
										<div className={styles.saleIcon}>
											<ReceiptText size={16} strokeWidth={1.8} />
										</div>

										{/* Middle — items summary */}
										<div className={styles.saleBody}>
											<div className={styles.saleTopRow}>
												<span className={styles.saleId}>#{sale.id}</span>
												<div className={styles.saleItems}>
													{sale.soldItems.map((si) => (
														<span key={si.id} className={styles.itemChip}>
															<Tag size={9} strokeWidth={2} />
															{si.batch?.variant?.name}
															<span className={styles.itemQty}>
																×{si.quantity}
															</span>
														</span>
													))}
												</div>
											</div>

											<div className={styles.saleMeta}>
												<span className={styles.metaItem}>
													<Package size={10} strokeWidth={2} />
													{sale.soldItems.length} {t("items")}
												</span>
												{sale.remise && (
													<span className={styles.remiseBadge}>
														{t("remise")}
													</span>
												)}
											</div>
										</div>

										{/* Right — amounts + check */}
										<div className={styles.saleRight}>
											<span className={styles.totalAmount}>
												{fmt(sale.total)}
											</span>
											<span
												className={`${styles.paidAmount} ${sale.paid < sale.total ? styles.paidPartial : ""}`}
											>
												{t("paid")}: {fmt(sale.paid)}
											</span>
											{isSelected && (
												<CheckCircle2
													size={14}
													className={styles.checkIcon}
													strokeWidth={2.5}
												/>
											)}
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* ── Footer ── */}
				<div className={styles.footer}>
					<button
						className={styles.btnSecondary}
						onClick={() => setOpenHistoryModal(false)}
					>
						{t("cancel")}
					</button>
					<button
						className={styles.btnPrimary}
						onClick={handleLoad}
						disabled={selected == null}
					>
						{t("load")}
					</button>
				</div>
			</div>
		</div>
	);
}
