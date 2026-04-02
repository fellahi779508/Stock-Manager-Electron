import { useTranslations } from "next-intl";

export default function Home() {
	const t = useTranslations("main");
	return (
		<div>
			<h1>test</h1>
		</div>
	);
}
