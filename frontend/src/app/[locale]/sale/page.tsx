"use client";
import {
	ChevronLeft,
	ChevronRight,
	Minus,
	Plus,
	Search,
	X,
} from "lucide-react";
import styles from "./sale.module.css";
import { useCallback, useEffect, useState } from "react";
import { Cart, Meta, Variant } from "@/utils/types";
import getAllSallableVariants from "@/api/variant-api";
import PrintModal from "@/components/sale/printModal";
import CreditModal from "@/components/sale/creditModal";
import { createSale } from "@/api/sale-api";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
export default function Sale() {
	type soldItem = {
		batchId: number;
		quantity: number;
		total: number;
		name: string;
		barcode: string;
		sellingPriceTTC: number;
	};
	type transactionOptions = {
		print: boolean;
		credit: boolean;
		test: boolean;
	};
	const [variants, stVariants] = useState<Variant[] | null>(null);
	const [openPrintModal, setOpenPrintModal] = useState(false);
	const [openCreditModal, setOpenCreditModal] = useState(false);
	const [paperType, setPaperType] = useState<"A4" | "Ticket" | null>(null);
	// states for Credit Modal
	const [paidAmount, setPaidAmount] = useState(0);
	const [isCreditActivated, setIsCreditActivated] = useState(false);
	const [clientId, setClientId] = useState<number | null>(null);

	const [selectedSoldItem, setSelectedSoldItem] = useState<soldItem | null>(
		null,
	);
	const [cart, setCart] = useState<Cart>({
		total: 0,
		soldItems: [],
	});
	const [meta, setMeta] = useState<Meta>({
		page: 1,
		pages: 1,
		limit: 10,
		total: 0,
	});
	const [page, setPage] = useState(1);
	const [transaction_options, setTransaction_options] =
		useState<transactionOptions>({
			print: false,
			credit: false,
			test: false,
		});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [numPad_option, setNumPad_option] = useState<"Quantity" | "Price">(
		"Quantity",
	);
	const [numPad_value, setNumPad_value] = useState("");
	//debounced search
	useEffect(() => {
		setTimeout(() => {
			setDebouncedSearch(search);
		}, 350);
	}, [search]);
	// callback to fetch all the sallable variants
	const fetchVariants = useCallback(async () => {
		const res = await getAllSallableVariants(page, 8, debouncedSearch);
		stVariants(res.response.data);
		setMeta(res.response.meta);
	}, [debouncedSearch, page]);
	//fetch variants
	useEffect(() => {
		fetchVariants();
	}, [page, debouncedSearch]);
	function addToCart(item: Variant) {
		const existingItem = cart.soldItems.find(
			(i) => i.batchId === item.batches[0].id,
		);
		if (existingItem) {
			// TODO: Update quantity
			setCart({
				...cart,
				soldItems: cart.soldItems.map((i) =>
					i.batchId === item.batches[0].id
						? {
								...i,
								quantity: i.quantity + 1,
								total: i.total + item.sellingPriceTTC,
							}
						: i,
				),
			});
		} else {
			// TODO: Add new item
			setCart({
				...cart,
				soldItems: [
					...cart.soldItems,
					{
						batchId: item.batches[0].id,
						quantity: 1,
						total: item.sellingPriceTTC,
						name: item.name,
						barcode: item.barcode,
						sellingPriceTTC: item.sellingPriceTTC,
					},
				],
			});
		}
	}
	function DeleteFromCart(item: soldItem) {
		const newCart = cart.soldItems.filter((i) => i.batchId !== item.batchId);
		setCart({
			...cart,
			soldItems: newCart,
		});
	}
	//calculate total on each modification
	useEffect(() => {
		const total = cart.soldItems.reduce((acc, item) => acc + item.total, 0);
		setCart({
			...cart,
			total,
		});
	}, [cart.soldItems]);
	useEffect(() => {
		setOpenPrintModal(transaction_options.print);
	}, [transaction_options.print]);
	function modifyQte(item: soldItem, type: string) {
		if (type === "add") {
			// TODO: Add quantity
			const stockQte =
				variants?.find((v) => v.batches[0].id === item.batchId)?.batches[0]
					.stock.quantity || 0;
			const newQte = item.quantity + 1;
			setCart({
				...cart,
				soldItems: cart.soldItems.map((i) =>
					i.batchId === item.batchId
						? {
								...i,
								quantity: stockQte < newQte ? stockQte : newQte,
								total:
									stockQte < newQte
										? stockQte * item.sellingPriceTTC
										: newQte * item.sellingPriceTTC,
							}
						: i,
				),
			});
		} else if (type === "remove") {
			const newQte = item.quantity - 1;

			setCart({
				...cart,
				soldItems: cart.soldItems.map((i) =>
					i.batchId === item.batchId
						? {
								...i,
								quantity: newQte === 0 ? 1 : newQte,
								total:
									newQte === 0
										? 1 * i.sellingPriceTTC
										: newQte * i.sellingPriceTTC,
							}
						: i,
				),
			});
		}
	}
	function applyNumPadModifications() {
		const verify = variants?.find(
			(v) => v.batches[0].id === selectedSoldItem?.batchId,
		);

		if (!verify) {
			return;
		}
		let fixedValue = numPad_value;
		if (Number(numPad_value) > verify?.batches[0].stock.quantity) {
			console.log("reached");
			fixedValue = verify?.batches[0].stock.quantity.toString();
		}
		if (Number(numPad_value) === 0 && numPad_option === "Quantity") {
			fixedValue = "1";
		}
		if (numPad_option === "Quantity") {
			const newSoldItems = cart.soldItems.map((i) =>
				i.batchId === selectedSoldItem?.batchId
					? {
							...i,
							quantity: Number(fixedValue) === 0 ? 1 : Number(fixedValue),
							total:
								Number(fixedValue) === 0
									? 1 * i.sellingPriceTTC
									: Number(fixedValue) * i.sellingPriceTTC,
						}
					: i,
			);
			const newTotal = newSoldItems.reduce((acc, item) => acc + item.total, 0);
			setCart({
				...cart,
				soldItems: newSoldItems,
				total: newTotal,
			});
		} else {
			// TODO: Modify price
			const newSoldItems = cart.soldItems.map((i) =>
				i.batchId === selectedSoldItem?.batchId
					? {
							...i,
							sellingPriceTTC: Number(numPad_value),
							total: i.quantity * Number(numPad_value),
						}
					: i,
			);
			const newTotal = newSoldItems.reduce((acc, item) => acc + item.total, 0);
			setCart({
				...cart,
				soldItems: newSoldItems,
				total: newTotal,
			});
		}
	}
	async function makeSale() {
		if (cart.soldItems.length === 0) {
			return;
		}
		if (isCreditActivated && !clientId) {
			alert("Client is required when credit is activated");
			return;
		}

		// TODO: Make sale
		const res = await createSale({
			total: cart.total,
			clientId: isCreditActivated ? (clientId ?? undefined) : undefined,
			paid: isCreditActivated ? paidAmount : cart.total,
			soldItems: cart.soldItems.map((item) => ({
				batchId: item.batchId,
				quantity: item.quantity,
			})),
			date: new Date().toISOString(),
		});
		console.log(res);
		if (res.status === 1) {
			toast.success("sucess");
			alert("Sale created successfully");
			fetchVariants();
			setClientId(null);
			setIsCreditActivated(false);
			setCart({
				soldItems: [],
				total: 0,
			});
		} else {
			console.log("reached");

			toast.error("error");
			alert("Failed to create sale");
		}
	}
	return (
		<div className={styles.container}>
			<section className={styles.sect1}>
				<div className={styles.title}>
					<h2>Sale</h2>
				</div>
				<div className={styles.searchBar}>
					<Search />
					<input
						type="text"
						placeholder="search by name , barcode..."
						className={styles.searchField}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className={styles.tableWrapper}>
					<table className={styles.table}>
						<thead className={styles.tableHead}>
							<tr>
								<th className={styles.tableCell}>Product Name</th>
								<th className={styles.tableCell}>nLot</th>
								<th className={styles.tableCell}>Barcode</th>
								<th className={styles.tableCell}>Stock quantity</th>
								<th className={styles.tableCell}>Purchase price</th>
								<th className={styles.tableCell}>TVA</th>
								<th className={styles.tableCell}>Discount Price</th>
								<th className={styles.tableCell}>Selling price</th>
							</tr>
						</thead>

						<tbody className={styles.tableBody}>
							{variants?.map((item) => (
								<tr
									className={styles.tableRow}
									key={item.id}
									onDoubleClick={() => addToCart(item)}
								>
									<td className={styles.tableCell}>{item.name}</td>

									<td className={styles.tableCell}>
										{item.batches?.[0]?.nLot ?? "-"}
									</td>
									<td className={styles.tableCell}>{item.barcode}</td>

									<td className={styles.tableCell}>
										{item.batches?.[0]?.stock?.quantity}
									</td>

									<td className={styles.tableCell}>{item.purchasePrice} DZD</td>

									<td className={styles.tableCell}>{item.vatRate} %</td>

									<td className={styles.tableCell}>
										{item.promotionPrice ? `${item.promotionPrice} DZD` : "-"}
									</td>

									<td className={styles.tableCell}>
										{item.sellingPriceTTC} DZD
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{meta.pages > 1 && (
						<div className={styles.pagination}>
							<button
								className={styles.pageBtn}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
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
												className={`${styles.pageNumber} ${
													page === p ? styles.pageActive : ""
												}`}
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
								Page {page} of {meta.pages}
							</span>
						</div>
					)}
				</div>

				<div className={styles.title}>
					<h2>Cart</h2>
				</div>
				<div
					className={styles.cartWrapper}
					onClick={() => setSelectedSoldItem(null)}
				>
					<table className={styles.table}>
						<thead className={styles.tableHead}>
							<tr>
								<th className={styles.tableCell}>Product Name</th>
								<th className={styles.tableCell}>Barcode</th>
								<th className={styles.tableCell}>quantity</th>
								<th className={styles.tableCell}>Selling Price</th>
								<th className={styles.tableCell}>Total</th>
								<th className={styles.tableCell}>Remove</th>
							</tr>
						</thead>

						<tbody
							className={
								cart.soldItems.length === 0
									? styles.emptyCartBody
									: styles.cartBody
							}
						>
							{cart.soldItems.length === 0 ? (
								<tr className={styles.emptyCart}>
									<td>No items in cart</td>
								</tr>
							) : (
								cart.soldItems.map((item) => (
									<tr
										className={`${styles.tableRow} ${selectedSoldItem?.batchId === item.batchId ? styles.selectedRow : styles.tableRow}`}
										key={item.batchId}
										onDoubleClick={() => setSelectedSoldItem(item)}
									>
										<td className={styles.tableCell}>{item.name}</td>

										<td className={styles.tableCell}>{item.barcode}</td>

										<td className={styles.tableCell}>
											<div className={styles.quantityControl}>
												<Minus
													size={16}
													className={styles.quantityControlIcon}
													onClick={() => modifyQte(item, "remove")}
												/>
												{item.quantity}
												<Plus
													size={16}
													className={styles.quantityControlIcon}
													onClick={() => modifyQte(item, "add")}
												/>
											</div>
										</td>
										<td className={styles.tableCell}>{item.sellingPriceTTC}</td>

										<td className={styles.tableCell}>{item.total} DZD</td>
										<td className={styles.tableCell}>
											<X
												className={styles.deleteIcon}
												onClick={() => DeleteFromCart(item)}
											/>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				<div className={styles.totalSec}>
					<h2>Total Amount : </h2>
					<h2 className={styles.total}>{cart.total} DZD</h2>
				</div>
				{isCreditActivated && (
					<div className={styles.totalSec}>
						<h2>Total Paid : </h2>
						<h2 className={styles.total}>{paidAmount} DZD</h2>
					</div>
				)}
			</section>
			<section className={styles.sec2}>
				<div className={styles.numPad}>
					<div className={styles.numPadHeader}>
						<h2>NumPad</h2>
						<div className={styles.numpadOptions}>
							<div
								className={`${styles.numpadOption} ${numPad_option === "Quantity" ? styles.active : ""}`}
								onClick={() => (
									setNumPad_option("Quantity"),
									setNumPad_value("")
								)}
							>
								Qte
							</div>
							<div
								className={`${styles.numpadOption} ${numPad_option === "Price" ? styles.active : ""}`}
								onClick={() => (setNumPad_option("Price"), setNumPad_value(""))}
							>
								Price
							</div>
						</div>
					</div>
					<div className={styles.result_field}>
						<div className={styles.resultFieldValue}>
							<h3>{numPad_option}</h3>
							<h2>{numPad_value || "0"}</h2>
						</div>
					</div>
					<div className={styles.numpadButtons}>
						<div className={styles.numpadGrid}>
							{Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
								<div
									key={i}
									className={styles.numpadButton}
									onClick={() =>
										selectedSoldItem
											? setNumPad_value((numPad_value + i).toString())
											: null
									}
								>
									{i}
								</div>
							))}
							<div
								className={styles.numpadButton}
								onClick={() => setNumPad_value("")}
							>
								C
							</div>
							<div
								className={styles.numpadButton}
								onClick={() =>
									selectedSoldItem
										? setNumPad_value((numPad_value + 0).toString())
										: null
								}
							>
								0
							</div>
							<div
								className={styles.numpadButton}
								onClick={() =>
									selectedSoldItem && numPad_option != "Quantity"
										? numPad_value.includes(".")
											? numPad_value
											: setNumPad_value(numPad_value + ".")
										: null
								}
							>
								.
							</div>
							<div
								className={styles.numpadButton}
								onClick={() => (
									selectedSoldItem ? applyNumPadModifications() : null,
									setNumPad_value("")
								)}
							>
								Apply
							</div>
						</div>
					</div>
				</div>
				<div className={styles.title}>
					<h2>Options</h2>
				</div>
				<div className={styles.transaction_options}>
					{Object.entries(transaction_options).map(([key, value]) => (
						<div
							className={styles.transaction_option}
							key={key}
							onClick={() =>
								key === "print"
									? setOpenPrintModal(true)
									: key === "credit"
										? setOpenCreditModal(true)
										: null
							}
						>
							<h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
						</div>
					))}
				</div>
				<div className={styles.actions}>
					<Link
						href="/"
						className={styles.cancelBtn}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						Cancel
					</Link>
					<button
						className={styles.proceedBtn}
						onClick={makeSale}
						disabled={cart.soldItems.length === 0 ? true : false}
					>
						Proceed
					</button>
				</div>
			</section>
			{openPrintModal && (
				<PrintModal
					setOpenPrintModal={setOpenPrintModal}
					paperType={paperType}
					setPaperType={setPaperType}
				/>
			)}
			{openCreditModal && (
				<CreditModal
					paidAmount={paidAmount}
					setClientId={setClientId}
					setPaidAmount={setPaidAmount}
					setOpenCreditModal={setOpenCreditModal}
					isCreditActivated={isCreditActivated}
					setIsCreditActivated={setIsCreditActivated}
				/>
			)}
			<ToastContainer />
		</div>
	);
}
