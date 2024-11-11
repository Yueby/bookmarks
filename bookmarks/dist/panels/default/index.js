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
            Editor.Message.broadcast('ui-kit:touch-asset', [bookmark.uuid]);
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
                this.dragIndex = this.groups.findIndex(g => g.id === groupId);
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
                const sourceIndex = this.groups.findIndex(g => g.id === sourceId);
                const targetIndex = this.groups.findIndex(g => g.id === targetGroupId);
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
                const sourceIndex = this.currentGroup.bookmarkList.findIndex(b => b.id === sourceId);
                const targetIndex = this.currentGroup.bookmarkList.findIndex(b => b.id === targetBookmark.id);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2RlZmF1bHQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBc0Q7QUFDdEQsMkJBQWtDO0FBQ2xDLCtCQUE0QjtBQUM1QixtREFBaUY7QUFFakYsK0NBQW1FO0FBQ25FLDJEQUEwRjtBQUMxRix1REFBb0Q7QUFDcEQscURBQW1GO0FBQ25GLG1DQUFnRTtBQUVoRSxTQUFTO0FBQ1QsTUFBTSxZQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQztBQXNCN0MsWUFBWTtBQUNaLE1BQU0sY0FBYyxHQUFHLElBQUEscUJBQWUsRUFBQztJQUN0QyxJQUFJLEVBQUUsZ0JBQWdCO0lBRXRCLFNBQVM7SUFDVCxVQUFVLEVBQUU7UUFDWCxJQUFJLEVBQUU7WUFDTCxPQUFPLENBQUMsRUFBZSxFQUFFLE9BQTBCO2dCQUNsRCxJQUFJO29CQUNILElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxtQkFBVyxDQUFDLE9BQU8sQ0FBQyxLQUFpQyxDQUFDLEVBQUU7d0JBQzVFLEVBQUUsQ0FBQyxTQUFTLEdBQUcsbUJBQVcsQ0FBQyxPQUFPLENBQUMsS0FBaUMsQ0FBQyxDQUFDO3FCQUN0RTtpQkFDRDtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDOUI7WUFDRixDQUFDO1lBQ0QsT0FBTyxDQUFDLEVBQWUsRUFBRSxPQUEwQjtnQkFDbEQsSUFBSTtvQkFDSCxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksbUJBQVcsQ0FBQyxPQUFPLENBQUMsS0FBaUMsQ0FBQyxFQUFFO3dCQUM1RSxFQUFFLENBQUMsU0FBUyxHQUFHLG1CQUFXLENBQUMsT0FBTyxDQUFDLEtBQWlDLENBQUMsQ0FBQztxQkFDdEU7aUJBQ0Q7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ2IsT0FB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QUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxXQUFXO1lBQ1gsTUFBQSxpQkFBaUIsQ0FBQyxRQUFRLGlFQUFJLENBQUM7WUFDL0IsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDNUI7SUFDRixDQUFDO0lBQ0QsV0FBVyxLQUFJLENBQUM7SUFDaEIsS0FBSztRQUNKLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxHQUFHLEVBQUU7WUFDUixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZCxpQkFBaUIsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDRixDQUFDO0NBQ0QsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCBjcmVhdGVBcHAsIGRlZmluZUNvbXBvbmVudCB9IGZyb20gJ3Z1ZSc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBWaWV3VHlwZSwgUGFuZWxUeXBlLCBFdmVudFR5cGUsIEFjdGlvblR5cGUgfSBmcm9tICcuLi9zaGFyZWQvY29uc3RhbnRzJztcbmltcG9ydCB7IEFzc2V0R3JvdXAsIE5vZGVHcm91cCwgQXNzZXRCb29rbWFyaywgTm9kZUJvb2ttYXJrLCBTYXZlRGF0YSwgQXNzZXRTYXZlRGF0YSwgTm9kZVNhdmVEYXRhIH0gZnJvbSAnLi4vc2hhcmVkL3R5cGVzJztcbmltcG9ydCB7IHJlYWRKc29uRmlsZSwgd3JpdGVKc29uRmlsZSB9IGZyb20gJy4uL3NoYXJlZC91dGlscy9maWxlJztcbmltcG9ydCB7IHZhbGlkYXRlR3JvdXBOYW1lLCBpc0Fzc2V0R3JvdXAsIGlzTm9kZUdyb3VwIH0gZnJvbSAnLi4vc2hhcmVkL3V0aWxzL3ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgZGVib3VuY2UgfSBmcm9tICcuLi9zaGFyZWQvdXRpbHMvZGVib3VuY2UnO1xuaW1wb3J0IHsgdHlwZU1hcCwgZXh0TWFwLCBJY29uVHlwZSwgY3VzdG9tSWNvbnMgfSBmcm9tICcuLi9zaGFyZWQvY29uc3RhbnRzL2ljb25zJztcbmltcG9ydCB7IGdlbmVyYXRlSWQsIGhhbmRsZUVycm9yLCBnZXRBc3NldEljb24gfSBmcm9tICcuL3V0aWxzJztcblxuLy8g6Z2i5p2/5pWw5o2u5a2Y5YKoXG5jb25zdCBwYW5lbERhdGFNYXAgPSBuZXcgV2Vha01hcDxhbnksIEFwcD4oKTtcblxuLy8g57uE5Lu254q25oCB5o6l5Y+jXG5pbnRlcmZhY2UgU3RhdGUge1xuXHRjdXJyZW50VmlldzogVmlld1R5cGU7XG5cdGkxOG46IHtcblx0XHRhc3NldF9ib29rbWFyazogc3RyaW5nO1xuXHRcdG5vZGVfYm9va21hcms6IHN0cmluZztcblx0fTtcblx0Z3JvdXBzOiBBc3NldEdyb3VwW107XG5cdGN1cnJlbnRHcm91cDogQXNzZXRHcm91cCB8IG51bGw7XG5cdGRyYWdTdGF0ZTogc3RyaW5nO1xuXHRkcmFnSW5kZXg6IG51bWJlcjtcblx0c2hvd0dyb3VwSW5wdXQ6IGJvb2xlYW47XG5cdG5ld0dyb3VwTmFtZTogc3RyaW5nO1xuXHRpc0xvYWRpbmc6IGJvb2xlYW47XG5cdHNlYXJjaFRleHQ6IHN0cmluZztcblx0c2VsZWN0ZWRCb29rbWFyazogQXNzZXRCb29rbWFyayB8IG51bGw7XG5cdGlzRHJhZ2dpbmc6IGJvb2xlYW47XG5cdGRyYWdnZWRCb29rbWFyazogQXNzZXRCb29rbWFyayB8IG51bGw7XG59XG5cbi8vIOWumuS5iSBWdWUg57uE5Lu2XG5jb25zdCBCb29rbWFya3NQYW5lbCA9IGRlZmluZUNvbXBvbmVudCh7XG5cdG5hbWU6ICdCb29rbWFya3NQYW5lbCcsXG5cblx0Ly8g5L+u5pS55oyH5Luk5a6a5LmJXG5cdGRpcmVjdGl2ZXM6IHtcblx0XHRpY29uOiB7XG5cdFx0XHRtb3VudGVkKGVsOiBIVE1MRWxlbWVudCwgYmluZGluZzogeyB2YWx1ZTogc3RyaW5nIH0pIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRpZiAoYmluZGluZy52YWx1ZSAmJiBjdXN0b21JY29uc1tiaW5kaW5nLnZhbHVlIGFzIGtleW9mIHR5cGVvZiBjdXN0b21JY29uc10pIHtcblx0XHRcdFx0XHRcdGVsLmlubmVySFRNTCA9IGN1c3RvbUljb25zW2JpbmRpbmcudmFsdWUgYXMga2V5b2YgdHlwZW9mIGN1c3RvbUljb25zXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ+Wbvuagh+a4suafk+Wksei0pTonLCBlcnIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0dXBkYXRlZChlbDogSFRNTEVsZW1lbnQsIGJpbmRpbmc6IHsgdmFsdWU6IHN0cmluZyB9KSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0aWYgKGJpbmRpbmcudmFsdWUgJiYgY3VzdG9tSWNvbnNbYmluZGluZy52YWx1ZSBhcyBrZXlvZiB0eXBlb2YgY3VzdG9tSWNvbnNdKSB7XG5cdFx0XHRcdFx0XHRlbC5pbm5lckhUTUwgPSBjdXN0b21JY29uc1tiaW5kaW5nLnZhbHVlIGFzIGtleW9mIHR5cGVvZiBjdXN0b21JY29uc107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCflm77moIfmm7TmlrDlpLHotKU6JywgZXJyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvLyDmt7vliqDov5nkuKrvvIzkvb8gVmlld1R5cGUg5Zyo5qih5p2/5Lit5Y+v55SoXG5cdHNldHVwKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRWaWV3VHlwZSAvLyDmmrTpnLLnu5nmqKHmnb9cblx0XHR9O1xuXHR9LFxuXG5cdC8vIOe7hOS7tuaVsOaNrlxuXHRkYXRhKCk6IFN0YXRlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y3VycmVudFZpZXc6IFZpZXdUeXBlLkFTU0VUUyxcblx0XHRcdGkxOG46IHtcblx0XHRcdFx0YXNzZXRfYm9va21hcms6IEVkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5wYW5lbC5hc3NldF9ib29rbWFyaycpLFxuXHRcdFx0XHRub2RlX2Jvb2ttYXJrOiBFZGl0b3IuSTE4bi50KCdib29rbWFya3MucGFuZWwubm9kZV9ib29rbWFyaycpXG5cdFx0XHR9LFxuXHRcdFx0Z3JvdXBzOiBbXSxcblx0XHRcdGN1cnJlbnRHcm91cDogbnVsbCxcblx0XHRcdGRyYWdTdGF0ZTogJycsXG5cdFx0XHRkcmFnSW5kZXg6IC0xLFxuXHRcdFx0c2hvd0dyb3VwSW5wdXQ6IGZhbHNlLFxuXHRcdFx0bmV3R3JvdXBOYW1lOiAnJyxcblx0XHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0XHRzZWFyY2hUZXh0OiAnJyxcblx0XHRcdHNlbGVjdGVkQm9va21hcms6IG51bGwgYXMgQXNzZXRCb29rbWFyayB8IG51bGwsXG5cdFx0XHRpc0RyYWdnaW5nOiBmYWxzZSxcblx0XHRcdGRyYWdnZWRCb29rbWFyazogbnVsbCBhcyBBc3NldEJvb2ttYXJrIHwgbnVsbFxuXHRcdH07XG5cdH0sXG5cblx0Ly8g6K6h566X5bGe5oCnXG5cdGNvbXB1dGVkOiB7XG5cdFx0c29ydGVkR3JvdXBzKCk6IEFzc2V0R3JvdXBbXSB7XG5cdFx0XHRyZXR1cm4gWy4uLnRoaXMuZ3JvdXBzXS5zb3J0KChhLCBiKSA9PiBhLm9yZGVyIC0gYi5vcmRlcik7XG5cdFx0fSxcblx0XHRmaWx0ZXJlZEJvb2ttYXJrTGlzdCgpOiBBc3NldEJvb2ttYXJrW10ge1xuXHRcdFx0aWYgKCF0aGlzLmN1cnJlbnRHcm91cCkgcmV0dXJuIFtdO1xuXHRcdFx0aWYgKCF0aGlzLnNlYXJjaFRleHQpIHJldHVybiB0aGlzLmN1cnJlbnRHcm91cC5ib29rbWFya0xpc3Q7XG5cblx0XHRcdGNvbnN0IHNlYXJjaExvd2VyID0gdGhpcy5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRyZXR1cm4gdGhpcy5jdXJyZW50R3JvdXAuYm9va21hcmtMaXN0LmZpbHRlcigoYm9va21hcms6IEFzc2V0Qm9va21hcmspID0+IGJvb2ttYXJrLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikpO1xuXHRcdH0sXG5cdFx0aXNFbXB0eSgpOiBib29sZWFuIHtcblx0XHRcdHJldHVybiAhdGhpcy5jdXJyZW50R3JvdXAgfHwgdGhpcy5jdXJyZW50R3JvdXAuYm9va21hcmtMaXN0Lmxlbmd0aCA9PT0gMDtcblx0XHR9LFxuXHRcdGNhbk9wZXJhdGUoKTogYm9vbGVhbiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jdXJyZW50R3JvdXAgIT09IG51bGw7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIOe7hOS7tuaWueazlVxuXHRtZXRob2RzOiB7XG5cdFx0Ly8g6KeG5Zu+5YiH5o2iXG5cdFx0c3dpdGNoVmlldyh2aWV3OiBWaWV3VHlwZSk6IHZvaWQge1xuXHRcdFx0dGhpcy5jdXJyZW50VmlldyA9IHZpZXc7XG5cdFx0fSxcblxuXHRcdC8vIOi1hOa6kOi3s+i9rFxuXHRcdGFzeW5jIGp1bXBUb0Fzc2V0KHV1aWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdFx0YXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnb3Blbi1hc3NldCcsIHV1aWQpO1xuXHRcdH0sXG5cblx0XHQvLyDkuabnrb7ngrnlh7tcblx0XHRhc3luYyBvbkJvb2ttYXJrQ2xpY2soYm9va21hcms6IEFzc2V0Qm9va21hcmspOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRcdC8vIOS9v+eUqCBicm9hZGNhc3Qg5Y+R6YCB6Zeq54OB5raI5oGvXG5cdFx0XHRFZGl0b3IuTWVzc2FnZS5icm9hZGNhc3QoJ3VpLWtpdDp0b3VjaC1hc3NldCcsIFtib29rbWFyay51dWlkXSk7XG5cdFx0fSxcblxuXHRcdC8vIOa3u+WKoOWPjOWHu+WkhOeQhlxuXHRcdGFzeW5jIG9uQm9va21hcmtEYmxDbGljayhib29rbWFyazogQXNzZXRCb29rbWFyayk6IFByb21pc2U8dm9pZD4ge1xuXHRcdFx0Ly8g5Y+M5Ye75pe25omT5byA6LWE5rqQXG5cdFx0XHRhd2FpdCB0aGlzLmp1bXBUb0Fzc2V0KGJvb2ttYXJrLnV1aWQpO1xuXHRcdH0sXG5cblx0XHQvLyDliIbnu4Tmi5bmi73nm7jlhbNcblx0XHRvbkRyYWdTdGFydEdyb3VwKGV2ZW50OiBEcmFnRXZlbnQsIGdyb3VwSWQ6IHN0cmluZyk6IHZvaWQge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKCFldmVudC5kYXRhVHJhbnNmZXIpIHJldHVybjtcblx0XHRcdFx0ZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ2dyb3VwLWlkJywgZ3JvdXBJZCk7XG5cdFx0XHRcdGV2ZW50LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0XHR0YXJnZXQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMuZHJhZ1N0YXRlID0gJ2dyb3VwJztcblx0XHRcdFx0dGhpcy5kcmFnSW5kZXggPSB0aGlzLmdyb3Vwcy5maW5kSW5kZXgoZyA9PiBnLmlkID09PSBncm91cElkKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRoYW5kbGVFcnJvcihlcnIsICflvIDlp4vmi5bmi73lpLHotKUnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25EcmFnRW5kR3JvdXAoZXZlbnQ6IERyYWdFdmVudCk6IHZvaWQge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0XHR0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ2dpbmcnKTtcblx0XHRcdFx0dGhpcy5kcmFnU3RhdGUgPSAnJztcblx0XHRcdFx0dGhpcy5kcmFnSW5kZXggPSAtMTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRoYW5kbGVFcnJvcihlcnIsICfnu5PmnZ/mi5bmi73lpLHotKUnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25EcmFnT3Zlckdyb3VwKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiAoZXZlbnQuZGF0YVRyYW5zZmVyKSB7XG5cdFx0XHRcdGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvbkRyb3BHcm91cChldmVudDogRHJhZ0V2ZW50LCB0YXJnZXRHcm91cElkOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiAoIWV2ZW50LmRhdGFUcmFuc2ZlcikgcmV0dXJuO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBzb3VyY2VJZCA9IGV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCdncm91cC1pZCcpO1xuXHRcdFx0XHRpZiAoIXNvdXJjZUlkIHx8IHNvdXJjZUlkID09PSB0YXJnZXRHcm91cElkKSByZXR1cm47XG5cblx0XHRcdFx0Y29uc3Qgc291cmNlSW5kZXggPSB0aGlzLmdyb3Vwcy5maW5kSW5kZXgoZyA9PiBnLmlkID09PSBzb3VyY2VJZCk7XG5cdFx0XHRcdGNvbnN0IHRhcmdldEluZGV4ID0gdGhpcy5ncm91cHMuZmluZEluZGV4KGcgPT4gZy5pZCA9PT0gdGFyZ2V0R3JvdXBJZCk7XG5cblx0XHRcdFx0aWYgKHNvdXJjZUluZGV4ID4gLTEgJiYgdGFyZ2V0SW5kZXggPiAtMSkge1xuXHRcdFx0XHRcdGNvbnN0IFttb3ZlZEdyb3VwXSA9IHRoaXMuZ3JvdXBzLnNwbGljZShzb3VyY2VJbmRleCwgMSk7XG5cdFx0XHRcdFx0dGhpcy5ncm91cHMuc3BsaWNlKHRhcmdldEluZGV4LCAwLCBtb3ZlZEdyb3VwKTtcblxuXHRcdFx0XHRcdC8vIOabtOaWsOaOkuW6j1xuXHRcdFx0XHRcdHRoaXMuZ3JvdXBzLmZvckVhY2goKGdyb3VwLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRcdFx0Z3JvdXAub3JkZXIgPSBpbmRleDtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHRoaXMuc2F2ZURhdGEoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGhhbmRsZUVycm9yKGVyciwgJ+enu+WKqOWIhue7hOWksei0pScpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyDotYTmupDmi5bmi73lpITnkIZcblx0XHRhc3luYyBvbkRyb3AoZXZlbnQ6IERyYWdFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKCF0aGlzLmN1cnJlbnRHcm91cCkge1xuXHRcdFx0XHRcdGF3YWl0IEVkaXRvci5EaWFsb2cud2FybihFZGl0b3IuSTE4bi50KCdib29rbWFya3MuZGlhbG9nLnNlbGVjdF9ncm91cCcpKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0XHQvLyDojrflj5bmi5bmi73nmoTotYTmupAgVVVJRFxuXHRcdFx0XHRjb25zdCB1dWlkcyA9IEVkaXRvci5TZWxlY3Rpb24uZ2V0U2VsZWN0ZWQoJ2Fzc2V0Jyk7XG5cdFx0XHRcdGlmICghdXVpZHMgfHwgdXVpZHMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cblx0XHRcdFx0dGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuXHRcdFx0XHRhd2FpdCB0aGlzLmFkZEJ5VXVpZHModXVpZHMpO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGhhbmRsZUVycm9yKGVyciwgRWRpdG9yLkkxOG4udCgnYm9va21hcmtzLmRpYWxvZy5hZGRfZmFpbGVkJykpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0dGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8g5pWw5o2u5aSE55CG55u45YWzXG5cdFx0YXN5bmMgYWRkQnlVdWlkcyh1dWlkczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRcdGlmICghdGhpcy5jdXJyZW50R3JvdXApIHJldHVybjtcblxuXHRcdFx0Zm9yIChjb25zdCB1dWlkIG9mIHV1aWRzKSB7XG5cdFx0XHRcdGlmICh0aGlzLmN1cnJlbnRHcm91cC5ib29rbWFya0xpc3Quc29tZSgoaXRlbSkgPT4gaXRlbS51dWlkID09PSB1dWlkKSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHV1aWQgPT09ICdkYjovL2Fzc2V0cycgfHwgdXVpZCA9PT0gJ2RiOi8vaW50ZXJuYWwnKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBtYXJrSW5mbyA9IGF3YWl0IHRoaXMuZ2V0TWFya0luZm9CeVVVSUQodXVpZCk7XG5cdFx0XHRcdGlmIChtYXJrSW5mbykge1xuXHRcdFx0XHRcdHRoaXMuY3VycmVudEdyb3VwLmJvb2ttYXJrTGlzdC5wdXNoKG1hcmtJbmZvKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5zYXZlRGF0YSgpO1xuXHRcdH0sXG5cblx0XHRhc3luYyBnZXRNYXJrSW5mb0J5VVVJRCh1dWlkOiBzdHJpbmcpOiBQcm9taXNlPEFzc2V0Qm9va21hcmsgfCBudWxsPiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBhc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgdXVpZCk7XG5cdFx0XHRcdGlmICghYXNzZXRJbmZvKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCBpY29uVHlwZSA9IGdldEFzc2V0SWNvbihhc3NldEluZm8uZmlsZS5zcGxpdCgnLicpLnBvcCgpIHx8ICcnLCBhc3NldEluZm8udHlwZSk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRpZDogZ2VuZXJhdGVJZCgpLFxuXHRcdFx0XHRcdG5hbWU6IGFzc2V0SW5mby5uYW1lLFxuXHRcdFx0XHRcdHV1aWQ6IHV1aWQsXG5cdFx0XHRcdFx0ZXh0bmFtZTogYXNzZXRJbmZvLmZpbGUuc2xpY2UoYXNzZXRJbmZvLmZpbGUubGFzdEluZGV4T2YoJy4nKSksXG5cdFx0XHRcdFx0YmFzZTY0OiAnJyxcblx0XHRcdFx0XHRhZGRpdGlvbmFsOiBbXSxcblx0XHRcdFx0XHRhc3NldFR5cGU6IGljb25UeXBlLFxuXHRcdFx0XHRcdGljb25IdG1sOiAnJyxcblx0XHRcdFx0XHRjcmVhdGVUaW1lOiBEYXRlLm5vdygpLFxuXHRcdFx0XHRcdHVwZGF0ZVRpbWU6IERhdGUubm93KClcblx0XHRcdFx0fTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRoYW5kbGVFcnJvcihlcnIsICfojrflj5botYTmupDkv6Hmga/lpLHotKUnKTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vIOWIhue7hOeuoeeQhuebuOWFs1xuXHRcdGFkZEdyb3VwKCk6IHZvaWQge1xuXHRcdFx0aWYgKCF0aGlzLm5ld0dyb3VwTmFtZSkgcmV0dXJuO1xuXG5cdFx0XHRpZiAoIXZhbGlkYXRlR3JvdXBOYW1lKHRoaXMubmV3R3JvdXBOYW1lKSkge1xuXHRcdFx0XHRFZGl0b3IuRGlhbG9nLndhcm4oRWRpdG9yLkkxOG4udCgnYm9va21hcmtzLmRpYWxvZy5ncm91cF9uYW1lX2ludmFsaWQnKSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZ3JvdXA6IEFzc2V0R3JvdXAgPSB7XG5cdFx0XHRcdGlkOiBnZW5lcmF0ZUlkKCksXG5cdFx0XHRcdG5hbWU6IHRoaXMubmV3R3JvdXBOYW1lLFxuXHRcdFx0XHRib29rbWFya0xpc3Q6IFtdLFxuXHRcdFx0XHRvcmRlcjogdGhpcy5ncm91cHMubGVuZ3RoLFxuXHRcdFx0XHRjcmVhdGVUaW1lOiBEYXRlLm5vdygpLFxuXHRcdFx0XHR1cGRhdGVUaW1lOiBEYXRlLm5vdygpXG5cdFx0XHR9O1xuXG5cdFx0XHR0aGlzLmdyb3Vwcy5wdXNoKGdyb3VwKTtcblx0XHRcdHRoaXMubmV3R3JvdXBOYW1lID0gJyc7XG5cdFx0XHR0aGlzLnNob3dHcm91cElucHV0ID0gZmFsc2U7XG5cdFx0XHR0aGlzLnNhdmVEYXRhKCk7XG5cdFx0fSxcblxuXHRcdHJlbW92ZUdyb3VwKGdyb3VwOiBBc3NldEdyb3VwKTogdm9pZCB7XG5cdFx0XHRjb25zdCBpbmRleCA9IHRoaXMuZ3JvdXBzLmZpbmRJbmRleCgoZykgPT4gZy5pZCA9PT0gZ3JvdXAuaWQpO1xuXHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0dGhpcy5ncm91cHMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdFx0aWYgKHRoaXMuY3VycmVudEdyb3VwPy5pZCA9PT0gZ3JvdXAuaWQpIHtcblx0XHRcdFx0XHR0aGlzLmN1cnJlbnRHcm91cCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zYXZlRGF0YSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzd2l0Y2hHcm91cChncm91cElkOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRcdHRoaXMuY3VycmVudEdyb3VwID0gdGhpcy5ncm91cHMuZmluZCgoZykgPT4gZy5pZCA9PT0gZ3JvdXBJZCkgfHwgbnVsbDtcblx0XHR9LFxuXG5cdFx0cmVtb3ZlQm9va21hcmsoYm9va21hcms6IEFzc2V0Qm9va21hcmspOiB2b2lkIHtcblx0XHRcdGlmICghdGhpcy5jdXJyZW50R3JvdXApIHJldHVybjtcblxuXHRcdFx0Y29uc3QgaW5kZXggPSB0aGlzLmN1cnJlbnRHcm91cC5ib29rbWFya0xpc3QuZmluZEluZGV4KChiKSA9PiBiLmlkID09PSBib29rbWFyay5pZCk7XG5cdFx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRHcm91cC5ib29rbWFya0xpc3Quc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdFx0dGhpcy5zYXZlRGF0YSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyDmlbDmja7mjIHkuYXljJZcblx0XHRzYXZlRGF0YTogZGVib3VuY2UoZnVuY3Rpb24gKHRoaXM6IGFueSk6IHZvaWQge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgZGF0YTogQXNzZXRTYXZlRGF0YSA9IHtcblx0XHRcdFx0XHR2ZXJzaW9uOiAnMS4wLjAnLFxuXHRcdFx0XHRcdHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcblx0XHRcdFx0XHRncm91cHM6IHRoaXMuZ3JvdXBzLFxuXHRcdFx0XHRcdGN1cnJlbnRHcm91cDogdGhpcy5jdXJyZW50R3JvdXAgPyB0aGlzLmdyb3Vwcy5maW5kSW5kZXgoKGdyb3VwOiBBc3NldEdyb3VwKSA9PiBncm91cC5pZCA9PT0gdGhpcy5jdXJyZW50R3JvdXAhLmlkKSA6IC0xXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29uc3Qgc2F2ZVBhdGggPSBqb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdzZXR0aW5ncy9ib29rbWFya3MuanNvbicpO1xuXHRcdFx0XHR3cml0ZUpzb25GaWxlKHNhdmVQYXRoLCBkYXRhKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRoYW5kbGVFcnJvcihlcnIsIEVkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5kaWFsb2cuc2F2ZV9mYWlsZWQnKSk7XG5cdFx0XHR9XG5cdFx0fSwgMzAwKSxcblxuXHRcdGFzeW5jIGxvYWREYXRhKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgc2F2ZVBhdGggPSBqb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdzZXR0aW5ncy9ib29rbWFya3MuanNvbicpO1xuXHRcdFx0XHRjb25zdCBkYXRhID0gcmVhZEpzb25GaWxlPEFzc2V0U2F2ZURhdGE+KHNhdmVQYXRoKTtcblxuXHRcdFx0XHRpZiAoZGF0YSkge1xuXHRcdFx0XHRcdGlmICghdGhpcy52YWxpZGF0ZUdyb3VwRGF0YShkYXRhKSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKEVkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5kaWFsb2cuaW52YWxpZF9kYXRhJykpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMuZ3JvdXBzID0gZGF0YS5ncm91cHM7XG5cblx0XHRcdFx0XHRpZiAoZGF0YS5jdXJyZW50R3JvdXAgPj0gMCAmJiBkYXRhLmN1cnJlbnRHcm91cCA8IHRoaXMuZ3JvdXBzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJyZW50R3JvdXAgPSB0aGlzLmdyb3Vwc1tkYXRhLmN1cnJlbnRHcm91cF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0aGFuZGxlRXJyb3IoZXJyLCBFZGl0b3IuSTE4bi50KCdib29rbWFya3MuZGlhbG9nLmxvYWRfZmFpbGVkJykpO1xuXHRcdFx0XHR0aGlzLmdyb3VwcyA9IFtdO1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRHcm91cCA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLkRpYWxvZy5pbmZvKEVkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5kaWFsb2cuY2xlYXJfY29uZmlybScpLCB7XG5cdFx0XHRcdHRpdGxlOiBFZGl0b3IuSTE4bi50KCdib29rbWFya3MuZGlhbG9nLmNvbmZpcm0nKSxcblx0XHRcdFx0YnV0dG9uczogW0VkaXRvci5JMThuLnQoJ2Jvb2ttYXJrcy5kaWFsb2cuY29uZmlybScpLCBFZGl0b3IuSTE4bi50KCdib29rbWFya3MuZGlhbG9nLmNhbmNlbCcpXSxcblx0XHRcdFx0ZGVmYXVsdDogMCxcblx0XHRcdFx0Y2FuY2VsOiAxXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHJlc3VsdC5yZXNwb25zZSA9PT0gMCkge1xuXHRcdFx0XHR0aGlzLmdyb3VwcyA9IFtdO1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRHcm91cCA9IG51bGw7XG5cdFx0XHRcdHRoaXMuc2F2ZURhdGEoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICog5p+l5om+5YiG57uEXG5cdFx0ICovXG5cdFx0ZmluZEdyb3VwQnlJZChpZDogc3RyaW5nKTogQXNzZXRHcm91cCB8IG51bGwge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ3JvdXBzLmZpbmQoKGdyb3VwOiBBc3NldEdyb3VwKSA9PiBncm91cC5pZCA9PT0gaWQpIHx8IG51bGw7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIOabtOaWsOWIhue7hOmhuuW6j1xuXHRcdCAqL1xuXHRcdHVwZGF0ZUdyb3VwT3JkZXIoKTogdm9pZCB7XG5cdFx0XHR0aGlzLmdyb3Vwcy5mb3JFYWNoKChncm91cDogQXNzZXRHcm91cCwgaW5kZXg6IG51bWJlcikgPT4ge1xuXHRcdFx0XHRncm91cC5vcmRlciA9IGluZGV4O1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIOmqjOivgeWIhue7hOaVsOaNrlxuXHRcdCAqL1xuXHRcdHZhbGlkYXRlR3JvdXBEYXRhKGRhdGE6IGFueSk6IGJvb2xlYW4ge1xuXHRcdFx0cmV0dXJuIGRhdGEgJiYgQXJyYXkuaXNBcnJheShkYXRhLmdyb3VwcykgJiYgZGF0YS5ncm91cHMuZXZlcnkoKGdyb3VwOiBhbnkpID0+IGlzQXNzZXRHcm91cChncm91cCkpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiDpqozor4Hkuabnrb7mlbDmja5cblx0XHQgKi9cblx0XHRpc1ZhbGlkQm9va21hcmsoYm9va21hcms6IGFueSk6IGJvb2ttYXJrIGlzIEFzc2V0Qm9va21hcmsge1xuXHRcdFx0cmV0dXJuIGJvb2ttYXJrICYmIHR5cGVvZiBib29rbWFyay5pZCA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGJvb2ttYXJrLm5hbWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBib29rbWFyay51dWlkID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYm9va21hcmsuYXNzZXRUeXBlID09PSAnc3RyaW5nJztcblx0XHR9LFxuXG5cdFx0Ly8g5Lmm562+5ouW5ou955u45YWzXG5cdFx0b25EcmFnU3RhcnRCb29rbWFyayhldmVudDogRHJhZ0V2ZW50LCBib29rbWFyazogQXNzZXRCb29rbWFyayk6IHZvaWQge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKCFldmVudC5kYXRhVHJhbnNmZXIpIHJldHVybjtcblx0XHRcdFx0ZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ2Jvb2ttYXJrLWlkJywgYm9va21hcmsuaWQpO1xuXHRcdFx0XHRldmVudC5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcblx0XHRcdFx0XG5cdFx0XHRcdGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblx0XHRcdFx0dGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmRyYWdnZWRCb29rbWFyayA9IGJvb2ttYXJrO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGhhbmRsZUVycm9yKGVyciwgJ+W8gOWni+aLluaLveS5puetvuWksei0pScpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvbkRyYWdFbmRCb29rbWFyayhldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRcdHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnZ2luZycpO1xuXHRcdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5kcmFnZ2VkQm9va21hcmsgPSBudWxsO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGhhbmRsZUVycm9yKGVyciwgJ+e7k+adn+aLluaLveS5puetvuWksei0pScpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvbkRyYWdPdmVyQm9va21hcmsoZXZlbnQ6IERyYWdFdmVudCk6IHZvaWQge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGlmIChldmVudC5kYXRhVHJhbnNmZXIpIHtcblx0XHRcdFx0ZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSc7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uRHJvcEJvb2ttYXJrKGV2ZW50OiBEcmFnRXZlbnQsIHRhcmdldEJvb2ttYXJrOiBBc3NldEJvb2ttYXJrKTogdm9pZCB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKCFldmVudC5kYXRhVHJhbnNmZXIgfHwgIXRoaXMuY3VycmVudEdyb3VwKSByZXR1cm47XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IHNvdXJjZUlkID0gZXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Jvb2ttYXJrLWlkJyk7XG5cdFx0XHRcdGlmICghc291cmNlSWQgfHwgc291cmNlSWQgPT09IHRhcmdldEJvb2ttYXJrLmlkKSByZXR1cm47XG5cblx0XHRcdFx0Y29uc3Qgc291cmNlSW5kZXggPSB0aGlzLmN1cnJlbnRHcm91cC5ib29rbWFya0xpc3QuZmluZEluZGV4KGIgPT4gYi5pZCA9PT0gc291cmNlSWQpO1xuXHRcdFx0XHRjb25zdCB0YXJnZXRJbmRleCA9IHRoaXMuY3VycmVudEdyb3VwLmJvb2ttYXJrTGlzdC5maW5kSW5kZXgoYiA9PiBiLmlkID09PSB0YXJnZXRCb29rbWFyay5pZCk7XG5cblx0XHRcdFx0aWYgKHNvdXJjZUluZGV4ID4gLTEgJiYgdGFyZ2V0SW5kZXggPiAtMSkge1xuXHRcdFx0XHRcdGNvbnN0IFttb3ZlZEJvb2ttYXJrXSA9IHRoaXMuY3VycmVudEdyb3VwLmJvb2ttYXJrTGlzdC5zcGxpY2Uoc291cmNlSW5kZXgsIDEpO1xuXHRcdFx0XHRcdHRoaXMuY3VycmVudEdyb3VwLmJvb2ttYXJrTGlzdC5zcGxpY2UodGFyZ2V0SW5kZXgsIDAsIG1vdmVkQm9va21hcmspO1xuXHRcdFx0XHRcdHRoaXMuc2F2ZURhdGEoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGhhbmRsZUVycm9yKGVyciwgJ+enu+WKqOS5puetvuWksei0pScpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyDpgInmi6nkuabnrb5cblx0XHRzZWxlY3RCb29rbWFyayhib29rbWFyazogQXNzZXRCb29rbWFyayk6IHZvaWQge1xuXHRcdFx0dGhpcy5zZWxlY3RlZEJvb2ttYXJrID0gYm9va21hcms7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIOeUn+WRveWRqOacn+mSqeWtkFxuXHRtb3VudGVkKCkge1xuXHRcdHRoaXMubG9hZERhdGEoKTtcblx0fVxufSk7XG5cbi8vIOWtmOWCqOe7hOS7tuWunuS+i+eahOW8leeUqFxubGV0IGNvbXBvbmVudEluc3RhbmNlOiBhbnkgPSBudWxsO1xuXG4vLyDpnaLmnb/lrprkuYlcbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yLlBhbmVsLmRlZmluZSh7XG5cdGxpc3RlbmVyczoge1xuXHRcdHNob3coKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnc2hvdycpO1xuXHRcdFx0Ly8g5q+P5qyh5pi+56S66Z2i5p2/5pe26YeN5paw5Yqg6L295pWw5o2uXG5cdFx0XHRpZiAoY29tcG9uZW50SW5zdGFuY2U/LmxvYWREYXRhKSB7XG5cdFx0XHRcdGNvbXBvbmVudEluc3RhbmNlLmxvYWREYXRhKCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRoaWRlKCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ2hpZGUnKTtcblx0XHR9XG5cdH0sXG5cdHRlbXBsYXRlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvdGVtcGxhdGUvZGVmYXVsdC9pbmRleC5odG1sJyksICd1dGYtOCcpLFxuXHRzdHlsZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3N0eWxlL2RlZmF1bHQvaW5kZXguY3NzJyksICd1dGYtOCcpLFxuXHQkOiB7XG5cdFx0YXBwOiAnI2FwcCdcblx0fSxcblx0bWV0aG9kczoge30sXG5cdHJlYWR5KCkge1xuXHRcdGlmICh0aGlzLiQuYXBwKSB7XG5cdFx0XHRjb25zdCBhcHAgPSBjcmVhdGVBcHAoQm9va21hcmtzUGFuZWwpO1xuXHRcdFx0YXBwLmNvbmZpZy5jb21waWxlck9wdGlvbnMuaXNDdXN0b21FbGVtZW50ID0gKHRhZykgPT4gdGFnLnN0YXJ0c1dpdGgoJ3VpLScpO1xuXHRcdFx0Y29tcG9uZW50SW5zdGFuY2UgPSBhcHAubW91bnQodGhpcy4kLmFwcCk7XG5cdFx0XHQvLyDliJ3lp4vljJbml7bliqDovb3mlbDmja5cblx0XHRcdGNvbXBvbmVudEluc3RhbmNlLmxvYWREYXRhPy4oKTtcblx0XHRcdHBhbmVsRGF0YU1hcC5zZXQodGhpcywgYXBwKTtcblx0XHR9XG5cdH0sXG5cdGJlZm9yZUNsb3NlKCkge30sXG5cdGNsb3NlKCkge1xuXHRcdGNvbnN0IGFwcCA9IHBhbmVsRGF0YU1hcC5nZXQodGhpcyk7XG5cdFx0aWYgKGFwcCkge1xuXHRcdFx0YXBwLnVubW91bnQoKTtcblx0XHRcdGNvbXBvbmVudEluc3RhbmNlID0gbnVsbDtcblx0XHR9XG5cdH1cbn0pO1xuIl19