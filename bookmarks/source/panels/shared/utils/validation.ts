import { AssetGroup, NodeGroup, AssetBookmark, NodeBookmark, AdditionalItem } from '../types/common';

/**
 * 验证分组名称
 */
export function validateGroupName(name: string): boolean {
    return name.trim().length > 0 && name.length <= 20;
}

/**
 * 验证是否为资源分组
 */
export function isAssetGroup(obj: any): obj is AssetGroup {
    return obj && 
           typeof obj === 'object' && 
           typeof obj.id === 'string' && 
           typeof obj.name === 'string' && 
           Array.isArray(obj.bookmarkList);
}

/**
 * 验证是否为节点分组
 */
export function isNodeGroup(obj: any): obj is NodeGroup {
    return obj && 
           typeof obj === 'object' && 
           typeof obj.id === 'string' && 
           typeof obj.name === 'string' && 
           Array.isArray(obj.nodeList);
}

/**
 * 验证是否为资源书签
 */
export function isAssetBookmark(obj: any): obj is AssetBookmark {
    return obj && 
           typeof obj === 'object' && 
           typeof obj.name === 'string' && 
           typeof obj.uuid === 'string' &&
           typeof obj.assetType === 'string';
}

/**
 * 验证是否为节点书签
 */
export function isNodeBookmark(obj: any): obj is NodeBookmark {
    return obj && 
           typeof obj === 'object' && 
           typeof obj.name === 'string' && 
           typeof obj.uuid === 'string' &&
           typeof obj.sceneName === 'string';
}

/**
 * 验证附加项
 */
export function validateAdditionalItem(item: any): item is AdditionalItem {
    return item && 
           typeof item === 'object' &&
           typeof item.type === 'string' &&
           typeof item.value === 'string' &&
           typeof item.name === 'string';
} 