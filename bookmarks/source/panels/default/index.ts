import { App, createApp, defineComponent } from 'vue';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ViewType, PanelType, EventType, ActionType } from '../shared/constants';
import { AssetGroup, NodeGroup, AssetBookmark, NodeBookmark, SaveData, AssetSaveData, NodeSaveData } from '../shared/types';
import { readJsonFile, writeJsonFile } from '../shared/utils/file';
import { validateGroupName, isAssetGroup, isNodeGroup } from '../shared/utils/validation';
import { debounce } from '../shared/utils/debounce';
import { typeMap, extMap, IconType, customIcons } from '../shared/constants/icons';
import { generateId, handleError, getAssetIcon } from './utils';

// 面板数据存储
const panelDataMap = new WeakMap<any, App>();

// 组件状态接口
interface State {
	currentView: ViewType;
	i18n: {
		asset_bookmark: string;
		node_bookmark: string;
	};
	groups: AssetGroup[];
	currentGroup: AssetGroup | null;
	dragState: string;
	dragIndex: number;
	showGroupInput: boolean;
	newGroupName: string;
	isLoading: boolean;
	searchText: string;
	selectedBookmark: AssetBookmark | null;
	isDragging: boolean;
	draggedBookmark: AssetBookmark | null;
}

// 定义 Vue 组件
const BookmarksPanel = defineComponent({
	name: 'BookmarksPanel',

	// 修改指令定义
	directives: {
		icon: {
			mounted(el: HTMLElement, binding: { value: string }) {
				try {
					if (binding.value && customIcons[binding.value as keyof typeof customIcons]) {
						el.innerHTML = customIcons[binding.value as keyof typeof customIcons];
					}
				} catch (err) {
					console.error('图标渲染失败:', err);
				}
			},
			updated(el: HTMLElement, binding: { value: string }) {
				try {
					if (binding.value && customIcons[binding.value as keyof typeof customIcons]) {
						el.innerHTML = customIcons[binding.value as keyof typeof customIcons];
					}
				} catch (err) {
					console.error('图标更新失败:', err);
				}
			}
		}
	},

	// 添加这个，使 ViewType 在模板中可用
	setup() {
		return {
			ViewType // 暴露给模板
		};
	},

	// 组件数据
	data(): State {
		return {
			currentView: ViewType.ASSETS,
			i18n: {
				asset_bookmark: Editor.I18n.t('bookmarks.panel.asset_bookmark'),
				node_bookmark: Editor.I18n.t('bookmarks.panel.node_bookmark')
			},
			groups: [],
			currentGroup: null,
			dragState: '',
			dragIndex: -1,
			showGroupInput: false,
			newGroupName: '',
			isLoading: false,
			searchText: '',
			selectedBookmark: null as AssetBookmark | null,
			isDragging: false,
			draggedBookmark: null as AssetBookmark | null
		};
	},

	// 计算属性
	computed: {
		sortedGroups(): AssetGroup[] {
			return [...this.groups].sort((a, b) => a.order - b.order);
		},
		filteredBookmarkList(): AssetBookmark[] {
			if (!this.currentGroup) return [];
			if (!this.searchText) return this.currentGroup.bookmarkList;

			const searchLower = this.searchText.toLowerCase();
			return this.currentGroup.bookmarkList.filter((bookmark: AssetBookmark) => bookmark.name.toLowerCase().includes(searchLower));
		},
		isEmpty(): boolean {
			return !this.currentGroup || this.currentGroup.bookmarkList.length === 0;
		},
		canOperate(): boolean {
			return this.currentGroup !== null;
		}
	},

	// 组件方法
	methods: {
		// 视图切换
		switchView(view: ViewType): void {
			this.currentView = view;
		},

		// 资源跳转
		async jumpToAsset(uuid: string): Promise<void> {
			await Editor.Message.request('asset-db', 'open-asset', uuid);
		},

		// 书签点击
		async onBookmarkClick(bookmark: AssetBookmark): Promise<void> {
			// 使用 broadcast 发送闪烁消息
			// Editor.Message.broadcast('ui-kit:touch-asset', [bookmark.uuid]);
			Editor.Message.broadcast('twinkle', bookmark.uuid);
		},

		// 添加双击处理
		async onBookmarkDblClick(bookmark: AssetBookmark): Promise<void> {
			// 双击时打开资源
			await this.jumpToAsset(bookmark.uuid);
		},

		// 分组拖拽相关
		onDragStartGroup(event: DragEvent, groupId: string): void {
			try {
				if (!event.dataTransfer) return;
				event.dataTransfer.setData('group-id', groupId);
				event.dataTransfer.effectAllowed = 'move';

				const target = event.target as HTMLElement;
				target.classList.add('dragging');

				this.dragState = 'group';
				this.dragIndex = this.groups.findIndex((g) => g.id === groupId);
			} catch (err) {
				handleError(err, '开始拖拽失败');
			}
		},

		onDragEndGroup(event: DragEvent): void {
			try {
				const target = event.target as HTMLElement;
				target.classList.remove('dragging');
				this.dragState = '';
				this.dragIndex = -1;
			} catch (err) {
				handleError(err, '结束拖拽失败');
			}
		},

		onDragOverGroup(event: DragEvent): void {
			event.preventDefault();
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'move';
			}
		},

		onDropGroup(event: DragEvent, targetGroupId: string): void {
			event.preventDefault();
			if (!event.dataTransfer) return;

			try {
				const sourceId = event.dataTransfer.getData('group-id');
				if (!sourceId || sourceId === targetGroupId) return;

				const sourceIndex = this.groups.findIndex((g) => g.id === sourceId);
				const targetIndex = this.groups.findIndex((g) => g.id === targetGroupId);

				if (sourceIndex > -1 && targetIndex > -1) {
					const [movedGroup] = this.groups.splice(sourceIndex, 1);
					this.groups.splice(targetIndex, 0, movedGroup);

					// 更新排序
					this.groups.forEach((group, index) => {
						group.order = index;
					});

					this.saveData();
				}
			} catch (err) {
				handleError(err, '移动分组失败');
			}
		},

		// 资源拖拽处理
		async onDrop(event: DragEvent): Promise<void> {
			try {
				if (!this.currentGroup) {
					await Editor.Dialog.warn(Editor.I18n.t('bookmarks.dialog.select_group'));
					return;
				}

				event.preventDefault();
				event.stopPropagation();

				// 获取拖拽的资源 UUID
				const uuids = Editor.Selection.getSelected('asset');
				if (!uuids || uuids.length === 0) return;

				this.isLoading = true;
				await this.addByUuids(uuids);
			} catch (err) {
				handleError(err, Editor.I18n.t('bookmarks.dialog.add_failed'));
			} finally {
				this.isLoading = false;
			}
		},

		// 数据处理相关
		async addByUuids(uuids: string[]): Promise<void> {
			if (!this.currentGroup) return;

			for (const uuid of uuids) {
				if (this.currentGroup.bookmarkList.some((item) => item.uuid === uuid)) {
					continue;
				}

				if (uuid === 'db://assets' || uuid === 'db://internal') {
					continue;
				}

				const markInfo = await this.getMarkInfoByUUID(uuid);
				if (markInfo) {
					this.currentGroup.bookmarkList.push(markInfo);
				}
			}
			this.saveData();
		},

		async getMarkInfoByUUID(uuid: string): Promise<AssetBookmark | null> {
			try {
				const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
				if (!assetInfo) return null;

				const iconType = getAssetIcon(assetInfo.file.split('.').pop() || '', assetInfo.type);

				return {
					id: generateId(),
					name: assetInfo.name,
					uuid: uuid,
					extname: assetInfo.file.slice(assetInfo.file.lastIndexOf('.')),
					base64: '',
					additional: [],
					assetType: iconType,
					iconHtml: '',
					createTime: Date.now(),
					updateTime: Date.now()
				};
			} catch (err) {
				handleError(err, '获取资源信息失败');
				return null;
			}
		},

		// 分组管理相关
		addGroup(): void {
			if (!this.newGroupName) return;

			if (!validateGroupName(this.newGroupName)) {
				Editor.Dialog.warn(Editor.I18n.t('bookmarks.dialog.group_name_invalid'));
				return;
			}

			const group: AssetGroup = {
				id: generateId(),
				name: this.newGroupName,
				bookmarkList: [],
				order: this.groups.length,
				createTime: Date.now(),
				updateTime: Date.now()
			};

			this.groups.push(group);
			this.newGroupName = '';
			this.showGroupInput = false;
			this.saveData();
		},

		removeGroup(group: AssetGroup): void {
			const index = this.groups.findIndex((g) => g.id === group.id);
			if (index > -1) {
				this.groups.splice(index, 1);
				if (this.currentGroup?.id === group.id) {
					this.currentGroup = null;
				}
				this.saveData();
			}
		},

		switchGroup(groupId: string): void {
			this.currentGroup = this.groups.find((g) => g.id === groupId) || null;
		},

		removeBookmark(bookmark: AssetBookmark): void {
			if (!this.currentGroup) return;

			const index = this.currentGroup.bookmarkList.findIndex((b) => b.id === bookmark.id);
			if (index > -1) {
				this.currentGroup.bookmarkList.splice(index, 1);
				this.saveData();
			}
		},

		// 数据持久化
		saveData: debounce(function (this: any): void {
			try {
				const data: AssetSaveData = {
					version: '1.0.0',
					timestamp: Date.now(),
					groups: this.groups,
					currentGroup: this.currentGroup ? this.groups.findIndex((group: AssetGroup) => group.id === this.currentGroup!.id) : -1
				};

				const savePath = join(Editor.Project.path, 'settings/bookmarks.json');
				writeJsonFile(savePath, data);
			} catch (err) {
				handleError(err, Editor.I18n.t('bookmarks.dialog.save_failed'));
			}
		}, 300),

		async loadData(): Promise<void> {
			try {
				const savePath = join(Editor.Project.path, 'settings/bookmarks.json');
				const data = readJsonFile<AssetSaveData>(savePath);

				if (data) {
					if (!this.validateGroupData(data)) {
						throw new Error(Editor.I18n.t('bookmarks.dialog.invalid_data'));
					}

					this.groups = data.groups;

					if (data.currentGroup >= 0 && data.currentGroup < this.groups.length) {
						this.currentGroup = this.groups[data.currentGroup];
					}
				}
			} catch (err) {
				handleError(err, Editor.I18n.t('bookmarks.dialog.load_failed'));
				this.groups = [];
				this.currentGroup = null;
			}
		},

		async clearAll(): Promise<void> {
			const result = await Editor.Dialog.info(Editor.I18n.t('bookmarks.dialog.clear_confirm'), {
				title: Editor.I18n.t('bookmarks.dialog.confirm'),
				buttons: [Editor.I18n.t('bookmarks.dialog.confirm'), Editor.I18n.t('bookmarks.dialog.cancel')],
				default: 0,
				cancel: 1
			});

			if (result.response === 0) {
				this.groups = [];
				this.currentGroup = null;
				this.saveData();
			}
		},

		/**
		 * 查找分组
		 */
		findGroupById(id: string): AssetGroup | null {
			return this.groups.find((group: AssetGroup) => group.id === id) || null;
		},

		/**
		 * 更新分组顺序
		 */
		updateGroupOrder(): void {
			this.groups.forEach((group: AssetGroup, index: number) => {
				group.order = index;
			});
		},

		/**
		 * 验证分组数据
		 */
		validateGroupData(data: any): boolean {
			return data && Array.isArray(data.groups) && data.groups.every((group: any) => isAssetGroup(group));
		},

		/**
		 * 验证书签数据
		 */
		isValidBookmark(bookmark: any): bookmark is AssetBookmark {
			return bookmark && typeof bookmark.id === 'string' && typeof bookmark.name === 'string' && typeof bookmark.uuid === 'string' && typeof bookmark.assetType === 'string';
		},

		// 书签拖拽相关
		onDragStartBookmark(event: DragEvent, bookmark: AssetBookmark): void {
			try {
				if (!event.dataTransfer) return;
				event.dataTransfer.setData('bookmark-id', bookmark.id);
				event.dataTransfer.effectAllowed = 'move';

				const target = event.target as HTMLElement;
				target.classList.add('dragging');

				this.isDragging = true;
				this.draggedBookmark = bookmark;
			} catch (err) {
				handleError(err, '开始拖拽书签失败');
			}
		},

		onDragEndBookmark(event: DragEvent): void {
			try {
				const target = event.target as HTMLElement;
				target.classList.remove('dragging');
				this.isDragging = false;
				this.draggedBookmark = null;
			} catch (err) {
				handleError(err, '结束拖拽书签失败');
			}
		},

		onDragOverBookmark(event: DragEvent): void {
			event.preventDefault();
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'move';
			}
		},

		onDropBookmark(event: DragEvent, targetBookmark: AssetBookmark): void {
			event.preventDefault();
			if (!event.dataTransfer || !this.currentGroup) return;

			try {
				const sourceId = event.dataTransfer.getData('bookmark-id');
				if (!sourceId || sourceId === targetBookmark.id) return;

				const sourceIndex = this.currentGroup.bookmarkList.findIndex((b) => b.id === sourceId);
				const targetIndex = this.currentGroup.bookmarkList.findIndex((b) => b.id === targetBookmark.id);

				if (sourceIndex > -1 && targetIndex > -1) {
					const [movedBookmark] = this.currentGroup.bookmarkList.splice(sourceIndex, 1);
					this.currentGroup.bookmarkList.splice(targetIndex, 0, movedBookmark);
					this.saveData();
				}
			} catch (err) {
				handleError(err, '移动书签失败');
			}
		},

		// 选择书签
		selectBookmark(bookmark: AssetBookmark): void {
			this.selectedBookmark = bookmark;
		}
	},

	// 生命周期钩子
	mounted() {
		this.loadData();
	}
});

// 存储组件实例的引用
let componentInstance: any = null;

// 面板定义
module.exports = Editor.Panel.define({
	listeners: {
		show() {
			console.log('show');
			// 每次显示面板时重新加载数据
			if (componentInstance?.loadData) {
				componentInstance.loadData();
			}
		},
		hide() {
			console.log('hide');
		}
	},
	template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
	style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
	$: {
		app: '#app'
	},
	methods: {},
	ready() {
		if (this.$.app) {
			const app = createApp(BookmarksPanel);
			app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
			componentInstance = app.mount(this.$.app);
			// 初始化时加载数据
			componentInstance.loadData?.();
			panelDataMap.set(this, app);
		}
	},
	beforeClose() {},
	close() {
		const app = panelDataMap.get(this);
		if (app) {
			app.unmount();
			componentInstance = null;
		}
	}
});
