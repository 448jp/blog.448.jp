const fs = require("fs");
const generator = require("./ogp-image-generate");

fs.readdir("./source/_posts/", (err, files) => {
	const fileList = files.filter(file => {
		return fs.statSync(`./source/_posts/${file}`).isFile() && /\.(md|markdown)$/.test(file);
	});

	fileList.map(file => {
		const article = generator.parse(`./source/_posts/${file}`);
		generator.capture(article);
	});
});