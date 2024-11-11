import { defineComponent } from 'vue';
import { generateId, handleError } from '../../utils';
import { validateGroupName } from '../../utils/validation';
import { AssetGroup, NodeGroup } from '../../types';

/**
 * 分组管理器组件
 */
export default defineComponent({
    name: 'GroupManager',
    props: {
        groups: {
            type: Array as () => (AssetGroup | NodeGroup)[],
            required: true
        },
        currentGroup: {
            type: Object as () => AssetGroup | NodeGroup | null,
            default: null
        }
    },
    emits: ['update:groups', 'update:currentGroup'],
    data() {
        return {
            showInput: false,
            newGroupName: '',
            dragState: '',
            dragIndex: -1
        };
    },
    computed: {
        sortedGroups(): (AssetGroup | NodeGroup)[] {
            return [...this.groups].sort((a, b) => a.order - b.order);
        }
    },
    methods: {
        /**
         * 添加分组
         */
        addGroup() {
            if (!this.newGroupName) return;

            if (!validateGroupName(this.newGroupName)) {
                Editor.Dialog.warn('分组名称不能为空且长度不能超过20个字符');
                return;
            }

            const group = {
                id: generateId(),
                name: this.newGroupName,
                bookmarkList: [],
                order: this.groups.length,
                createTime: Date.now(),
                updateTime: Date.now()
            };

            const newGroups = [...this.groups, group];
            this.$emit('update:groups', newGroups);
            this.newGroupName = '';
            this.showInput = false;
        },

        /**
         * 删除分组
         */
        removeGroup(group: AssetGroup | NodeGroup) {
            const newGroups = this.groups.filter(g => g.id !== group.id);
            this.$emit('update:groups', newGroups);
            if (this.currentGroup?.id === group.id) {
                this.$emit('update:currentGroup', null);
            }
        },

        /**
         * 切换分组
         */
        switchGroup(group: AssetGroup | NodeGroup) {
            this.$emit('update:currentGroup', group);
        },

        /**
         * 开始拖拽分组
         */
        dragStartGroup(event: DragEvent, group: AssetGroup | NodeGroup) {
            if (!event.dataTransfer) return;

            event.dataTransfer.setData('group-id', group.id);
            event.dataTransfer.effectAllowed = 'move';

            const target = event.target as HTMLElement;
            target.classList.add('dragging');

            this.dragState = 'group';
            this.dragIndex = this.groups.findIndex(g => g.id === group.id);
        },

        /**
         * 拖拽结束
         */
        dragEndGroup(event: DragEvent) {
            const target = event.target as HTMLElement;
            target.classList.remove('dragging');
            this.dragState = '';
            this.dragIndex = -1;
        },

        /**
         * 处理拖拽放置
         */
        async dropGroup(event: DragEvent, targetGroup: AssetGroup | NodeGroup) {
            event.preventDefault();
            if (!event.dataTransfer) return;

            try {
                const sourceId = event.dataTransfer.getData('group-id');
                if (!sourceId || sourceId === targetGroup.id) return;

                const sourceIndex = this.groups.findIndex(g => g.id === sourceId);
                const targetIndex = this.groups.findIndex(g => g.id === targetGroup.id);

                if (sourceIndex > -1 && targetIndex > -1) {
                    const newGroups = [...this.groups];
                    const [movedGroup] = newGroups.splice(sourceIndex, 1);
                    newGroups.splice(targetIndex, 0, movedGroup);

                    // 更新排序
                    newGroups.forEach((group, index) => {
                        group.order = index;
                    });

                    this.$emit('update:groups', newGroups);
                }
            } catch (err) {
                handleError(err, '移动分组失败');
            }
        }
    }
}); 