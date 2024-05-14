<template>
	<div id="app">
		<VuePdfEditor
			ref="vuePdfEditor"
			width="100%"
			height="100%"
			:hide-toolbar="true"
			:show-choose-file-btn="true"
			:show-customize-editor="true"
			:show-customize-editor-add-text="true"
			:show-customize-editor-add-img="true"
			:show-customize-editor-add-draw="true"
			:show-line-size-select="true"
			:show-font-size-select="true"
			:show-font-select="true"
			:show-rename="true"
			:show-save-btn="true"
			:init-file-src="initFile"
			:init-file-name="initFileName"
			:init-text-fields="textFields"
			:init-image-urls="imageUrls"
			:init-image-scale="1"
			:save-to-upload="false"
			:seal-image-show="false"
			:seal-image-hidden-on-save="false"
			:every-page-seal="false"
			:initial-height-image="200"
			:initial-width-image="200"
			@onSave2Upload="save2Upload"
			@setCoodinate="setCoodinate"
		>
		</VuePdfEditor>
	</div>
</template>

<script>
export default {
	name: "App",
	created() {
		const params = new URLSearchParams(window.location.search);
		this.imageUrls = params.get("signature") ? [params.get("signature")] : [];
		this.initFile = params.get("file") || "";
		this.initFileName = params.get("fileName") || "";
	},
	data() {
		return {
			initFileName: "",
			initFile: "",
			textFields: [],
			imageUrls: [],
		};
	},
	methods: {
		setCoodinate(coordinate) {
			const params = new URLSearchParams(window.location.search);
			params.set("coordinate", JSON.stringify(coordinate));
			window.history.replaceState(
				{},
				"",
				`${window.location.pathname}?${params}`
			);
		},
		save2Upload(payload) {
			console.log(payload.pdfBytes);
			console.log(payload.fileName);
			console.log(payload.sealInfo);
		},
	},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #000000;
}
</style>
