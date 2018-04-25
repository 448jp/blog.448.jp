const process = require("process");
const fs = require("fs");
const path = require("path");
const yamlFrontMatter = require("yaml-front-matter");
const puppeteer = require("puppeteer");

module.exports = {
	parse: function (path) {
		const text = fs.readFileSync(path, "utf8");
		const article = yamlFrontMatter.loadFront(text);
		return {
			path,
			title: article.title,
		}
	},
	capture: async function (article) {
		// ビューポート
		const viewport = {
			width: 1200,
			height: 630,
		};
		// ファイル名
		let basename = path.basename(article.path, ".md");
		basename = path.basename(basename, ".markdown");
		// 過去記事の生成
		// basename = basename.substr(11);
		// esa経由以外の記事は無視
		if (basename.indexOf(".html") === -1) return;
		// .（ドット）を-（ハイフン）に変換
		basename = basename.replace(".", "-");
		// HTMLに渡すプロパティ
		const htmlProps = {
			title: article.title,
		};

		// puppeteer起動
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		// ビューポート設定
		page.setViewport(viewport);

		// getPropsという関数でプロパティをHTMLに渡す
		await page.exposeFunction("getProps", () => htmlProps);
		// HTMLを開く
		await page.goto("file://" + path.resolve("ogp-image-template.html"), {
			waitUntil: ["domcontentloaded", "networkidle0"]
		});
		// スクリーンショット
		await page.screenshot({path: `source/images/ogp/${basename}.png`});
		// 終了
		await browser.close();
	}
};

process.argv.map((arg, i) => {
	if (i <= 1) return;
	const article = module.exports.parse(arg);
	module.exports.capture(article);
});
