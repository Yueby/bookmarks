import { AdditionalItem, AssetGroup, AssetBookmark, NodeGroup, NodeBookmark,  SortOrder, Optional } from '../shared/types';
import { extMap, typeMap, IconType } from '../shared/constants/icons';

export function debounce(fn: Function, delay: number) {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return function (this: any, ...args: any[]) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(this, args);
			timer = null;
		}, delay);
	};
}

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function handleError(error: any, message: string) {
	console.error(message, error);
	Editor.Dialog.error('错误', {
		detail: message + '\n' + (error.message || error)
	});
}

export function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleString();
}

export function validateGroupName(name: string): boolean {
	return name.trim().length > 0 && name.length <= 20;
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => a.order - b.order);
}

export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

export function isGroup(obj: any): obj is AssetGroup {
	return obj && typeof obj === 'object' && typeof obj.id === 'string' && typeof obj.name === 'string' && Array.isArray(obj.bookmarkList);
}

export function isMarkItem(obj: any): obj is AssetBookmark {
	return obj && typeof obj === 'object' && typeof obj.name === 'string' && typeof obj.uuid === 'string';
}

export function isImageFile(extname: string): boolean {
	return ['png', 'jpg', 'jpeg'].includes(extname.toLowerCase());
}

export function normalizePath(path: string): string {
	return path.replace(/\\/g, '/');
}

export function sortGroups(groups: AssetGroup[], order: SortOrder = SortOrder.ASC): AssetGroup[] {
	return [...groups].sort((a, b) => {
		const result = a.order - b.order;
		return order === SortOrder.ASC ? result : -result;
	});
}

export function findGroupById(groups: AssetGroup[], id: string): Optional<AssetGroup> {
	return groups.find((group) => group.id === id);
}

export function findMarkInGroups(groups: AssetGroup[], uuid: string): { group: AssetGroup; mark: AssetBookmark } | undefined {
	for (const group of groups) {
		const mark = group.bookmarkList.find((item) => item.uuid === uuid);
		if (mark) {
			return { group, mark };
		}
	}
	return undefined;
}

export function validateMark(mark: any): mark is AssetBookmark {
	return typeof mark === 'object' && typeof mark.name === 'string' && typeof mark.uuid === 'string' && typeof mark.assetType === 'string';
}

export function validateGroup(group: any): group is AssetGroup {
	return (
		typeof group === 'object' && typeof group.id === 'string' && typeof group.name === 'string' && Array.isArray(group.bookmarkList) && group.bookmarkList.every(validateMark)
	);
}

export function createAdditionalItem(type: string, value: string, name: string): AdditionalItem {
	return { type, value, name };
}

export function validateAdditionalItem(item: any): item is AdditionalItem {
	return item && typeof item === 'object' && typeof item.type === 'string' && typeof item.value === 'string' && typeof item.name === 'string';
}

export function validateAdditionalItems(items: any[]): items is AdditionalItem[] {
	return Array.isArray(items) && items.every(validateAdditionalItem);
}

// 获取资源图标
export function getAssetIcon(extName: string, type: string): IconType {
	// 先尝试从扩展名映射获取
	const extIcon = extMap[extName];
	if (extIcon) {
		return extIcon;
	}

	// 再尝试从类型映射获取
	const typeIcon = typeMap[type];
	if (typeIcon) {
		return typeIcon;
	}

	// 如果都没有找到，返回默认图标
	return 'custom-asset';
}

// 获取节点路径
export async function getNodePath(uuid: string): Promise<string> {
	const paths: string[] = [];
	let currentUuid = uuid;

	while (currentUuid) {
		const nodeInfo = await Editor.Message.request('scene', 'query-node', currentUuid);
		if (!nodeInfo) break;

		const nodeName = (nodeInfo.name?.value as string) || 'Unknown';
		paths.unshift(nodeName);

		currentUuid = (nodeInfo.parent as string) || '';
	}

	return paths.join('/');
}
