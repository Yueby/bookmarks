"use strict";
module.exports = {
    open_panel: "书签管理",
    send_to_panel: "打开书签管理面板",
    description: "书签管理扩展 - 帮助管理和快速定位项目资源与节点",
    panel: {
        asset_bookmark: "资源书签",
        node_bookmark: "节点书签",
        group: {
            new: "新建分组",
            delete: "删除分组",
            empty: "暂无分组",
            drag_tip: "拖拽到此处"
        },
        bookmark: {
            delete: "删除书签",
            empty: "暂无书签",
            drag_tip: "拖拽资源到此处"
        }
    },
    dialog: {
        confirm: "确认",
        cancel: "取消",
        clear_confirm: "是否清空所有书签数据？",
        group_name_invalid: "分组名称不能为空且长度不能超过20个字符",
        save_failed: "保存数据失败",
        load_failed: "加载数据失败",
        add_failed: "添加书签失败",
        select_group: "请先选择一个分组"
    }
};