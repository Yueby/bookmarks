/**
 * 版本号
 */
export const VERSION = '1.0.0';

/**
 * 面板类型
 */
export enum PanelType {
	ASSET = 'asset-bookmark',
	NODE = 'node-bookmark'
}

/**
 * 视图类型
 */
export enum ViewType {
	ASSETS = 'assets',
	NODES = 'nodes'
}

/**
 * 排序方式
 */
export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc'
}

/**
 * 事件类型
 */
export enum EventType {
	ASSET_CHANGE = 'asset-change',
	NODE_CHANGE = 'node-change',
	GROUP_CHANGE = 'group-change',
	BOOKMARK_CHANGE = 'bookmark-change'
}

/**
 * 操作类型
 */
export enum ActionType {
	ADD = 'add',
	REMOVE = 'remove',
	UPDATE = 'update'
}

/**
 * 默认颜色列表
 */
export const DEFAULT_COLORS = [
	'#4a9eff',
	'#ff4a4a',
	'#4aff4a',
	'#ffd74a',
	'#ff4af5',
	'#4affd7',
	'#d74aff',
	'#4ad7ff'
] as const;

/**
 * 延迟时间
 */
export const DEBOUNCE_DELAY = 300;

/**
 * 动画时间
 */
export const ANIMATION_DURATION = 200;
