"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = require("vue");
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("../shared/constants");
const file_1 = require("../shared/utils/file");
const validation_1 = require("../shared/utils/validation");
const debounce_1 = require("../shared/utils/debounce");
const icons_1 = require("../shared/constants/icons");
const utils_1 = require("./utils");
// 面板数据存储
const panelDataMap = new WeakMap();
// 定义 Vue 组件
const BookmarksPanel = (0, vue_1.defineComponent)({
    name: 'BookmarksPanel',
    // 修改指令定义
    directives: {
        icon: {
            mounted(el, binding) {
                try {
                    if (binding.value && icons_1.customIcons[binding.value]) {
                        el.innerHTML = icons_1.customIcons[binding.value];
                    }
                }
                catch (err) {
                    console.error('图标渲染失败:', err);
                }
            },
            updated(el, binding) {
                try {
                    if (binding.value && icons_1.customIcons[binding.value]) {
                        el.innerHTML = icons_1.customIcons[binding.value];
                    }
                }
                catch (err) {
                    console.error('图标更新失败:', err);
                }
            }
        }
    },
    // 添加这个，使 ViewType 在模板中可用
    setup() {
        return {
            ViewType: constants_1.ViewType // 暴露给模板
        };
    },
    // 组件数据
    data() {
        return {
            currentView: constants_1.ViewType.ASSETS,
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
            selectedBookmark: null,
            isDragging: false,
            draggedBookmark: null
        };
    },
    // 计算属性
    computed: {
        sortedGroups() {
            return [...this.groups].sort((a, b) => a.order - b.order);
        },
        filteredBookmarkList() {
            if (!this.currentGroup)
                return [];
            if (!this.searchText)
                return this.currentGroup.bookmarkList;
            const searchLower = this.searchText.toLowerCase();
            return this.currentGroup.bookmarkList.filter((bookmark) => bookmark.name.toLowerCase().includes(searchLower));
        },
        isEmpty() {
            return !this.currentGroup || this.currentGroup.bookmarkList.length === 0;
        },
        canOperate() {
            return this.currentGroup !== null;
        }
    },
    // 组件方法
    methods: {
        // 视图切换
        switchView(view) {
            this.currentView = view;
        },
        // 资源跳转
        async jumpToAsset(uuid) {
            await Editor.Message.request('asset-db', 'open-asset', uuid);
        },
        // 书签点击
        async onBookmarkClick(bookmark) {
            // 使用 broadcast 发送闪烁消息
            // Editor.Message.broadcast('ui-kit:touch-asset', [bookmark.uuid]);
            Editor.Message.broadcast('twinkle', bookmark.uuid);
        },
        // 添加双击处理
        async onBookmarkDblClick(bookmark) {
            // 双击时打开资源
            await this.jumpToAsset(bookmark.uuid);
        },
        // 分组拖拽相关
        onDragStartGroup(event, groupId) {
            try {
                if (!event.dataTransfer)
                    return;
                event.dataTransfer.setData('group-id', groupId);
                event.dataTransfer.effectAllowed = 'move';
                const target = event.target;
                target.classList.add('dragging');
                this.dragState = 'group';
                this.dragIndex = this.groups.findIndex((g) => g.id === groupId);
            }
            catch (err) {
                (0, utils_1.handleError)(err, '开始拖拽失败');
            }
        },
        onDragEndGroup(event) {
            try {
                const target = event.target;
                target.classList.remove('dragging');
                this.dragState = '';
                this.dragIndex = -1;
            }
            catch (err) {
                (0, utils_1.handleError)(err, '结束拖拽失败');
            }
        },
        onDragOverGroup(event) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
        },
        onDropGroup(event, targetGroupId) {
            event.preventDefault();
            if (!event.dataTransfer)
                return;
            try {
                const sourceId = event.dataTransfer.getData('group-id');
                if (!sourceId || sourceId === targetGroupId)
                    return;
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
            }
            catch (err) {
                (0, utils_1.handleError)(err, '移动分组失败');
            }
        },
        // 资源拖拽处理
        async onDrop(event) {
            try {
                if (!this.currentGroup) {
                    await Editor.Dialog.warn(Editor.I18n.t('bookmarks.dialog.select_group'));
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                // 获取拖拽的资源 UUID
                const uuids = Editor.Selection.getSelected('asset');
                if (!uuids || uuids.length === 0)
                    return;
                this.isLoading = true;
                await this.addByUuids(uuids);
            }
            catch (err) {
                (0, utils_1.handleError)(err, Editor.I18n.t('bookmarks.dialog.add_failed'));
            }
            finally {
                this.isLoading = false;
            }
        },
        // 数据处理相关
        async addByUuids(uuids) {
            if (!this.currentGroup)
                return;
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
        async getMarkInfoByUUID(uuid) {
            try {
                const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
                if (!assetInfo)
                    return null;
                const iconType = (0, utils_1.getAssetIcon)(assetInfo.file.split('.').pop() || '', assetInfo.type);
                return {
                    id: (0, utils_1.generateId)(),
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
            }
            catch (err) {
                (0, utils_1.handleError)(err, '获取资源信息失败');
                return null;
            }
        },
        // 分组管理相关
        addGroup() {
            if (!this.newGroupName)
                return;
            if (!(0, validation_1.validateGroupName)(this.newGroupName)) {
                Editor.Dialog.warn(Editor.I18n.t('bookmarks.dialog.group_name_invalid'));
                return;
            }
            const group = {
                id: (0, utils_1.generateId)(),
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
        removeGroup(group) {
            var _a;
            const index = this.groups.findIndex((g) => g.id === group.id);
            if (index > -1) {
                this.groups.splice(index, 1);
                if (((_a = this.currentGroup) === null || _a === void 0 ? void 0 : _a.id) === group.id) {
                    this.currentGroup = null;
                }
                this.saveData();
            }
        },
        switchGroup(groupId) {
            this.currentGroup = this.groups.find((g) => g.id === groupId) || null;
        },
        removeBookmark(bookmark) {
            if (!this.currentGroup)
                return;
            const index = this.currentGroup.bookmarkList.findIndex((b) => b.id === bookmark.id);
            if (index > -1) {
                this.currentGroup.bookmarkList.splice(index, 1);
                this.saveData();
            }
        },
        // 数据持久化
        saveData: (0, debounce_1.debounce)(function () {
            try {
                const data = {
                    version: '1.0.0',
                    timestamp: Date.now(),
                    groups: this.groups,
                    currentGroup: this.currentGroup ? this.groups.findIndex((group) => group.id === this.currentGroup.id) : -1
                };
                const savePath = (0, path_1.join)(Editor.Project.path, 'settings/bookmarks.json');
                (0, file_1.writeJsonFile)(savePath, data);
            }
            catch (err) {
                (0, utils_1.handleError)(err, Editor.I18n.t('bookmarks.dialog.save_failed'));
            }
        }, 300),
        async loadData() {
            try {
                const savePath = (0, path_1.join)(Editor.Project.path, 'settings/bookmarks.json');
                const data = (0, file_1.readJsonFile)(savePath);
                if (data) {
                    if (!this.validateGroupData(data)) {
                        throw new Error(Editor.I18n.t('bookmarks.dialog.invalid_data'));
                    }
                    this.groups = data.groups;
                    if (data.currentGroup >= 0 && data.currentGroup < this.groups.length) {
                        this.currentGroup = this.groups[data.currentGroup];
                    }
                }
            }
            catch (err) {
                (0, utils_1.handleError)(err, Editor.I18n.t('bookmarks.dialog.load_failed'));
                this.groups = [];
                this.currentGroup = null;
            }
        },
        async clearAll() {
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
        findGroupById(id) {
            return this.groups.find((group) => group.id === id) || null;
        },
        /**
         * 更新分组顺序
         */
        updateGroupOrder() {
            this.groups.forEach((group, index) => {
                group.order = index;
            });
        },
        /**
         * 验证分组数据
         */
        validateGroupData(data) {
            return data && Array.isArray(data.groups) && data.groups.every((group) => (0, validation_1.isAssetGroup)(group));
        },
        /**
         * 验证书签数据
         */
        isValidBookmark(bookmark) {
            return bookmark && typeof bookmark.id === 'string' && typeof bookmark.name === 'string' && typeof bookmark.uuid === 'string' && typeof bookmark.assetType === 'string';
        },
        // 书签拖拽相关
        onDragStartBookmark(event, bookmark) {
            try {
                if (!event.dataTransfer)
                    return;
                event.dataTransfer.setData('bookmark-id', bookmark.id);
                event.dataTransfer.effectAllowed = 'move';
                const target = event.target;
                target.classList.add('dragging');
                this.isDragging = true;
                this.draggedBookmark = bookmark;
            }
            catch (err) {
                (0, utils_1.handleError)(err, '开始拖拽书签失败');
            }
        },
        onDragEndBookmark(event) {
            try {
                const target = event.target;
                target.classList.remove('dragging');
                this.isDragging = false;
                this.draggedBookmark = null;
            }
            catch (err) {
                (0, utils_1.handleError)(err, '结束拖拽书签失败');
            }
        },
        onDragOverBookmark(event) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
        },
        onDropBookmark(event, targetBookmark) {
            event.preventDefault();
            if (!event.dataTransfer || !this.currentGroup)
                return;
            try {
                const sourceId = event.dataTransfer.getData('bookmark-id');
                if (!sourceId || sourceId === targetBookmark.id)
                    return;
                const sourceIndex = this.currentGroup.bookmarkList.findIndex((b) => b.id === sourceId);
                const targetIndex = this.currentGroup.bookmarkList.findIndex((b) => b.id === targetBookmark.id);
                if (sourceIndex > -1 && targetIndex > -1) {
                    const [movedBookmark] = this.currentGroup.bookmarkList.splice(sourceIndex, 1);
                    this.currentGroup.bookmarkList.splice(targetIndex, 0, movedBookmark);
                    this.saveData();
                }
            }
            catch (err) {
                (0, utils_1.handleError)(err, '移动书签失败');
            }
        },
        // 选择书签
        selectBookmark(bookmark) {
            this.selectedBookmark = bookmark;
        }
    },
    // 生命周期钩子
    mounted() {
        this.loadData();
    }
});
// 存储组件实例的引用
let componentInstance = null;
// 面板定义
module.exports = Editor.Panel.define({
    listeners: {
        show() {
            console.log('show');
            // 每次显示面板时重新加载数据
            if (componentInstance === null || componentInstance === void 0 ? void 0 : componentInstance.loadData) {
                componentInstance.loadData();
            }
        },
        hide() {
            console.log('hide');
        }
    },
    template: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app'
    },
    methods: {},
    ready() {
        var _a;
        if (this.$.app) {
            const app = (0, vue_1.createApp)(BookmarksPanel);
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            componentInstance = app.mount(this.$.app);
            // 初始化时加载数据
            (_a = componentInstance.loadData) === null || _a === void 0 ? void 0 : _a.call(componentInstance);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
            componentInstance = null;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2RlZmF1bHQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBc0Q7QUFDdEQsMkJBQWtDO0FBQ2xDLCtCQUE0QjtBQUM1QixtREFBaUY7QUFFakYsK0NBQW1FO0FBQ25FLDJEQUEwRjtBQUMxRix1REFBb0Q7QUFDcEQscURBQW1GO0FBQ25GLG1DQUFnRTtBQUVoRSxTQUFTO0FBQ1QsTUFBTSxZQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQztBQXNCN0MsWUFBWTtBQUNaLE1BQU0sY0FBYyxHQUFHLElBQUEscUJBQWUsRUFBQztJQUN0QyxJQUFJLEVBQUUsZ0JBQWdCO0lBRXRCLFNBQVM7SUFDVCxVQUFVLEVBQUU7UUFDWCxJQUFJLEVBQUU7WUFDTCxPQUFPLENBQUMsRUFBZSxFQUFFLE9BQTBCO2dCQUNsRCxJQUFJO29CQUNILElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxtQkFBVyxDQUFDLE9BQU8sQ0FBQyxLQUFpQyxDQUFDLEVBQUU7d0JBQzVFLEVBQUUsQ0FBQyxTQUFTLEdBQUcsbUJBQVcsQ0FBQyxPQUFPLENBQUMsS0FBaUMsQ0FBQyxDQUFDO3FCQUN0RTtpQkFDRDtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDOUI7WUFDRixDQUFDO1lBQ0QsT0FBTyxDQUFDLEVBQWUsRUFBRSxPQUEwQjtnQkFDbEQsSUFBSTtvQkFDSCxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksbUJBQVcsQ0FBQyxPQUFPLENBQUMsS0FBaUMsQ0FBQyxFQUFFO3dCQUM1RSxFQUFFLENBQUMsU0FBUyxHQUFHLG1CQUFXLENBQUMsT0FBTyxDQUFDLEtBQWlDLENBQUMsQ0FBQztxQkFDdEU7aUJBQ0Q7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQzlCO1lBQ0YsQ0FBQztTQUNEO0tBQ0Q7SUFFRCx5QkFBeUI7SUFDekIsS0FBSztRQUNKLE9BQU87WUFDTixRQUFRLEVBQVIsb0JBQVEsQ0FBQyxRQUFRO1NBQ2pCLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTztJQUNQLElBQUk7UUFDSCxPQUFPO1lBQ04sV0FBVyxFQUFFLG9CQUFRLENBQUMsTUFBTTtZQUM1QixJQUFJLEVBQUU7Z0JBQ0wsY0FBYyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDO2dCQUMvRCxhQUFhLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUM7YUFDN0Q7WUFDRCxNQUFNLEVBQUUsRUFBRTtZQUNWLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFNBQVMsRUFBRSxFQUFFO1lBQ2IsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNiLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLFlBQVksRUFBRSxFQUFFO1lBQ2hCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFVBQVUsRUFBRSxFQUFFO1lBQ2QsZ0JBQWdCLEVBQUUsSUFBNEI7WUFDOUMsVUFBVSxFQUFFLEtBQUs7WUFDakIsZUFBZSxFQUFFLElBQTRCO1NBQzdDLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTztJQUNQLFFBQVEsRUFBRTtRQUNULFlBQVk7WUFDWCxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUNELG9CQUFvQjtZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUM7WUFFNUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQXVCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDOUgsQ0FBQztRQUNELE9BQU87WUFDTixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFDRCxVQUFVO1lBQ1QsT0FBTyxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQztRQUNuQyxDQUFDO0tBQ0Q7SUFFRCxPQUFPO0lBQ1AsT0FBTyxFQUFFO1FBQ1IsT0FBTztRQUNQLFVBQVUsQ0FBQyxJQUFjO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxPQUFPO1FBQ1AsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFZO1lBQzdCLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsT0FBTztRQUNQLEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBdUI7WUFDNUMsc0JBQXNCO1lBQ3RCLG1FQUFtRTtZQUNuRSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxTQUFTO1FBQ1QsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQXVCO1lBQy9DLFVBQVU7WUFDVixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxTQUFTO1FBQ1QsZ0JBQWdCLENBQUMsS0FBZ0IsRUFBRSxPQUFlO1lBQ2pELElBQUk7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZO29CQUFFLE9BQU87Z0JBQ2hDLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDaEQsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO2dCQUUxQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBcUIsQ0FBQztnQkFDM0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRWpDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO2dCQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO2FBQ2hFO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBQSxtQkFBVyxFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUMzQjtRQUNGLENBQUM7UUFFRCxjQUFjLENBQUMsS0FBZ0I7WUFDOUIsSUFBSTtnQkFDSCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBcUIsQ0FBQztnQkFDM0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3BCO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBQSxtQkFBVyxFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUMzQjtRQUNGLENBQUM7UUFFRCxlQUFlLENBQUMsS0FBZ0I7WUFDL0IsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRTtnQkFDdkIsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO2FBQ3ZDO1FBQ0YsQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFnQixFQUFFLGFBQXFCO1lBQ2xELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVk7Z0JBQUUsT0FBTztZQUVoQyxJQUFJO2dCQUNILE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsS0FBSyxhQUFhO29CQUFFLE9BQU87Z0JBRXBELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUNwRSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxhQUFhLENBQUMsQ0FBQztnQkFFekUsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUN6QyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUUvQyxPQUFPO29CQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO3dCQUNwQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztvQkFDckIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUNoQjthQUNEO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBQSxtQkFBVyxFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUMzQjtRQUNGLENBQUM7UUFFRCxTQUFTO1FBQ1QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFnQjtZQUM1QixJQUFJO2dCQUNILElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUN2QixNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQztvQkFDekUsT0FBTztpQkFDUDtnQkFFRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFFeEIsZUFBZTtnQkFDZixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7b0JBQUUsT0FBTztnQkFFekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3QjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLElBQUEsbUJBQVcsRUFBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDO2FBQy9EO29CQUFTO2dCQUNULElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2FBQ3ZCO1FBQ0YsQ0FBQztRQUVELFNBQVM7UUFDVCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWU7WUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZO2dCQUFFLE9BQU87WUFFL0IsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO29CQUN0RSxTQUFTO2lCQUNUO2dCQUVELElBQUksSUFBSSxLQUFLLGFBQWEsSUFBSSxJQUFJLEtBQUssZUFBZSxFQUFFO29CQUN2RCxTQUFTO2lCQUNUO2dCQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLFFBQVEsRUFBRTtvQkFDYixJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzlDO2FBQ0Q7WUFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFZO1lBQ25DLElBQUk7Z0JBQ0gsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JGLElBQUksQ0FBQyxTQUFTO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUU1QixNQUFNLFFBQVEsR0FBRyxJQUFBLG9CQUFZLEVBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFckYsT0FBTztvQkFDTixFQUFFLEVBQUUsSUFBQSxrQkFBVSxHQUFFO29CQUNoQixJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7b0JBQ3BCLElBQUksRUFBRSxJQUFJO29CQUNWLE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDOUQsTUFBTSxFQUFFLEVBQUU7b0JBQ1YsVUFBVSxFQUFFLEVBQUU7b0JBQ2QsU0FBUyxFQUFFLFFBQVE7b0JBQ25CLFFBQVEsRUFBRSxFQUFFO29CQUNaLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUN0QixVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtpQkFDdEIsQ0FBQzthQUNGO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBQSxtQkFBVyxFQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDN0IsT0FBTyxJQUFJLENBQUM7YUFDWjtRQUNGLENBQUM7UUFFRCxTQUFTO1FBQ1QsUUFBUTtZQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWTtnQkFBRSxPQUFPO1lBRS9CLElBQUksQ0FBQyxJQUFBLDhCQUFpQixFQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDMUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RSxPQUFPO2FBQ1A7WUFFRCxNQUFNLEtBQUssR0FBZTtnQkFDekIsRUFBRSxFQUFFLElBQUEsa0JBQVUsR0FBRTtnQkFDaEIsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUN2QixZQUFZLEVBQUUsRUFBRTtnQkFDaEIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtnQkFDekIsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3RCLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO2FBQ3RCLENBQUM7WUFFRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUM1QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFpQjs7WUFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzlELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFBLE1BQUEsSUFBSSxDQUFDLFlBQVksMENBQUUsRUFBRSxNQUFLLEtBQUssQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2lCQUN6QjtnQkFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDaEI7UUFDRixDQUFDO1FBRUQsV0FBVyxDQUFDLE9BQWU7WUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDdkUsQ0FBQztRQUVELGNBQWMsQ0FBQyxRQUF1QjtZQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsT0FBTztZQUUvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BGLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNoQjtRQUNGLENBQUM7UUFFRCxRQUFRO1FBQ1IsUUFBUSxFQUFFLElBQUEsbUJBQVEsRUFBQztZQUNsQixJQUFJO2dCQUNILE1BQU0sSUFBSSxHQUFrQjtvQkFDM0IsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQWlCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLFlBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN2SCxDQUFDO2dCQUVGLE1BQU0sUUFBUSxHQUFHLElBQUEsV0FBSSxFQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3RFLElBQUEsb0JBQWEsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDOUI7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixJQUFBLG1CQUFXLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQzthQUNoRTtRQUNGLENBQUMsRUFBRSxHQUFHLENBQUM7UUFFUCxLQUFLLENBQUMsUUFBUTtZQUNiLElBQUk7Z0JBQ0gsTUFBTSxRQUFRLEdBQUcsSUFBQSxXQUFJLEVBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUseUJBQXlCLENBQUMsQ0FBQztnQkFDdEUsTUFBTSxJQUFJLEdBQUcsSUFBQSxtQkFBWSxFQUFnQixRQUFRLENBQUMsQ0FBQztnQkFFbkQsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7cUJBQ2hFO29CQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFFMUIsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO3dCQUNyRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO3FCQUNuRDtpQkFDRDthQUNEO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBQSxtQkFBVyxFQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzthQUN6QjtRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBUTtZQUNiLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZ0NBQWdDLENBQUMsRUFBRTtnQkFDeEYsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDO2dCQUNoRCxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQzlGLE9BQU8sRUFBRSxDQUFDO2dCQUNWLE1BQU0sRUFBRSxDQUFDO2FBQ1QsQ0FBQyxDQUFDO1lBRUgsSUFBSSxNQUFNLENBQUMsUUFBUSxLQUFLLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDaEI7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxhQUFhLENBQUMsRUFBVTtZQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDekUsQ0FBQztRQUVEOztXQUVHO1FBQ0gsZ0JBQWdCO1lBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFpQixFQUFFLEtBQWEsRUFBRSxFQUFFO2dCQUN4RCxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7V0FFRztRQUNILGlCQUFpQixDQUFDLElBQVM7WUFDMUIsT0FBTyxJQUFJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLElBQUEseUJBQVksRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFFRDs7V0FFRztRQUNILGVBQWUsQ0FBQyxRQUFhO1lBQzVCLE9BQU8sUUFBUSxJQUFJLE9BQU8sUUFBUSxDQUFDLEVBQUUsS0FBSyxRQUFRLElBQUksT0FBTyxRQUFRLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxPQUFPLFFBQVEsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sUUFBUSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUM7UUFDeEssQ0FBQztRQUVELFNBQVM7UUFDVCxtQkFBbUIsQ0FBQyxLQUFnQixFQUFFLFFBQXVCO1lBQzVELElBQUk7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZO29CQUFFLE9BQU87Z0JBQ2hDLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZELEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztnQkFFMUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQXFCLENBQUM7Z0JBQzNDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUVqQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7YUFDaEM7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixJQUFBLG1CQUFXLEVBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztRQUVELGlCQUFpQixDQUFDLEtBQWdCO1lBQ2pDLElBQUk7Z0JBQ0gsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQXFCLENBQUM7Z0JBQzNDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7YUFDNUI7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixJQUFBLG1CQUFXLEVBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzdCO1FBQ0YsQ0FBQztRQUVELGtCQUFrQixDQUFDLEtBQWdCO1lBQ2xDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QixJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQzthQUN2QztRQUNGLENBQUM7UUFFRCxjQUFjLENBQUMsS0FBZ0IsRUFBRSxjQUE2QjtZQUM3RCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWTtnQkFBRSxPQUFPO1lBRXRELElBQUk7Z0JBQ0gsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxLQUFLLGNBQWMsQ0FBQyxFQUFFO29CQUFFLE9BQU87Z0JBRXhELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsQ0FBQztnQkFDdkYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFaEcsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUN6QyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQ3JFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDaEI7YUFDRDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLElBQUEsbUJBQVcsRUFBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDM0I7UUFDRixDQUFDO1FBRUQsT0FBTztRQUNQLGNBQWMsQ0FBQyxRQUF1QjtZQUNyQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO1FBQ2xDLENBQUM7S0FDRDtJQUVELFNBQVM7SUFDVCxPQUFPO1FBQ04sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FDRCxDQUFDLENBQUM7QUFFSCxZQUFZO0FBQ1osSUFBSSxpQkFBaUIsR0FBUSxJQUFJLENBQUM7QUFFbEMsT0FBTztBQUNQLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDcEMsU0FBUyxFQUFFO1FBQ1YsSUFBSTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEIsZ0JBQWdCO1lBQ2hCLElBQUksaUJBQWlCLGFBQWpCLGlCQUFpQix1QkFBakIsaUJBQWlCLENBQUUsUUFBUSxFQUFFO2dCQUNoQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUM3QjtRQUNGLENBQUM7UUFDRCxJQUFJO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQixDQUFDO0tBQ0Q7SUFDRCxRQUFRLEVBQUUsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSw2Q0FBNkMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUMvRixLQUFLLEVBQUUsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSx5Q0FBeUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUN4RixDQUFDLEVBQUU7UUFDRixHQUFHLEVBQUUsTUFBTTtLQUNYO0lBQ0QsT0FBTyxFQUFFLEVBQUU7SUFDWCxLQUFLOztRQUNKLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUU7WUFDZixNQUFNLEdBQUcsR0FBRyxJQUFBLGVBQVMsRUFBQyxjQUFjLENBQUMsQ0FBQztZQUN0QyxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUUsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLFdBQVc7WUFDWCxNQUFBLGlCQUFpQixDQUFDLFFBQVEsaUVBQUksQ0FBQztZQUMvQixZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM1QjtJQUNGLENBQUM7SUFDRCxXQUFXLEtBQUksQ0FBQztJQUNoQixLQUFLO1FBQ0osTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLEdBQUcsRUFBRTtZQUNSLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNkLGlCQUFpQixHQUFHLElBQUksQ0FBQztTQUN6QjtJQUNGLENBQUM7Q0FDRCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIGNyZWF0ZUFwcCwgZGVmaW5lQ29tcG9uZW50IH0gZnJvbSAndnVlJztcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IFZpZXdUeXBlLCBQYW5lbFR5cGUsIEV2ZW50VHlwZSwgQWN0aW9uVHlwZSB9IGZyb20gJy4uL3NoYXJlZC9jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBBc3NldEdyb3VwLCBOb2RlR3JvdXAsIEFzc2V0Qm9va21hcmssIE5vZGVCb29rbWFyaywgU2F2ZURhdGEsIEFzc2V0U2F2ZURhdGEsIE5vZGVTYXZlRGF0YSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcyc7XHJcbmltcG9ydCB7IHJlYWRKc29uRmlsZSwgd3JpdGVKc29uRmlsZSB9IGZyb20gJy4uL3NoYXJlZC91dGlscy9maWxlJztcclxuaW1wb3J0IHsgdmFsaWRhdGVHcm91cE5hbWUsIGlzQXNzZXRHcm91cCwgaXNOb2RlR3JvdXAgfSBmcm9tICcuLi9zaGFyZWQvdXRpbHMvdmFsaWRhdGlvbic7XHJcbmltcG9ydCB7IGRlYm91bmNlIH0gZnJvbSAnLi4vc2hhcmVkL3V0aWxzL2RlYm91bmNlJztcclxuaW1wb3J0IHsgdHlwZU1hcCwgZXh0TWFwLCBJY29uVHlwZSwgY3VzdG9tSWNvbnMgfSBmcm9tICcuLi9zaGFyZWQvY29uc3RhbnRzL2ljb25zJztcclxuaW1wb3J0IHsgZ2VuZXJhdGVJZCwgaGFuZGxlRXJyb3IsIGdldEFzc2V0SWNvbiB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuLy8g6Z2i5p2/5pWw5o2u5a2Y5YKoXHJcbmNvbnN0IHBhbmVsRGF0YU1hcCA9IG5ldyBXZWFrTWFwPGFueSwgQXBwPigpO1xyXG5cclxuLy8g57uE5Lu254q25oCB5o6l5Y+jXHJcbmludGVyZmFjZSBTdGF0ZSB7XHJcblx0Y3VycmVudFZpZXc6IFZpZXdUeXBlO1xyXG5cdGkxOG46IHtcclxuXHRcdGFzc2V0X2Jvb2ttYXJrOiBzdHJpbmc7XHJcblx0XHRub2RlX2Jvb2ttYXJrOiBzdHJpbmc7XHJcblx0fTtcclxuXHRncm91cHM6IEFzc2V0R3JvdXBbXTtcclxuXHRjdXJyZW50R3JvdXA6IEFzc2V0R3JvdXAgfCBudWxsO1xyXG5cdGRyYWdTdGF0ZTogc3RyaW5nO1xyXG5cdGRyYWdJbmRleDogbnVtYmVyO1xyXG5cdHNob3dHcm91cElucHV0OiBib29sZWFuO1xyXG5cdG5ld0dyb3VwTmFtZTogc3RyaW5nO1xyXG5cdGlzTG9hZGluZzogYm9vbGVhbjtcclxuXHRzZWFyY2hUZXh0OiBzdHJpbmc7XHJcblx0c2VsZWN0ZWRCb29rbWFyazogQXNzZXRCb29rbWFyayB8IG51bGw7XHJcblx0aXNEcmFnZ2luZzogYm9vbGVhbjtcclxuXHRkcmFnZ2VkQm9va21hcms6IEFzc2V0Qm9va21hcmsgfCBudWxsO1xyXG59XHJcblxyXG4vLyDlrprkuYkgVnVlIOe7hOS7tlxyXG5jb25zdCBCb29rbWFya3NQYW5lbCA9IGRlZmluZUNvbXBvbmVudCh7XHJcblx0bmFtZTogJ0Jvb2ttYXJrc1BhbmVsJyxcclxuXHJcblx0Ly8g5L+u5pS55oyH5Luk5a6a5LmJXHJcblx0ZGlyZWN0aXZlczoge1xyXG5cdFx0aWNvbjoge1xyXG5cdFx0XHRtb3VudGVkKGVsOiBIVE1MRWxlbWVudCwgYmluZGluZzogeyB2YWx1ZTogc3RyaW5nIH0pIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0aWYgKGJpbmRpbmcudmFsdWUgJiYgY3VzdG9tSWNvbnNbYmluZGluZy52YWx1ZSBhcyBrZXlvZiB0eXBlb2YgY3VzdG9tSWNvbnNdKSB7XHJcblx0XHRcdFx0XHRcdGVsLmlubmVySFRNTCA9IGN1c3RvbUljb25zW2JpbmRpbmcudmFsdWUgYXMga2V5b2YgdHlwZW9mIGN1c3RvbUljb25zXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ+Wbvuagh+a4suafk+Wksei0pTonLCBlcnIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0dXBkYXRlZChlbDogSFRNTEVsZW1lbnQsIGJpbmRpbmc6IHsgdmFsdWU6IHN0cmluZyB9KSB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdGlmIChiaW5kaW5nLnZhbHVlICYmIGN1c3RvbUljb25zW2JpbmRpbmcudmFsdWUgYXMga2V5b2YgdHlwZW9mIGN1c3RvbUljb25zXSkge1xyXG5cdFx0XHRcdFx0XHRlbC5pbm5lckhUTUwgPSBjdXN0b21JY29uc1tiaW5kaW5nLnZhbHVlIGFzIGtleW9mIHR5cGVvZiBjdXN0b21JY29uc107XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCflm77moIfmm7TmlrDlpLHotKU6JywgZXJyKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyDmt7vliqDov5nkuKrvvIzkvb8gVmlld1R5cGUg5Zyo5qih5p2/5Lit5Y+v55SoXHJcblx0c2V0dXAoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRWaWV3VHlwZSAvLyDmmrTpnLLnu5nmqKHmnb9cclxuXHRcdH07XHJcblx0fSxcclxuXHJcblx0Ly8g57uE5Lu25pWw5o2uXHJcblx0ZGF0YSgpOiBTdGF0ZSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRjdXJyZW50VmlldzogVmlld1R5cGUuQVNTRVRTLFxyXG5cdFx0XHRpMThuOiB7XHJcblx0XHRcdFx0YXNzZXRfYm9va21hcms6IEVkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5wYW5lbC5hc3NldF9ib29rbWFyaycpLFxyXG5cdFx0XHRcdG5vZGVfYm9va21hcms6IEVkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5wYW5lbC5ub2RlX2Jvb2ttYXJrJylcclxuXHRcdFx0fSxcclxuXHRcdFx0Z3JvdXBzOiBbXSxcclxuXHRcdFx0Y3VycmVudEdyb3VwOiBudWxsLFxyXG5cdFx0XHRkcmFnU3RhdGU6ICcnLFxyXG5cdFx0XHRkcmFnSW5kZXg6IC0xLFxyXG5cdFx0XHRzaG93R3JvdXBJbnB1dDogZmFsc2UsXHJcblx0XHRcdG5ld0dyb3VwTmFtZTogJycsXHJcblx0XHRcdGlzTG9hZGluZzogZmFsc2UsXHJcblx0XHRcdHNlYXJjaFRleHQ6ICcnLFxyXG5cdFx0XHRzZWxlY3RlZEJvb2ttYXJrOiBudWxsIGFzIEFzc2V0Qm9va21hcmsgfCBudWxsLFxyXG5cdFx0XHRpc0RyYWdnaW5nOiBmYWxzZSxcclxuXHRcdFx0ZHJhZ2dlZEJvb2ttYXJrOiBudWxsIGFzIEFzc2V0Qm9va21hcmsgfCBudWxsXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdC8vIOiuoeeul+WxnuaAp1xyXG5cdGNvbXB1dGVkOiB7XHJcblx0XHRzb3J0ZWRHcm91cHMoKTogQXNzZXRHcm91cFtdIHtcclxuXHRcdFx0cmV0dXJuIFsuLi50aGlzLmdyb3Vwc10uc29ydCgoYSwgYikgPT4gYS5vcmRlciAtIGIub3JkZXIpO1xyXG5cdFx0fSxcclxuXHRcdGZpbHRlcmVkQm9va21hcmtMaXN0KCk6IEFzc2V0Qm9va21hcmtbXSB7XHJcblx0XHRcdGlmICghdGhpcy5jdXJyZW50R3JvdXApIHJldHVybiBbXTtcclxuXHRcdFx0aWYgKCF0aGlzLnNlYXJjaFRleHQpIHJldHVybiB0aGlzLmN1cnJlbnRHcm91cC5ib29rbWFya0xpc3Q7XHJcblxyXG5cdFx0XHRjb25zdCBzZWFyY2hMb3dlciA9IHRoaXMuc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jdXJyZW50R3JvdXAuYm9va21hcmtMaXN0LmZpbHRlcigoYm9va21hcms6IEFzc2V0Qm9va21hcmspID0+IGJvb2ttYXJrLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikpO1xyXG5cdFx0fSxcclxuXHRcdGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcblx0XHRcdHJldHVybiAhdGhpcy5jdXJyZW50R3JvdXAgfHwgdGhpcy5jdXJyZW50R3JvdXAuYm9va21hcmtMaXN0Lmxlbmd0aCA9PT0gMDtcclxuXHRcdH0sXHJcblx0XHRjYW5PcGVyYXRlKCk6IGJvb2xlYW4ge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jdXJyZW50R3JvdXAgIT09IG51bGw7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Ly8g57uE5Lu25pa55rOVXHJcblx0bWV0aG9kczoge1xyXG5cdFx0Ly8g6KeG5Zu+5YiH5o2iXHJcblx0XHRzd2l0Y2hWaWV3KHZpZXc6IFZpZXdUeXBlKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuY3VycmVudFZpZXcgPSB2aWV3O1xyXG5cdFx0fSxcclxuXHJcblx0XHQvLyDotYTmupDot7PovaxcclxuXHRcdGFzeW5jIGp1bXBUb0Fzc2V0KHV1aWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0XHRhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdvcGVuLWFzc2V0JywgdXVpZCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIOS5puetvueCueWHu1xyXG5cdFx0YXN5bmMgb25Cb29rbWFya0NsaWNrKGJvb2ttYXJrOiBBc3NldEJvb2ttYXJrKTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHRcdC8vIOS9v+eUqCBicm9hZGNhc3Qg5Y+R6YCB6Zeq54OB5raI5oGvXHJcblx0XHRcdC8vIEVkaXRvci5NZXNzYWdlLmJyb2FkY2FzdCgndWkta2l0OnRvdWNoLWFzc2V0JywgW2Jvb2ttYXJrLnV1aWRdKTtcclxuXHRcdFx0RWRpdG9yLk1lc3NhZ2UuYnJvYWRjYXN0KCd0d2lua2xlJywgYm9va21hcmsudXVpZCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIOa3u+WKoOWPjOWHu+WkhOeQhlxyXG5cdFx0YXN5bmMgb25Cb29rbWFya0RibENsaWNrKGJvb2ttYXJrOiBBc3NldEJvb2ttYXJrKTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHRcdC8vIOWPjOWHu+aXtuaJk+W8gOi1hOa6kFxyXG5cdFx0XHRhd2FpdCB0aGlzLmp1bXBUb0Fzc2V0KGJvb2ttYXJrLnV1aWQpO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvLyDliIbnu4Tmi5bmi73nm7jlhbNcclxuXHRcdG9uRHJhZ1N0YXJ0R3JvdXAoZXZlbnQ6IERyYWdFdmVudCwgZ3JvdXBJZDogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0aWYgKCFldmVudC5kYXRhVHJhbnNmZXIpIHJldHVybjtcclxuXHRcdFx0XHRldmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSgnZ3JvdXAtaWQnLCBncm91cElkKTtcclxuXHRcdFx0XHRldmVudC5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcclxuXHJcblx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG5cdFx0XHRcdHRhcmdldC5jbGFzc0xpc3QuYWRkKCdkcmFnZ2luZycpO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRyYWdTdGF0ZSA9ICdncm91cCc7XHJcblx0XHRcdFx0dGhpcy5kcmFnSW5kZXggPSB0aGlzLmdyb3Vwcy5maW5kSW5kZXgoKGcpID0+IGcuaWQgPT09IGdyb3VwSWQpO1xyXG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHRoYW5kbGVFcnJvcihlcnIsICflvIDlp4vmi5bmi73lpLHotKUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHRvbkRyYWdFbmRHcm91cChldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG5cdFx0XHRcdHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnZ2luZycpO1xyXG5cdFx0XHRcdHRoaXMuZHJhZ1N0YXRlID0gJyc7XHJcblx0XHRcdFx0dGhpcy5kcmFnSW5kZXggPSAtMTtcclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0aGFuZGxlRXJyb3IoZXJyLCAn57uT5p2f5ouW5ou95aSx6LSlJyk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0b25EcmFnT3Zlckdyb3VwKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcclxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0aWYgKGV2ZW50LmRhdGFUcmFuc2Zlcikge1xyXG5cdFx0XHRcdGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdG9uRHJvcEdyb3VwKGV2ZW50OiBEcmFnRXZlbnQsIHRhcmdldEdyb3VwSWQ6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRpZiAoIWV2ZW50LmRhdGFUcmFuc2ZlcikgcmV0dXJuO1xyXG5cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb25zdCBzb3VyY2VJZCA9IGV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCdncm91cC1pZCcpO1xyXG5cdFx0XHRcdGlmICghc291cmNlSWQgfHwgc291cmNlSWQgPT09IHRhcmdldEdyb3VwSWQpIHJldHVybjtcclxuXHJcblx0XHRcdFx0Y29uc3Qgc291cmNlSW5kZXggPSB0aGlzLmdyb3Vwcy5maW5kSW5kZXgoKGcpID0+IGcuaWQgPT09IHNvdXJjZUlkKTtcclxuXHRcdFx0XHRjb25zdCB0YXJnZXRJbmRleCA9IHRoaXMuZ3JvdXBzLmZpbmRJbmRleCgoZykgPT4gZy5pZCA9PT0gdGFyZ2V0R3JvdXBJZCk7XHJcblxyXG5cdFx0XHRcdGlmIChzb3VyY2VJbmRleCA+IC0xICYmIHRhcmdldEluZGV4ID4gLTEpIHtcclxuXHRcdFx0XHRcdGNvbnN0IFttb3ZlZEdyb3VwXSA9IHRoaXMuZ3JvdXBzLnNwbGljZShzb3VyY2VJbmRleCwgMSk7XHJcblx0XHRcdFx0XHR0aGlzLmdyb3Vwcy5zcGxpY2UodGFyZ2V0SW5kZXgsIDAsIG1vdmVkR3JvdXApO1xyXG5cclxuXHRcdFx0XHRcdC8vIOabtOaWsOaOkuW6j1xyXG5cdFx0XHRcdFx0dGhpcy5ncm91cHMuZm9yRWFjaCgoZ3JvdXAsIGluZGV4KSA9PiB7XHJcblx0XHRcdFx0XHRcdGdyb3VwLm9yZGVyID0gaW5kZXg7XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLnNhdmVEYXRhKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHRoYW5kbGVFcnJvcihlcnIsICfnp7vliqjliIbnu4TlpLHotKUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyDotYTmupDmi5bmi73lpITnkIZcclxuXHRcdGFzeW5jIG9uRHJvcChldmVudDogRHJhZ0V2ZW50KTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0aWYgKCF0aGlzLmN1cnJlbnRHcm91cCkge1xyXG5cdFx0XHRcdFx0YXdhaXQgRWRpdG9yLkRpYWxvZy53YXJuKEVkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5kaWFsb2cuc2VsZWN0X2dyb3VwJykpO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcblx0XHRcdFx0Ly8g6I635Y+W5ouW5ou955qE6LWE5rqQIFVVSURcclxuXHRcdFx0XHRjb25zdCB1dWlkcyA9IEVkaXRvci5TZWxlY3Rpb24uZ2V0U2VsZWN0ZWQoJ2Fzc2V0Jyk7XHJcblx0XHRcdFx0aWYgKCF1dWlkcyB8fCB1dWlkcy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcblx0XHRcdFx0dGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdGF3YWl0IHRoaXMuYWRkQnlVdWlkcyh1dWlkcyk7XHJcblx0XHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRcdGhhbmRsZUVycm9yKGVyciwgRWRpdG9yLkkxOG4udCgnYm9va21hcmtzLmRpYWxvZy5hZGRfZmFpbGVkJykpO1xyXG5cdFx0XHR9IGZpbmFsbHkge1xyXG5cdFx0XHRcdHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8g5pWw5o2u5aSE55CG55u45YWzXHJcblx0XHRhc3luYyBhZGRCeVV1aWRzKHV1aWRzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0XHRpZiAoIXRoaXMuY3VycmVudEdyb3VwKSByZXR1cm47XHJcblxyXG5cdFx0XHRmb3IgKGNvbnN0IHV1aWQgb2YgdXVpZHMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5jdXJyZW50R3JvdXAuYm9va21hcmtMaXN0LnNvbWUoKGl0ZW0pID0+IGl0ZW0udXVpZCA9PT0gdXVpZCkpIHtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKHV1aWQgPT09ICdkYjovL2Fzc2V0cycgfHwgdXVpZCA9PT0gJ2RiOi8vaW50ZXJuYWwnKSB7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGNvbnN0IG1hcmtJbmZvID0gYXdhaXQgdGhpcy5nZXRNYXJrSW5mb0J5VVVJRCh1dWlkKTtcclxuXHRcdFx0XHRpZiAobWFya0luZm8pIHtcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudEdyb3VwLmJvb2ttYXJrTGlzdC5wdXNoKG1hcmtJbmZvKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5zYXZlRGF0YSgpO1xyXG5cdFx0fSxcclxuXHJcblx0XHRhc3luYyBnZXRNYXJrSW5mb0J5VVVJRCh1dWlkOiBzdHJpbmcpOiBQcm9taXNlPEFzc2V0Qm9va21hcmsgfCBudWxsPiB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0Y29uc3QgYXNzZXRJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHV1aWQpO1xyXG5cdFx0XHRcdGlmICghYXNzZXRJbmZvKSByZXR1cm4gbnVsbDtcclxuXHJcblx0XHRcdFx0Y29uc3QgaWNvblR5cGUgPSBnZXRBc3NldEljb24oYXNzZXRJbmZvLmZpbGUuc3BsaXQoJy4nKS5wb3AoKSB8fCAnJywgYXNzZXRJbmZvLnR5cGUpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0aWQ6IGdlbmVyYXRlSWQoKSxcclxuXHRcdFx0XHRcdG5hbWU6IGFzc2V0SW5mby5uYW1lLFxyXG5cdFx0XHRcdFx0dXVpZDogdXVpZCxcclxuXHRcdFx0XHRcdGV4dG5hbWU6IGFzc2V0SW5mby5maWxlLnNsaWNlKGFzc2V0SW5mby5maWxlLmxhc3RJbmRleE9mKCcuJykpLFxyXG5cdFx0XHRcdFx0YmFzZTY0OiAnJyxcclxuXHRcdFx0XHRcdGFkZGl0aW9uYWw6IFtdLFxyXG5cdFx0XHRcdFx0YXNzZXRUeXBlOiBpY29uVHlwZSxcclxuXHRcdFx0XHRcdGljb25IdG1sOiAnJyxcclxuXHRcdFx0XHRcdGNyZWF0ZVRpbWU6IERhdGUubm93KCksXHJcblx0XHRcdFx0XHR1cGRhdGVUaW1lOiBEYXRlLm5vdygpXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0aGFuZGxlRXJyb3IoZXJyLCAn6I635Y+W6LWE5rqQ5L+h5oGv5aSx6LSlJyk7XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8g5YiG57uE566h55CG55u45YWzXHJcblx0XHRhZGRHcm91cCgpOiB2b2lkIHtcclxuXHRcdFx0aWYgKCF0aGlzLm5ld0dyb3VwTmFtZSkgcmV0dXJuO1xyXG5cclxuXHRcdFx0aWYgKCF2YWxpZGF0ZUdyb3VwTmFtZSh0aGlzLm5ld0dyb3VwTmFtZSkpIHtcclxuXHRcdFx0XHRFZGl0b3IuRGlhbG9nLndhcm4oRWRpdG9yLkkxOG4udCgnYm9va21hcmtzLmRpYWxvZy5ncm91cF9uYW1lX2ludmFsaWQnKSk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zdCBncm91cDogQXNzZXRHcm91cCA9IHtcclxuXHRcdFx0XHRpZDogZ2VuZXJhdGVJZCgpLFxyXG5cdFx0XHRcdG5hbWU6IHRoaXMubmV3R3JvdXBOYW1lLFxyXG5cdFx0XHRcdGJvb2ttYXJrTGlzdDogW10sXHJcblx0XHRcdFx0b3JkZXI6IHRoaXMuZ3JvdXBzLmxlbmd0aCxcclxuXHRcdFx0XHRjcmVhdGVUaW1lOiBEYXRlLm5vdygpLFxyXG5cdFx0XHRcdHVwZGF0ZVRpbWU6IERhdGUubm93KClcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHRoaXMuZ3JvdXBzLnB1c2goZ3JvdXApO1xyXG5cdFx0XHR0aGlzLm5ld0dyb3VwTmFtZSA9ICcnO1xyXG5cdFx0XHR0aGlzLnNob3dHcm91cElucHV0ID0gZmFsc2U7XHJcblx0XHRcdHRoaXMuc2F2ZURhdGEoKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0cmVtb3ZlR3JvdXAoZ3JvdXA6IEFzc2V0R3JvdXApOiB2b2lkIHtcclxuXHRcdFx0Y29uc3QgaW5kZXggPSB0aGlzLmdyb3Vwcy5maW5kSW5kZXgoKGcpID0+IGcuaWQgPT09IGdyb3VwLmlkKTtcclxuXHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0XHR0aGlzLmdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0XHRcdGlmICh0aGlzLmN1cnJlbnRHcm91cD8uaWQgPT09IGdyb3VwLmlkKSB7XHJcblx0XHRcdFx0XHR0aGlzLmN1cnJlbnRHcm91cCA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuc2F2ZURhdGEoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHRzd2l0Y2hHcm91cChncm91cElkOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5jdXJyZW50R3JvdXAgPSB0aGlzLmdyb3Vwcy5maW5kKChnKSA9PiBnLmlkID09PSBncm91cElkKSB8fCBudWxsO1xyXG5cdFx0fSxcclxuXHJcblx0XHRyZW1vdmVCb29rbWFyayhib29rbWFyazogQXNzZXRCb29rbWFyayk6IHZvaWQge1xyXG5cdFx0XHRpZiAoIXRoaXMuY3VycmVudEdyb3VwKSByZXR1cm47XHJcblxyXG5cdFx0XHRjb25zdCBpbmRleCA9IHRoaXMuY3VycmVudEdyb3VwLmJvb2ttYXJrTGlzdC5maW5kSW5kZXgoKGIpID0+IGIuaWQgPT09IGJvb2ttYXJrLmlkKTtcclxuXHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0XHR0aGlzLmN1cnJlbnRHcm91cC5ib29rbWFya0xpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdFx0XHR0aGlzLnNhdmVEYXRhKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8g5pWw5o2u5oyB5LmF5YyWXHJcblx0XHRzYXZlRGF0YTogZGVib3VuY2UoZnVuY3Rpb24gKHRoaXM6IGFueSk6IHZvaWQge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGNvbnN0IGRhdGE6IEFzc2V0U2F2ZURhdGEgPSB7XHJcblx0XHRcdFx0XHR2ZXJzaW9uOiAnMS4wLjAnLFxyXG5cdFx0XHRcdFx0dGltZXN0YW1wOiBEYXRlLm5vdygpLFxyXG5cdFx0XHRcdFx0Z3JvdXBzOiB0aGlzLmdyb3VwcyxcclxuXHRcdFx0XHRcdGN1cnJlbnRHcm91cDogdGhpcy5jdXJyZW50R3JvdXAgPyB0aGlzLmdyb3Vwcy5maW5kSW5kZXgoKGdyb3VwOiBBc3NldEdyb3VwKSA9PiBncm91cC5pZCA9PT0gdGhpcy5jdXJyZW50R3JvdXAhLmlkKSA6IC0xXHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0Y29uc3Qgc2F2ZVBhdGggPSBqb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdzZXR0aW5ncy9ib29rbWFya3MuanNvbicpO1xyXG5cdFx0XHRcdHdyaXRlSnNvbkZpbGUoc2F2ZVBhdGgsIGRhdGEpO1xyXG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHRoYW5kbGVFcnJvcihlcnIsIEVkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5kaWFsb2cuc2F2ZV9mYWlsZWQnKSk7XHJcblx0XHRcdH1cclxuXHRcdH0sIDMwMCksXHJcblxyXG5cdFx0YXN5bmMgbG9hZERhdGEoKTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0Y29uc3Qgc2F2ZVBhdGggPSBqb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdzZXR0aW5ncy9ib29rbWFya3MuanNvbicpO1xyXG5cdFx0XHRcdGNvbnN0IGRhdGEgPSByZWFkSnNvbkZpbGU8QXNzZXRTYXZlRGF0YT4oc2F2ZVBhdGgpO1xyXG5cclxuXHRcdFx0XHRpZiAoZGF0YSkge1xyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLnZhbGlkYXRlR3JvdXBEYXRhKGRhdGEpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihFZGl0b3IuSTE4bi50KCdib29rbWFya3MuZGlhbG9nLmludmFsaWRfZGF0YScpKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aGlzLmdyb3VwcyA9IGRhdGEuZ3JvdXBzO1xyXG5cclxuXHRcdFx0XHRcdGlmIChkYXRhLmN1cnJlbnRHcm91cCA+PSAwICYmIGRhdGEuY3VycmVudEdyb3VwIDwgdGhpcy5ncm91cHMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuY3VycmVudEdyb3VwID0gdGhpcy5ncm91cHNbZGF0YS5jdXJyZW50R3JvdXBdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0aGFuZGxlRXJyb3IoZXJyLCBFZGl0b3IuSTE4bi50KCdib29rbWFya3MuZGlhbG9nLmxvYWRfZmFpbGVkJykpO1xyXG5cdFx0XHRcdHRoaXMuZ3JvdXBzID0gW107XHJcblx0XHRcdFx0dGhpcy5jdXJyZW50R3JvdXAgPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuRGlhbG9nLmluZm8oRWRpdG9yLkkxOG4udCgnYm9va21hcmtzLmRpYWxvZy5jbGVhcl9jb25maXJtJyksIHtcclxuXHRcdFx0XHR0aXRsZTogRWRpdG9yLkkxOG4udCgnYm9va21hcmtzLmRpYWxvZy5jb25maXJtJyksXHJcblx0XHRcdFx0YnV0dG9uczogW0VkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5kaWFsb2cuY29uZmlybScpLCBFZGl0b3IuSTE4bi50KCdib29rbWFya3MuZGlhbG9nLmNhbmNlbCcpXSxcclxuXHRcdFx0XHRkZWZhdWx0OiAwLFxyXG5cdFx0XHRcdGNhbmNlbDogMVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGlmIChyZXN1bHQucmVzcG9uc2UgPT09IDApIHtcclxuXHRcdFx0XHR0aGlzLmdyb3VwcyA9IFtdO1xyXG5cdFx0XHRcdHRoaXMuY3VycmVudEdyb3VwID0gbnVsbDtcclxuXHRcdFx0XHR0aGlzLnNhdmVEYXRhKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiDmn6Xmib7liIbnu4RcclxuXHRcdCAqL1xyXG5cdFx0ZmluZEdyb3VwQnlJZChpZDogc3RyaW5nKTogQXNzZXRHcm91cCB8IG51bGwge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5ncm91cHMuZmluZCgoZ3JvdXA6IEFzc2V0R3JvdXApID0+IGdyb3VwLmlkID09PSBpZCkgfHwgbnVsbDtcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiDmm7TmlrDliIbnu4Tpobrluo9cclxuXHRcdCAqL1xyXG5cdFx0dXBkYXRlR3JvdXBPcmRlcigpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5ncm91cHMuZm9yRWFjaCgoZ3JvdXA6IEFzc2V0R3JvdXAsIGluZGV4OiBudW1iZXIpID0+IHtcclxuXHRcdFx0XHRncm91cC5vcmRlciA9IGluZGV4O1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiDpqozor4HliIbnu4TmlbDmja5cclxuXHRcdCAqL1xyXG5cdFx0dmFsaWRhdGVHcm91cERhdGEoZGF0YTogYW55KTogYm9vbGVhbiB7XHJcblx0XHRcdHJldHVybiBkYXRhICYmIEFycmF5LmlzQXJyYXkoZGF0YS5ncm91cHMpICYmIGRhdGEuZ3JvdXBzLmV2ZXJ5KChncm91cDogYW55KSA9PiBpc0Fzc2V0R3JvdXAoZ3JvdXApKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiDpqozor4Hkuabnrb7mlbDmja5cclxuXHRcdCAqL1xyXG5cdFx0aXNWYWxpZEJvb2ttYXJrKGJvb2ttYXJrOiBhbnkpOiBib29rbWFyayBpcyBBc3NldEJvb2ttYXJrIHtcclxuXHRcdFx0cmV0dXJuIGJvb2ttYXJrICYmIHR5cGVvZiBib29rbWFyay5pZCA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGJvb2ttYXJrLm5hbWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBib29rbWFyay51dWlkID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYm9va21hcmsuYXNzZXRUeXBlID09PSAnc3RyaW5nJztcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8g5Lmm562+5ouW5ou955u45YWzXHJcblx0XHRvbkRyYWdTdGFydEJvb2ttYXJrKGV2ZW50OiBEcmFnRXZlbnQsIGJvb2ttYXJrOiBBc3NldEJvb2ttYXJrKTogdm9pZCB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0aWYgKCFldmVudC5kYXRhVHJhbnNmZXIpIHJldHVybjtcclxuXHRcdFx0XHRldmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSgnYm9va21hcmstaWQnLCBib29rbWFyay5pZCk7XHJcblx0XHRcdFx0ZXZlbnQuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XHJcblxyXG5cdFx0XHRcdGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcclxuXHRcdFx0XHR0YXJnZXQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcclxuXHJcblx0XHRcdFx0dGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHR0aGlzLmRyYWdnZWRCb29rbWFyayA9IGJvb2ttYXJrO1xyXG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHRoYW5kbGVFcnJvcihlcnIsICflvIDlp4vmi5bmi73kuabnrb7lpLHotKUnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHRvbkRyYWdFbmRCb29rbWFyayhldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG5cdFx0XHRcdHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnZ2luZycpO1xyXG5cdFx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuZHJhZ2dlZEJvb2ttYXJrID0gbnVsbDtcclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0aGFuZGxlRXJyb3IoZXJyLCAn57uT5p2f5ouW5ou95Lmm562+5aSx6LSlJyk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0b25EcmFnT3ZlckJvb2ttYXJrKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcclxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0aWYgKGV2ZW50LmRhdGFUcmFuc2Zlcikge1xyXG5cdFx0XHRcdGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdG9uRHJvcEJvb2ttYXJrKGV2ZW50OiBEcmFnRXZlbnQsIHRhcmdldEJvb2ttYXJrOiBBc3NldEJvb2ttYXJrKTogdm9pZCB7XHJcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGlmICghZXZlbnQuZGF0YVRyYW5zZmVyIHx8ICF0aGlzLmN1cnJlbnRHcm91cCkgcmV0dXJuO1xyXG5cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb25zdCBzb3VyY2VJZCA9IGV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCdib29rbWFyay1pZCcpO1xyXG5cdFx0XHRcdGlmICghc291cmNlSWQgfHwgc291cmNlSWQgPT09IHRhcmdldEJvb2ttYXJrLmlkKSByZXR1cm47XHJcblxyXG5cdFx0XHRcdGNvbnN0IHNvdXJjZUluZGV4ID0gdGhpcy5jdXJyZW50R3JvdXAuYm9va21hcmtMaXN0LmZpbmRJbmRleCgoYikgPT4gYi5pZCA9PT0gc291cmNlSWQpO1xyXG5cdFx0XHRcdGNvbnN0IHRhcmdldEluZGV4ID0gdGhpcy5jdXJyZW50R3JvdXAuYm9va21hcmtMaXN0LmZpbmRJbmRleCgoYikgPT4gYi5pZCA9PT0gdGFyZ2V0Qm9va21hcmsuaWQpO1xyXG5cclxuXHRcdFx0XHRpZiAoc291cmNlSW5kZXggPiAtMSAmJiB0YXJnZXRJbmRleCA+IC0xKSB7XHJcblx0XHRcdFx0XHRjb25zdCBbbW92ZWRCb29rbWFya10gPSB0aGlzLmN1cnJlbnRHcm91cC5ib29rbWFya0xpc3Quc3BsaWNlKHNvdXJjZUluZGV4LCAxKTtcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudEdyb3VwLmJvb2ttYXJrTGlzdC5zcGxpY2UodGFyZ2V0SW5kZXgsIDAsIG1vdmVkQm9va21hcmspO1xyXG5cdFx0XHRcdFx0dGhpcy5zYXZlRGF0YSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0aGFuZGxlRXJyb3IoZXJyLCAn56e75Yqo5Lmm562+5aSx6LSlJyk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8g6YCJ5oup5Lmm562+XHJcblx0XHRzZWxlY3RCb29rbWFyayhib29rbWFyazogQXNzZXRCb29rbWFyayk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLnNlbGVjdGVkQm9va21hcmsgPSBib29rbWFyaztcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyDnlJ/lkb3lkajmnJ/pkqnlrZBcclxuXHRtb3VudGVkKCkge1xyXG5cdFx0dGhpcy5sb2FkRGF0YSgpO1xyXG5cdH1cclxufSk7XHJcblxyXG4vLyDlrZjlgqjnu4Tku7blrp7kvovnmoTlvJXnlKhcclxubGV0IGNvbXBvbmVudEluc3RhbmNlOiBhbnkgPSBudWxsO1xyXG5cclxuLy8g6Z2i5p2/5a6a5LmJXHJcbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yLlBhbmVsLmRlZmluZSh7XHJcblx0bGlzdGVuZXJzOiB7XHJcblx0XHRzaG93KCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnc2hvdycpO1xyXG5cdFx0XHQvLyDmr4/mrKHmmL7npLrpnaLmnb/ml7bph43mlrDliqDovb3mlbDmja5cclxuXHRcdFx0aWYgKGNvbXBvbmVudEluc3RhbmNlPy5sb2FkRGF0YSkge1xyXG5cdFx0XHRcdGNvbXBvbmVudEluc3RhbmNlLmxvYWREYXRhKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHRoaWRlKCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnaGlkZScpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0dGVtcGxhdGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy90ZW1wbGF0ZS9kZWZhdWx0L2luZGV4Lmh0bWwnKSwgJ3V0Zi04JyksXHJcblx0c3R5bGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy9zdHlsZS9kZWZhdWx0L2luZGV4LmNzcycpLCAndXRmLTgnKSxcclxuXHQkOiB7XHJcblx0XHRhcHA6ICcjYXBwJ1xyXG5cdH0sXHJcblx0bWV0aG9kczoge30sXHJcblx0cmVhZHkoKSB7XHJcblx0XHRpZiAodGhpcy4kLmFwcCkge1xyXG5cdFx0XHRjb25zdCBhcHAgPSBjcmVhdGVBcHAoQm9va21hcmtzUGFuZWwpO1xyXG5cdFx0XHRhcHAuY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5pc0N1c3RvbUVsZW1lbnQgPSAodGFnKSA9PiB0YWcuc3RhcnRzV2l0aCgndWktJyk7XHJcblx0XHRcdGNvbXBvbmVudEluc3RhbmNlID0gYXBwLm1vdW50KHRoaXMuJC5hcHApO1xyXG5cdFx0XHQvLyDliJ3lp4vljJbml7bliqDovb3mlbDmja5cclxuXHRcdFx0Y29tcG9uZW50SW5zdGFuY2UubG9hZERhdGE/LigpO1xyXG5cdFx0XHRwYW5lbERhdGFNYXAuc2V0KHRoaXMsIGFwcCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHRiZWZvcmVDbG9zZSgpIHt9LFxyXG5cdGNsb3NlKCkge1xyXG5cdFx0Y29uc3QgYXBwID0gcGFuZWxEYXRhTWFwLmdldCh0aGlzKTtcclxuXHRcdGlmIChhcHApIHtcclxuXHRcdFx0YXBwLnVubW91bnQoKTtcclxuXHRcdFx0Y29tcG9uZW50SW5zdGFuY2UgPSBudWxsO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcbiJdfQ==