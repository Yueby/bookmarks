/**
 * 可选类型
 */
export type Optional<T> = T | null | undefined;

/**
 * 基础接口
 */
export interface BaseItem {
    id: string;
    name: string;
    createTime: number;
    updateTime: number;
}

/**
 * 资源书签相关
 */
export interface AssetBookmark extends BaseItem {
    extname: string;
    uuid: string;
    base64: string;
    additional: AdditionalItem[];
    assetType: string;
    iconHtml: string;
}

export interface AssetGroup extends BaseItem {
    bookmarkList: AssetBookmark[];
    order: number;
    color?: string;
}

/**
 * 节点书签相关
 */
export interface NodeBookmark extends BaseItem {
    uuid: string;
    sceneName: string;
    sceneUuid: string;
    path: string;
}

export interface NodeGroup extends BaseItem {
    nodeList: NodeBookmark[];
    order: number;
    color?: string;
}

/**
 * 通用接口
 */
export interface AdditionalItem {
    type: string;
    value: string;
    name: string;
}

/**
 * 保存数据接口
 */
export interface SaveData {
    version: string;
    timestamp: number;
}

export interface AssetSaveData extends SaveData {
    groups: AssetGroup[];
    currentGroup: number;
}

export interface NodeSaveData extends SaveData {
    nodeGroups: NodeGroup[];
    currentNodeGroup: number;
} 