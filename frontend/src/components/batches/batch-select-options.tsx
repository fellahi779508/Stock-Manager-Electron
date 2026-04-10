import { useState } from "react";
import styles from "./batch-select.module.css";
export default function BatchSelectOptoins({
	batchId,
	handleOverlayClick,
}: {
	batchId: string;
	handleOverlayClick: () => void;
}) {
	return (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div className={styles.container}></div>
		</div>
	);
}
