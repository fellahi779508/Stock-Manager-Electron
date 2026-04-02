"use client";
import { useParams } from "next/navigation";

export default function SupplierDetails() {
	const params = useParams();
	return <div>{params?.id}</div>;
}
