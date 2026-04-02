"use client";
import Breadcrumb from "@/components/products/breadcrumb";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getVaraiantById } from "@/api/variant-api";
import { useCallback, useEffect } from "react";

export default function VariantDetails() {
	const param = useParams();
	const t = useTranslations("productDetails");
	const fetchVariant = useCallback(async () => {
		const response = await getVaraiantById(Number(param?.variant_id) || 0);
		console.log(response.response);
	}, []);
	useEffect(() => {
		fetchVariant();
	}, []);
	return (
		<div>
			<Breadcrumb
				items={[
					{ label: "Products", link: "/products" },
					{
						label: "Product",
						link: `/products/${param.product_id?.toString()}`,
					},
					{ label: param.variant_id?.toString() || "" },
				]}
			/>
		</div>
	);
}
