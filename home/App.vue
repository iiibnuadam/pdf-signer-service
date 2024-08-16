<template>
	<div id="app">
		<VuePdfEditor
			ref="vuePdfEditor"
			width="100%"
			height="100%"
			:hide-toolbar="limitedAccess"
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
			:initial-height-image="this.height"
			:initial-width-image="this.width"
			:readonly="readonly"
			:initial-page="page"
			:x="x"
			:y="y"
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
		this.readonly = params.get("readonly") === "true";
		this.page = params.get("page") ? Number(params.get("page")) : 1;
		this.x = params.get("x") ? Number(params.get("x")) : 0;
		this.y = params.get("y") ? Number(params.get("y")) : 0;
		this.width = params.get("width") ? Number(params.get("width")) : 200;
		this.height = params.get("height") ? Number(params.get("height")) : 200;

		params.get("access") === "full"
			? (this.limitedAccess = false)
			: (this.limitedAccess = true);
	},
	data() {
		return {
			initFileName: "",
			initFile: "",
			textFields: [],
			imageUrls: [],
			limitedAccess: true,
			readonly: false,
			page: 1,
			x: 0,
			y: 0,
			width: 0,
			height: 0,
		};
	},
	methods: {
		setCoodinate(coordinate) {
			window.parent.postMessage(
				{
					type: "coordinate",
					page: coordinate.page,
					coordinate: coordinate.coordinate,
					metadata: coordinate.metadata,
				},
				"*"
			);
		},
		save2Upload() {
			// callback after save to upload
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
	height: 100vh;
}
</style>
