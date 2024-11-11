import { AssetGroup, NodeGroup, AssetBookmark, NodeBookmark, AdditionalItem } from './common';

/**
 * 拖拽事件
 */
export interface CustomDragEvent extends Event {
    dataTransfer: DataTransfer;
    target: HTMLElement;
}

/**
 * 资源变更事件
 */
export interface AssetChangeEvent {
    target: {
        value: string;
    };
}

/**
 * 分组变更事件
 */
export interface GroupChangeEvent<T extends AssetGroup | NodeGroup> {
    type: 'add' | 'remove' | 'update';
    group: T;
}

/**
 * 书签变更事件
 */
export interface BookmarkChangeEvent<T> {
    type: 'add' | 'remove' | 'update';
    item: T;
    groupId: string;
}

/**
 * 拖拽信息
 */
export interface DragInfo {
    type: string;
    additional: AdditionalItem[];
}

/**
 * 编辑器消息事件
 */
export interface EditorMessageEvent {
    type: string;
    data: any;
}

/**
 * 面板事件
 */
export interface PanelEvent {
    type: 'show' | 'hide' | 'ready' | 'close';
    panel: string;
} 