"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
	Package,
	Warehouse,
	Users,
	Truck,
	CircleDollarSign,
	Clock,
	ScrollText,
	Activity,
	Menu,
	X,
	List,
	Settings,
} from "lucide-react";
import styles from "./side-bar.module.css";

const NAV_ITEMS = [
	{ key: "dashboard", href: "/", icon: Activity },
	{ key: "categories", href: "/categories", icon: List },
	{ key: "products", href: "/products", icon: Package },
	{ key: "stock", href: "/stock", icon: Warehouse },
	{ key: "clients", href: "/clients", icon: Users },
	{ key: "suppliers", href: "/suppliers", icon: Truck },
	{ key: "sales", href: "/sales", icon: CircleDollarSign },
];

const LOG_ITEMS = [
	{ key: "history", href: "/history", icon: Clock },
	{ key: "logs", href: "/logs", icon: ScrollText },
];

export default function SideBar() {
	const t = useTranslations("sidebar");
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	// Strip locale prefix: /en/products → /products
	const cleanPath = "/" + pathname.split("/").slice(2).join("/") || "/";

	const isActive = (href: string) =>
		cleanPath === href || cleanPath.startsWith(href + "/");

	const handleNavClick = () => setMobileOpen(false);

	const sidebarContent = (
		<>
			{/* Header */}
			<div className={styles.header}>
				<div className={styles.logo}>
					<div className={styles.logoMark}>
						<Activity size={16} color="var(--accent-foreground)" />
					</div>
					<div>
						<div className={styles.logoText}>{t("appName")}</div>
						<div className={styles.logoSub}>{t("appTagline")}</div>
					</div>
				</div>
			</div>

			{/* Main nav */}
			<div className={styles.sectionLabel}>{t("sectionMain")}</div>
			<nav className={styles.nav}>
				{NAV_ITEMS.map(({ key, href, icon: NavIcon }) => (
					<Link
						key={key}
						href={href}
						onClick={handleNavClick}
						className={`${styles.navItem} ${isActive(href) ? styles.active : ""}`}
					>
						<NavIcon className={styles.navIcon} size={18} />
						<span className={styles.navLabel}>{t(key)}</span>
					</Link>
				))}

				<div className={styles.divider} />

				<div className={styles.sectionLabel} style={{ padding: "4px 0 8px" }}>
					{t("sectionLogs")}
				</div>

				{LOG_ITEMS.map(({ key, href, icon: NavIcon }) => (
					<Link
						key={key}
						href={href}
						onClick={handleNavClick}
						className={`${styles.navItem} ${isActive(href) ? styles.active : ""}`}
					>
						<NavIcon className={styles.navIcon} size={18} />
						<span className={styles.navLabel}>{t(key)}</span>
					</Link>
				))}
			</nav>

			{/* Footer */}
			<div className={styles.footer}>
				<div className={styles.footerUser}>
					<div className={styles.avatar}>
						<Settings size={20} />
					</div>
					<Link href="/settings" className={styles.userInfo}>
						<div className={styles.userName}>{t("settings")}</div>
						<div className={styles.userRole}>{t("settingsDescription")}</div>
					</Link>
				</div>
			</div>
		</>
	);

	return (
		<>
			{/* Mobile toggle button */}
			<button
				className={styles.mobileToggle}
				onClick={() => setMobileOpen((v) => !v)}
				aria-label="Toggle sidebar"
			>
				{mobileOpen ? <X size={20} /> : <Menu size={20} />}
			</button>

			{/* Overlay */}
			{mobileOpen && (
				<div className={styles.overlay} onClick={() => setMobileOpen(false)} />
			)}

			{/* Sidebar */}
			<aside
				className={`${styles.container} ${mobileOpen ? styles.mobileOpen : ""}`}
			>
				{sidebarContent}
			</aside>
		</>
	);
}
