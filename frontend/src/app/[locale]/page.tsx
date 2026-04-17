"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
	ShoppingCart,
	Package,
	TrendingUp,
	TrendingDown,
	DollarSign,
	PlusCircle,
	MinusCircle,
	X,
	Search,
	AlertCircle,
	Sun,
	Moon,
	Monitor,
} from "lucide-react";
import styles from "./dashboard.module.css";

// ----------------------------------------------------------------------
// MOCK DATA (replace with real API calls later)
// ----------------------------------------------------------------------
const mockTodayStats = {
	salesTotal: 1245.8,
	purchasesTotal: 687.3,
	profit: 558.5,
	costs: 687.3,
	salesCount: 18,
	purchaseCount: 4,
};

const mockRecentTransactions = [
	{
		id: "INV-001",
		type: "sale",
		customer: "Ahmed Benali",
		amount: 89.9,
		date: "2026-04-16T10:23:00",
	},
	{
		id: "INV-002",
		type: "sale",
		customer: "Sarah K.",
		amount: 145.5,
		date: "2026-04-16T11:45:00",
	},
	{
		id: "PUR-001",
		type: "purchase",
		supplier: "Dairy Farms",
		amount: 320.0,
		date: "2026-04-16T09:15:00",
	},
	{
		id: "INV-003",
		type: "sale",
		customer: "Omar F.",
		amount: 56.9,
		date: "2026-04-16T13:20:00",
	},
	{
		id: "PUR-002",
		type: "purchase",
		supplier: "Fresh Fruits Co.",
		amount: 367.3,
		date: "2026-04-16T14:30:00",
	},
];

const mockLowStockItems = [
	{ variantName: "Milk 1L Whole", stock: 3, threshold: 10 },
	{ variantName: "Baguette", stock: 2, threshold: 15 },
];

const mockExpiringBatches = [
	{ variantName: "Yogurt Strawberry", expiryDate: "2026-04-20", daysLeft: 4 },
	{ variantName: "Fresh Chicken", expiryDate: "2026-04-18", daysLeft: 2 },
];

// Mock products for quick sale
const mockProducts = [
	{ id: "p1", name: "Milk 1L", price: 1.2 },
	{ id: "p2", name: "Bread", price: 0.9 },
	{ id: "p3", name: "Eggs (12)", price: 2.5 },
	{ id: "p4", name: "Butter 250g", price: 1.8 },
];

// ----------------------------------------------------------------------
// FETCH FUNCTIONS (commented – implement later)
// ----------------------------------------------------------------------
/*
async function fetchTodayStats() {
  // GET /api/stats/today
  // returns { salesTotal, purchasesTotal, profit, costs, salesCount, purchaseCount }
}

async function fetchRecentTransactions(limit = 10) {
  // GET /api/transactions/recent?limit=10
}

async function fetchLowStockAlerts() {
  // GET /api/alerts/low-stock
}

async function fetchExpiringBatches() {
  // GET /api/alerts/expiring
}

async function createSale(cartItems: CartItem[], customerName?: string) {
  // POST /api/sales
  // body: { items: [{ variantId, quantity, unitPrice }], customerName, paymentMethod }
}

async function createPurchase(supplierId: string, items: PurchaseItem[]) {
  // POST /api/purchases
}
*/

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
}

// ----------------------------------------------------------------------
// DASHBOARD COMPONENT
// ----------------------------------------------------------------------
export default function Dashboard() {
	const t = useTranslations("Dashboard");

	// Theme state
	const [theme, setTheme] = useState<"light" | "dim" | "dark">("light");

	// UI state
	const [quickSaleOpen, setQuickSaleOpen] = useState(false);
	const [quickPurchaseOpen, setQuickPurchaseOpen] = useState(false);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	// Data state (mock for now)
	const [todayStats] = useState(mockTodayStats);
	const [recentTransactions] = useState(mockRecentTransactions);
	const [lowStock] = useState(mockLowStockItems);
	const [expiring] = useState(mockExpiringBatches);

	const filteredProducts = mockProducts.filter((p) =>
		p.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const addToCart = (product: (typeof mockProducts)[0]) => {
		setCart((prev) => {
			const existing = prev.find((item) => item.id === product.id);
			if (existing) {
				return prev.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}
			return [...prev, { ...product, quantity: 1 }];
		});
	};

	const updateQuantity = (id: string, delta: number) => {
		setCart((prev) =>
			prev
				.map((item) =>
					item.id === id
						? { ...item, quantity: Math.max(0, item.quantity + delta) }
						: item,
				)
				.filter((item) => item.quantity > 0),
		);
	};

	const removeFromCart = (id: string) => {
		setCart((prev) => prev.filter((item) => item.id !== id));
	};

	const cartTotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	const handleQuickSale = () => {
		// TODO: call createSale(cart)
		console.log("Sale completed", cart);
		setQuickSaleOpen(false);
		setCart([]);
		// Refresh dashboard data (mock refresh)
	};

	const handleQuickPurchase = () => {
		// TODO: call createPurchase
		console.log("Purchase completed");
		setQuickPurchaseOpen(false);
	};

	return (
		<div className={styles.dashboard}>
			{/* Theme switcher */}

			{/* Header */}
			<header className={styles.header}>
				<h1>{t("title")}</h1>
				<div className={styles.headerActions}>
					<button
						className={styles.primaryBtn}
						onClick={() => setQuickSaleOpen(true)}
					>
						<ShoppingCart size={18} /> {t("quickSale")}
					</button>
					<button
						className={styles.secondaryBtn}
						onClick={() => setQuickPurchaseOpen(true)}
					>
						<Package size={18} /> {t("quickPurchase")}
					</button>
				</div>
			</header>

			{/* Summary Cards */}
			<div className={styles.cardGrid}>
				<div className={styles.card}>
					<div
						className={styles.cardIcon}
						style={{ background: "var(--success-bg)" }}
					>
						<TrendingUp color="var(--success)" size={24} />
					</div>
					<div className={styles.cardContent}>
						<span className={styles.cardLabel}>{t("todaySales")}</span>
						<span className={styles.cardValue}>
							${todayStats.salesTotal.toFixed(2)}
						</span>
						<span className={styles.cardSub}>
							{t("salesCount")}: {todayStats.salesCount}
						</span>
					</div>
				</div>
				<div className={styles.card}>
					<div
						className={styles.cardIcon}
						style={{ background: "var(--warning-bg)" }}
					>
						<TrendingDown color="var(--warning)" size={24} />
					</div>
					<div className={styles.cardContent}>
						<span className={styles.cardLabel}>{t("todayPurchases")}</span>
						<span className={styles.cardValue}>
							${todayStats.purchasesTotal.toFixed(2)}
						</span>
						<span className={styles.cardSub}>
							{t("purchaseCount")}: {todayStats.purchaseCount}
						</span>
					</div>
				</div>
				<div className={styles.card}>
					<div
						className={styles.cardIcon}
						style={{ background: "var(--info-bg)" }}
					>
						<DollarSign color="var(--info)" size={24} />
					</div>
					<div className={styles.cardContent}>
						<span className={styles.cardLabel}>{t("profit")}</span>
						<span className={styles.cardValue}>
							${todayStats.profit.toFixed(2)}
						</span>
					</div>
				</div>
				<div className={styles.card}>
					<div
						className={styles.cardIcon}
						style={{ background: "var(--danger-bg)" }}
					>
						<DollarSign color="var(--danger)" size={24} />
					</div>
					<div className={styles.cardContent}>
						<span className={styles.cardLabel}>{t("costs")}</span>
						<span className={styles.cardValue}>
							${todayStats.costs.toFixed(2)}
						</span>
					</div>
				</div>
			</div>

			{/* Alerts Row */}
			<div className={styles.alertsRow}>
				{lowStock.length > 0 && (
					<div
						className={styles.alertCard}
						style={{ borderLeftColor: "var(--warning)" }}
					>
						<AlertCircle size={20} color="var(--warning)" />
						<div>
							<strong>{t("lowStockAlert")}</strong>
							<ul>
								{lowStock.map((item) => (
									<li key={item.variantName}>
										{item.variantName}: {item.stock} left
									</li>
								))}
							</ul>
						</div>
					</div>
				)}
				{expiring.length > 0 && (
					<div
						className={styles.alertCard}
						style={{ borderLeftColor: "var(--danger)" }}
					>
						<AlertCircle size={20} color="var(--danger)" />
						<div>
							<strong>{t("expiringAlert")}</strong>
							<ul>
								{expiring.map((item) => (
									<li key={item.variantName}>
										{item.variantName} – expires in {item.daysLeft} days
									</li>
								))}
							</ul>
						</div>
					</div>
				)}
			</div>

			{/* Recent Transactions */}
			<div className={styles.transactionsSection}>
				<h2>{t("recentTransactions")}</h2>
				<table className={styles.transactionTable}>
					<thead>
						<tr>
							<th>{t("transactionId")}</th>
							<th>{t("type")}</th>
							<th>{t("customerOrSupplier")}</th>
							<th>{t("amount")}</th>
							<th>{t("time")}</th>
						</tr>
					</thead>
					<tbody>
						{recentTransactions.map((tx) => (
							<tr key={tx.id}>
								<td>{tx.id}</td>
								<td>
									<span
										className={
											tx.type === "sale"
												? styles.saleBadge
												: styles.purchaseBadge
										}
									>
										{tx.type === "sale" ? t("sale") : t("purchase")}
									</span>
								</td>
								<td>{tx.type === "sale" ? tx.customer : tx.supplier}</td>
								<td>${tx.amount.toFixed(2)}</td>
								<td>{new Date(tx.date).toLocaleTimeString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* QUICK SALE MODAL */}
			{quickSaleOpen && (
				<div
					className={styles.modalOverlay}
					onClick={() => setQuickSaleOpen(false)}
				>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h3>{t("quickSale")}</h3>
							<button onClick={() => setQuickSaleOpen(false)}>
								<X size={20} />
							</button>
						</div>
						<div className={styles.modalBody}>
							<div className={styles.searchBar}>
								<Search size={18} />
								<input
									type="text"
									placeholder={t("searchProduct")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
							<div className={styles.productGrid}>
								{filteredProducts.map((p) => (
									<div
										key={p.id}
										className={styles.productCard}
										onClick={() => addToCart(p)}
									>
										<span>{p.name}</span>
										<span>${p.price}</span>
									</div>
								))}
							</div>
							<div className={styles.cartSection}>
								<h4>{t("cart")}</h4>
								{cart.length === 0 && <p>{t("emptyCart")}</p>}
								{cart.map((item) => (
									<div key={item.id} className={styles.cartItem}>
										<span>{item.name}</span>
										<div className={styles.cartItemControls}>
											<button onClick={() => updateQuantity(item.id, -1)}>
												<MinusCircle size={16} />
											</button>
											<span>{item.quantity}</span>
											<button onClick={() => updateQuantity(item.id, 1)}>
												<PlusCircle size={16} />
											</button>
											<button onClick={() => removeFromCart(item.id)}>
												<X size={16} />
											</button>
										</div>
										<span>${(item.price * item.quantity).toFixed(2)}</span>
									</div>
								))}
								{cart.length > 0 && (
									<div className={styles.cartTotal}>
										<strong>{t("total")}:</strong> ${cartTotal.toFixed(2)}
									</div>
								)}
							</div>
						</div>
						<div className={styles.modalFooter}>
							<button
								className={styles.secondaryBtn}
								onClick={() => setQuickSaleOpen(false)}
							>
								{t("cancel")}
							</button>
							<button
								className={styles.primaryBtn}
								onClick={handleQuickSale}
								disabled={cart.length === 0}
							>
								{t("completeSale")}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* QUICK PURCHASE MODAL (simplified) */}
			{quickPurchaseOpen && (
				<div
					className={styles.modalOverlay}
					onClick={() => setQuickPurchaseOpen(false)}
				>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h3>{t("quickPurchase")}</h3>
							<button onClick={() => setQuickPurchaseOpen(false)}>
								<X size={20} />
							</button>
						</div>
						<div className={styles.modalBody}>
							<p>{t("purchaseMockMessage")}</p>
							{/* In real app, add supplier selection, product lines, quantities */}
						</div>
						<div className={styles.modalFooter}>
							<button
								className={styles.secondaryBtn}
								onClick={() => setQuickPurchaseOpen(false)}
							>
								{t("cancel")}
							</button>
							<button
								className={styles.primaryBtn}
								onClick={handleQuickPurchase}
							>
								{t("completePurchase")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
