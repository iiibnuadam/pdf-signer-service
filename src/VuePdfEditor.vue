<template>
	<div
		:style="{ width: width, height: height }"
		style="margin: 0 auto; overflow: hidden; position: relative"
	>
		<div
			ref="scrollBox"
			style="width: 100%; height: 100%; overflow: auto"
			class="flex-col py-12 items-center bg-gray-100"
			@wheel.ctrl="wheelZoom"
			@wheel.meta="wheelZoom"
		>
			<div
				v-if="showChooseFileBtn || showCustomizeEditor || showSaveBtn"
				style="position: fixed"
				class="z-10 top-0 left-0 right-0 z-10 h-12 flex justify-center items-center bg-gray-200 border-b border-gray-300"
			>
				<button
					v-if="showSaveBtn"
					class="flex bg-emerald-700 hover:bg-emerald-900 text-white font-bold py-1 px-3 md:px-4 mr-3 md:mr-4 rounded"
					:class="[
						pages.length === 0 ||
						saving ||
						!pdfFile ||
						(coordinate && coordinate.page == selectedPageIndex)
							? 'cursor-not-allowed !bg-gray-700 !hover:bg-gray-700'
							: '',
					]"
					:disabled="coordinate && coordinate.page == selectedPageIndex"
					@click="addSign"
				>
					<GestureIcon :size="20" class="mr-0 md:mr-2" />
					<span class="hidden md:block">
						{{ coordinate ? "Pindahkan" : "Letakan" }}
					</span>
				</button>
				<input
					ref="currentPage"
					v-model="currentPage"
					type="text"
					:min="1"
					:max="pages.length"
					class="!appearance-none w-10 h-7 text-center text-black font-bold rounded mr-2 focus:outline-none focus:ring focus:border-emerald-300"
					@blur="onBlurCurrentPage"
					@keypress="onKeyPressCurrentPage"
					@keydown.enter="onBlurCurrentPage"
				/>
				<span class="mr-3 md:mr-4 font-bold">/ {{ pages.length }}</span>
				<input
					id="pdf"
					type="file"
					name="pdf"
					class="hidden"
					@change="onUploadPDF"
				/>
				<input
					id="image"
					type="file"
					name="image"
					class="hidden"
					@change="onUploadImage"
				/>
				<label
					v-if="showChooseFileBtn"
					class="whitespace-no-wrap bg-emerald-700 hover:bg-emerald-900 text-white font-bold py-1 px-3 md:px-4 rounded mr-3 cursor-pointer md:mr-4"
					:class="hideToolbar ? 'hidden' : ''"
					for="pdf"
				>
					Select PDF
				</label>
				<button
					v-show="narrowEnlargeShow"
					class="w-7 h-7 bg-emerald-700 hover:bg-emerald-900 text-white font-bold flex items-center justify-center mr-3 md:mr-4 rounded-full"
					@click="narrow"
				>
					-
				</button>
				<div class="font-bold mr-3 md:mr-4">{{ Math.round(scale * 100) }}%</div>
				<button
					v-show="narrowEnlargeShow"
					class="w-7 h-7 bg-emerald-700 hover:bg-emerald-900 text-white font-bold flex items-center justify-center mr-3 md:mr-4 rounded-full"
					@click="enlarge"
				>
					+
				</button>
				<div
					v-if="showCustomizeEditor"
					class="relative mr-3 flex h-8 bg-gray-400 rounded-sm overflow-hidden md:mr-4"
					:class="hideToolbar ? 'hidden' : ''"
				>
					<label
						v-if="showCustomizeEditorAddImg"
						title="add pictures"
						class="flex items-center justify-center h-full w-8 hover:bg-gray-500 cursor-pointer"
						for="image"
						:class="[
							selectedPageIndex < 0 ? 'cursor-not-allowed bg-gray-500' : '',
						]"
					>
						<ImageIcon :size="20" title="An icon for adding images" />
					</label>
					<label
						v-if="showCustomizeEditorAddText"
						title="Add text"
						class="flex items-center justify-center h-full w-8 hover:bg-gray-500 cursor-pointer"
						for="text"
						:class="[
							selectedPageIndex < 0 ? 'cursor-not-allowed bg-gray-500' : '',
						]"
						@click="onAddTextField"
					>
						<TextIcon :size="20" title="An icon for adding text" />
					</label>
					<label
						v-if="showCustomizeEditorAddDraw"
						title="Add a handwriting"
						class="flex items-center justify-center h-full w-8 hover:bg-gray-500 cursor-pointer"
						:class="[
							selectedPageIndex < 0 ? 'cursor-not-allowed bg-gray-500' : '',
						]"
						@click="onAddDrawing"
					>
						<GestureIcon :size="20" title="An icon for adding drawing" />
					</label>
				</div>
				<div
					v-if="showRename"
					class="justify-center mr-3 md:mr-4 w-full max-w-xs hidden md:flex"
					:class="hideToolbar ? '!hidden' : ''"
				>
					<PencilIcon
						:size="20"
						class="mr-2"
						title="a pen, edit pdf name"
						@click="renamePDF($refs.renamePDFInputOne)"
					/>
					<input
						ref="renamePDFInputOne"
						v-model="pdfName"
						title="Rename PDF here"
						placeholder="Rename PDF here"
						type="text"
						class="flex-grow bg-transparent"
					/>
				</div>
				<button
					v-if="showSaveBtn"
					class="flex bg-emerald-700 hover:bg-emerald-900 text-white font-bold py-1 px-3 md:px-4 mr-3 md:mr-4 rounded"
					:class="[
						pages.length === 0 || saving || !pdfFile
							? 'cursor-not-allowed !bg-gray-700 !hover:bg-gray-700'
							: '',
					]"
					@click="savePDF"
				>
					<DownloadIcon :size="20" class="mr-0 md:mr-2" />
					<span class="hidden md:block">Download</span>
				</button>
			</div>
			<div v-if="addingDrawing">
				<div
					class="fixed z-10 top-0 left-0 right-0 border-b border-gray-300 bg-white shadow-lg"
					style="height: 50%"
				>
					<DrawingCanvas
						@onFinish="onFinishDrawingCanvas"
						@onCancel="onCancelDrawingCanvas"
					/>
				</div>
			</div>
			<div
				v-show="isLoading"
				class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
			>
				<svg
					aria-hidden="true"
					class="inline w-14 h-14 text-white animate-spin dark:text-white fill-emerald-700"
					viewBox="0 0 100 101"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
						fill="currentColor"
					/>
					<path
						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
						fill="currentFill"
					/>
				</svg>
			</div>
			<div
				v-if="pages.length"
				v-show="!isLoading"
				id="pdfBody"
				ref="pdfBody"
				class="w-full"
			>
				<!--  PDF main body      -->
				<div class="w-full" style="text-align: center">
					<div
						v-for="(page, pIndex) in pages"
						:key="pIndex"
						style="display: inline-block"
						:id="`page${pIndex}`"
					>
						<div class="p-5 items-center" style="text-align: center">
							<div
								style="display: inline-block"
								class="relative shadow-lg"
								:class="[pIndex === selectedPageIndex ? 'shadowOutline' : '']"
								@mousedown="selectPage(pIndex)"
								@touchstart="selectPage(pIndex)"
							>
								<PDFPage
									:ref="`page${pIndex}`"
									:scale="scale"
									:data-key="pIndex"
									:page="page"
									@onMeasure="onMeasure($event, pIndex)"
								/>
								<div
									class="absolute top-0 left-0 transform origin-top-left noTouchAction"
									:style="{ transform: `scale(${pagesScale[pIndex]})` }"
								>
									<div
										v-for="(object, oIndex) in allObjects[pIndex]"
										:key="oIndex"
									>
										<div>
											<div v-if="object.type === 'custom'">
												<slot
													name="custom"
													:object="object"
													:pagesScale="pagesScale[pIndex]"
													@onUpdate="updateObject(object.id, $event)"
													@onDelete="deleteObject(object.id)"
												/>
											</div>
											<div v-else-if="object.type === 'image'">
												<ImageItem
													:file="object.file"
													:payload="object.payload"
													:x="object.x"
													:y="object.y"
													:fix-size="object.isSealImage"
													:width="object.width"
													:height="object.height"
													:origin-width="object.originWidth"
													:origin-height="object.originHeight"
													:page-scale="pagesScale[pIndex]"
													@onUpdate="updateObject(object.id, $event)"
													@onDelete="deleteObject(object.id)"
												/>
											</div>
											<div v-else-if="object.type === 'text'">
												<TextItem
													ref="textItem"
													:text="object.text"
													:x="object.x"
													:y="object.y"
													:show-line-size-select="showLineSizeSelect"
													:show-font-size-select="showFontSizeSelect"
													:show-font-select="showFontSelect"
													:size="object.size"
													:line-height="object.lineHeight"
													:font-family="object.fontFamily"
													:current-page="object.currentPage"
													:page-scale="pagesScale[pIndex]"
													@onUpdate="updateObject(object.id, $event)"
													@onDelete="deleteObject(object.id)"
													@onSelectFont="selectFontFamily"
												/>
											</div>
											<div v-else-if="object.type === 'drawing'">
												<Drawing
													:path="object.path"
													:x="object.x"
													:y="object.y"
													:width="object.width"
													:origin-width="object.originWidth"
													:origin-height="object.originHeight"
													:page-scale="pagesScale[pIndex]"
													@onUpdate="updateObject(object.id, $event)"
													@onDelete="deleteObject(object.id)"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { fetchFont } from "./utils/prepareAssets.js";

import PDFPage from "./Components/PDFPage.vue";
import ImageItem from "./Components/Image.vue";
import TextItem from "./Components/TextItem.vue";
import Drawing from "./Components/Drawing.vue";
import DrawingCanvas from "./Components/DrawingCanvas.vue";
import {
	readAsImage,
	readAsPDF,
	readAsDataURL,
	extractMetadata,
} from "./utils/asyncReader.js";
import { save } from "./utils/PDF.js";
import ImageIcon from "vue-material-design-icons/Image.vue";
import TextIcon from "vue-material-design-icons/Text.vue";
import GestureIcon from "vue-material-design-icons/Gesture.vue";
import PencilIcon from "vue-material-design-icons/Pencil.vue";
import DownloadIcon from "vue-material-design-icons/Download.vue";

export default {
	name: "VuePdfEditor",
	components: {
		PDFPage,
		ImageItem,
		TextItem,
		Drawing,
		DrawingCanvas,
		ImageIcon,
		TextIcon,
		GestureIcon,
		DownloadIcon,
		PencilIcon,
	},
	props: {
		msg: String,
		width: {
			type: String,
			default: "100%",
		},
		height: {
			type: String,
			default: "100%",
		},
		showChooseFileBtn: {
			type: Boolean,
			default: false,
		},
		showCustomizeEditor: {
			type: Boolean,
			default: true,
		},
		showCustomizeEditorAddText: {
			type: Boolean,
			default: true,
		},
		showCustomizeEditorAddImg: {
			type: Boolean,
			default: true,
		},
		showCustomizeEditorAddDraw: {
			type: Boolean,
			default: true,
		},
		showLineSizeSelect: {
			type: Boolean,
			default: true,
		},
		showFontSizeSelect: {
			type: Boolean,
			default: true,
		},
		showFontSelect: {
			type: Boolean,
			default: true,
		},
		showRename: {
			type: Boolean,
			default: true,
		},
		showSaveBtn: {
			type: Boolean,
			default: true,
		},
		loadDefaultFile: {
			type: Boolean,
			default: true,
		},
		saveToUpload: {
			type: Boolean,
			default: false,
		},
		initFileSrc: {
			type: String,
			default: "",
		},
		initFileName: {
			type: String,
			default: "",
		},
		initTextFields: {
			type: Array,
			default: null,
		},
		textDefaultSize: {
			type: Number,
			default: 12,
		},
		initImageUrls: {
			type: Array,
			default: null,
		},
		initImageScale: {
			type: Number,
			default: 0.2,
		},
		sealImageShow: {
			type: Boolean,
			default: false,
		},
		sealImageUrl: {
			type: String,
			default: "assets/img/sealImag.png",
		},
		sealImageHiddenOnSave: {
			type: Boolean,
			default: false,
		},
		everyPageSeal: {
			type: Boolean,
			default: true,
		},
		initialHeightImage: {
			type: Number,
			default: 0,
		},
		initialWidthImage: {
			type: Number,
			default: 0,
		},
		hideToolbar: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			wheelZoomCount: 0,
			narrowEnlargeShow: false,
			scale: 1,
			pdfFile: null,
			pdfName: "",
			numPages: null,
			pdfDocument: null,
			pages: [],
			pagesScale: [],
			allObjects: [],
			currentFont: "Courier",
			focusId: null,
			selectedPageIndex: -1,
			currentPage: 1,
			saving: false,
			addingDrawing: false,
			coordinate: null,
			metadata: null,
			isFirstLoad: true,
			isLoading: false,
		};
	},
	watch: {
		coordinate(val) {
			this.$emit("setCoodinate", { coordinate: val, metadata: this.metadata });
		},
		selectedPageIndex(val) {
			this.selectPage(val);
			this.addSign();
			this.currentPage = val + 1;
		},
	},
	async mounted() {
		await this.init();
	},
	created() {},
	methods: {
		wheelZoom(e) {
			e.stopPropagation();
			e.preventDefault();
			this.wheelZoomCount++;

			if (this.wheelZoomCount < 3) {
				return;
			}
			this.wheelZoomCount = 0;
			if (e.deltaY > 0) {
				this.narrow();
			} else if (e.deltaY < 0) {
				this.enlarge();
			}
		},
		enlarge() {
			if (this.scale >= 2) {
				return;
			}
			this.scale = parseFloat((this.scale + 0.1).toFixed(1));
		},
		narrow() {
			if (this.scale <= 0.1) {
				return;
			}
			this.scale = parseFloat((this.scale - 0.1).toFixed(1));
		},
		async init() {
			if (!this.initFileSrc) {
				console.log("init file is not exist");
				return;
			}
			try {
				this.isLoading = true;
				await this.addPDF(this.initFileSrc);
				this.selectedPageIndex = 0;
				fetchFont(this.currentFont);
				this.narrowEnlargeShow = true;
				this.initTextField();
				await this.initImages();
				this.metadata = await extractMetadata(this.initFileSrc);
				this.isFirstLoad = false;
			} catch (e) {
				console.log(e);
			} finally {
				this.isLoading = false;
			}
		},
		initTextField() {
			if (
				this.selectedPageIndex < 0 ||
				this.initTextFields === null ||
				this.initTextFields.length === 0
			) {
				return;
			}
			for (let i = 0; i < this.pages.length; i++) {
				this.selectedPageIndex = i;
				for (let j = 0; j < this.initTextFields.length; j++) {
					const text = this.initTextFields[j];
					this.addTextField(text, 0, j * 60, this.selectedPageIndex);
				}
			}
			this.selectedPageIndex = 0;
			const checker = setInterval(() => {
				if (
					this.$refs.textItem.length ===
					this.initTextFields.length * this.pages.length
				) {
					document.getElementById("pdfBody").dispatchEvent(
						new MouseEvent("mousedown", {
							bubbles: true,
							cancelable: true,
							view: window,
						})
					);
					clearInterval(checker);
				}
			}, 100);
		},
		async initImages() {
			if (this.selectedPageIndex < 0) {
				return;
			}
			if (this.everyPageSeal) {
				for (let i = 0; i < this.pages.length; i++) {
					this.selectedPageIndex = i;
					let y = 0;
					if (this.initImageUrls !== null && this.initImageUrls.length !== 0) {
						// Need to initialize pictures
						for (let j = 0; j < this.initImageUrls.length; j++) {
							if (this.initTextFields.length === 0) {
								y = j * 100;
							} else {
								y = (j - 1 + this.initTextFields.length) * 100;
							}
							await this.addImage(this.initImageUrls[j], 0, y, 1);
						}
					}
					if (this.sealImageShow) {
						// Example of display seal
						const res = await fetch(this.sealImageUrl);
						await this.addImage(await res.blob(), 0, (y + 1) * 100, 0.4, true);
					}
				}
			} else {
				this.selectedPageIndex = 0;
				let y = 0;
				if (this.initImageUrls !== null && this.initImageUrls.length !== 0) {
					// Need to initialize pictures
					for (let j = 0; j < this.initImageUrls.length; j++) {
						if (this.initTextFields.length === 0) {
							y = j * 100;
						} else {
							y = (j - 1 + this.initTextFields.length) * 100;
						}
						await this.addImage(this.initImageUrls[j], 0, y, 1);
					}
				}
				if (this.sealImageShow) {
					// Example of display seal
					const res = await fetch(this.sealImageUrl);
					await this.addImage(await res.blob(), 0, (y + 1) * 100, 0.4, true);
				}
			}
			this.selectedPageIndex = 0;
		},
		onFinishDrawingCanvas(e) {
			const { originWidth, originHeight, path } = e;
			let scale = 1;
			if (originWidth > 500) {
				scale = 500 / originWidth;
			}
			this.addDrawing(originWidth, originHeight, path, scale);
			this.onCancelDrawingCanvas();
		},
		onCancelDrawingCanvas() {
			this.addingDrawing = false;
		},
		genID() {
			let id = 0;
			return function genId() {
				return id++;
			};
		},
		async onUploadPDF(e) {
			const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
			const file = files[0];
			if (!file || file.type !== "application/pdf") return;
			this.selectedPageIndex = -1;
			try {
				await this.addPDF(file);
				this.narrowEnlargeShow = true;
				this.selectedPageIndex = 0;
			} catch (e) {
				console.log(e);
			}
			this.initTextField();
			await this.initImages();
		},
		resetDefaultState() {
			this.pdfFile = null;
			this.pdfName = "";
			this.numPages = null;
			this.pdfDocument = null;
			this.pages = [];
			this.pagesScale = [];
			this.allObjects = [];
		},
		async addPDF(file) {
			try {
				this.resetDefaultState();

				this.pdfFile = file;
				if (this.initFileName) {
					this.pdfName = this.initFileName;
				} else if (file instanceof File && file.name) {
					this.pdfName = file.name;
				} else {
					this.pdfName = new Date().getTime();
				}

				if (file instanceof File) {
					const blob = new Blob([file]);
					file = await blob.arrayBuffer();
				}

				this.pdfDocument = await readAsPDF(file);
				if (this.pdfDocument) {
					this.numPages = this.pdfDocument.numPages;
					this.pages = Array(this.numPages)
						.fill()
						.map((_, i) => this.pdfDocument.getPage(i + 1));
					this.allObjects = this.pages.map(() => []);
					this.pagesScale = Array(this.numPages).fill(1);

					const data = {
						allObjects: this.allObjects,
						numPages: this.numPages,
						pages: this.pages,
						measurement: [],
					};
					// Wait until all pages have been read
					const pages = await Promise.all(this.pages);
					pages.forEach((page) => {
						const measurement = page.getViewport().viewBox;
						data.measurement[page.pageNumber] = {
							width: measurement[2],
							height: measurement[3],
						};
					});
					this.$emit("pdf-editor:end-init", data);
				}
			} catch (e) {
				console.log("Failed to add pdf.");
				throw e;
			}
		},
		async onUploadImage(e) {
			const file = e.target.files[0];
			if (file && this.selectedPageIndex >= 0) {
				await this.addImage(file);
			}
			e.target.value = null;
		},
		async addImage(file, x = 0, y = 0, sizeNarrow = 1, isSealImage = false) {
			try {
				// get dataURL to prevent canvas from tainted
				let url;
				if (typeof file === "string" && file.includes("http")) {
					url = file;
				} else {
					url = await readAsDataURL(file);
				}
				const img = await readAsImage(url);
				const id = this.genID();
				const { width, height } = img;

				const { canvasWidth, canvasHeight } =
					this.$refs[`page${this.selectedPageIndex}`][0].getCanvasMeasurement();

				const object = {
					id,
					type: "image",
					width: this.initialWidthImage
						? this.initialWidthImage
						: width * sizeNarrow,
					height: this.initialHeightImage
						? this.initialHeightImage
						: height * sizeNarrow,
					originWidth: width,
					originHeight: height,
					canvasWidth,
					canvasHeight,
					x,
					y,
					isSealImage,
					payload: img,
					file,
				};
				this.addObject(object);
			} catch (e) {
				console.log("Fail to add image.", e);
			}
		},
		onAddTextField() {
			if (this.selectedPageIndex >= 0) {
				this.addTextField();
			}
		},

		addTextField(
			text = "Please enter here",
			x = 0,
			y = 0,
			currentPage = this.selectedPageIndex
		) {
			const id = this.genID();
			fetchFont(this.currentFont);
			const object = {
				id,
				text,
				type: "text",
				size: this.textDefaultSize,
				width: 0, // recalculate after editing
				lineHeight: 1.4,
				fontFamily: this.currentFont,
				x,
				y,
				currentPage,
			};
			this.addObject(object);
		},

		onAddDrawing() {
			if (this.selectedPageIndex >= 0) {
				this.addingDrawing = true;
			}
		},

		addDrawing(originWidth, originHeight, path, scale = 1) {
			const id = this.genID();
			const object = {
				id,
				path,
				type: "drawing",
				x: 0,
				y: 0,
				originWidth,
				originHeight,
				width: originWidth * scale,
				scale,
			};
			this.addObject(object);
		},

		addObject(object) {
			this.allObjects = this.allObjects.map((objects, pIndex) =>
				pIndex === this.selectedPageIndex ? [...objects, object] : objects
			);
			this.coordinate = {
				x: object.x,
				y: object.y,
				width: object.width,
				height: object.height,
				page: this.selectedPageIndex,
			};
		},

		selectFontFamily(event) {
			const name = event.name;
			fetchFont(name);
			this.currentFont = name;
		},

		selectPage(index) {
			this.selectedPageIndex = index;
		},

		updateObject(objectId, payload) {
			this.allObjects = this.allObjects.map((objects, pIndex) =>
				pIndex ===
				(payload.currentPage !== undefined
					? payload.currentPage
					: this.selectedPageIndex)
					? objects.map(
							(object) =>
								object.id === objectId ? { ...object, ...payload } : object
							// eslint-disable-next-line no-mixed-spaces-and-tabs
					  )
					: objects
			);
			const object =
				this.allObjects.find((object) => object.length > 0)?.[0] || null;

			this.coordinate = {
				x: object.x,
				y: object.y,
				width: object.width,
				height: object.height,
				page: this.selectedPageIndex,
			};
		},

		deleteObject(objectId) {
			this.allObjects = this.allObjects.map((objects, pIndex) =>
				pIndex === this.selectedPageIndex
					? objects.filter((object) => object.id !== objectId)
					: objects
			);
			this.coordinate = null;
		},

		onMeasure(e, i) {
			this.pagesScale[i] = e.scale;
			this.$forceUpdate();
		},

		renamePDF(object) {
			object.focus();
		},

		async savePDF() {
			if (!this.pdfFile || this.saving || !this.pages.length) return;
			this.saving = true;
			try {
				const sealInfo = [];
				const allObject4Save = [];
				if (this.sealImageShow) {
					for (let i = 0; i < this.pages.length; i++) {
						const seal = this.allObjects[i].find((e) => e.isSealImage === true);
						const page = await this.pages[i].then((response) => response);
						sealInfo.push({
							page: page._pageIndex,
							pageWidth: page._pageInfo.view[2],
							pageHeight: page._pageInfo.view[3],
							x: seal.x + 60,
							y: seal.y + 60,
						});
						if (this.sealImageHiddenOnSave) {
							allObject4Save.push(this.allObjects[i].filter((e) => e !== seal));
						}
					}
				}
				await save(
					this.pdfFile,
					this.sealImageShow && this.sealImageHiddenOnSave
						? allObject4Save
						: this.allObjects,
					this.pdfName,
					this.saveToUpload,
					(pdfBytes) => {
						this.$emit("onSave2Upload", {
							pdfBytes,
							fileName: this.pdfName,
							sealInfo,
						});
					}
				);
			} catch (e) {
				console.log(e);
			} finally {
				this.saving = false;
			}
		},

		addSign() {
			if (this.coordinate) {
				this.allObjects = this.allObjects.map(() => []);
			}
			if (!this.isFirstLoad) {
				this.addImage(this.initImageUrls[0]);
			}
		},

		scrollToPage(index) {
			// Accessing the scroll box reference
			const scrollbox = this.$refs.scrollBox;
			// Finding the target page element by its id
			const targetPage = document.getElementById(`page${index}`);
			if (targetPage) {
				// Scroll to the top position of the target page
				scrollbox.scrollTop = targetPage.offsetTop - 50;
			}
		},

		onKeyPressCurrentPage(event) {
			// Allow only numeric keys
			const charCode = event.charCode;

			if (charCode < 48 || charCode > 57) {
				event.preventDefault();
			}
		},

		onBlurCurrentPage() {
			// Handle empty string case on blur
			if (this.currentPage === "") {
				this.currentPage = 1;
				return;
			}

			// Convert to a number and ensure the currentPage is within the valid range
			let value = Number(this.currentPage);

			if (isNaN(value) || value < 1) {
				value = 1;
			} else if (value > this.pages.length) {
				value = this.pages.length;
			}

			this.currentPage = value;
			this.selectedPageIndex = value - 1;
			this.scrollToPage(value - 1);
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.shadowOutline {
	box-shadow: 0 0 0 3px rgb(16, 185, 129, 0.5);
}

.noTouchAction {
	touch-action: none;
}

h3 {
	margin: 40px 0 0;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: inline-block;
	margin: 0 10px;
}

a {
	color: #42b983;
}
</style>
