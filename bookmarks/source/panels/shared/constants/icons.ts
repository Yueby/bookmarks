/**
 * 图标类型定义
 */
export type IconType = 
    'directory' | 'prefab' | 'scene' | 'audio-clip' | 'sprite' | 'animation' | 
    'text' | 'ttf-font' | 'image' | 'json' | 'label-atlas' | 'material' | 
    'physics-material' | 'texture-cube' | 'effect' | 'animation-graph' | 
    'animation-graph-variant' | 'animation-mask' | 'javascript' | 'typescript' | 
    'chunk' | 'auto-atlas' | 'sprite-atlas' | 'render-texture' | 'custom-asset' |
    'add' | 'delete' | 'clear' | 'check' | 'close';

/**
 * 自定义 SVG 图标
 */
export const customIcons = {
    'custom-asset': `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
        </svg>
    `,
    'add': `
        <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z"/>
        </svg>
    `,
    'delete': `
        <svg viewBox="0 0 24 24" width="12" height="12">
            <path fill="currentColor" d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/>
        </svg>
    `,
    'clear': `
        <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"/>
        </svg>
    `,
    'check': `
        <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"/>
        </svg>
    `,
    'close': `
        <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"/>
        </svg>
    `
};

/**
 * 类型到图标的映射
 */
export const typeMap: Record<string, IconType> = {
    'cc.Asset': 'directory',
    'cc.Prefab': 'prefab',
    'cc.SceneAsset': 'scene',
    'cc.AudioClip': 'audio-clip',
    'cc.SpriteFrame': 'sprite',
    'cc.AnimationClip': 'animation',
    'cc.TextAsset': 'text',
    'cc.TTFFont': 'ttf-font',
    'cc.ImageAsset': 'image',
    'cc.JsonAsset': 'json',
    'cc.LabelAtlas': 'label-atlas',
    'cc.Material': 'material',
    'cc.PhysicsMaterial': 'physics-material',
    'cc.TextureCube': 'texture-cube',
    'cc.EffectAsset': 'effect',
    'cc.animation.AnimationGraph': 'animation-graph',
    'cc.animation.AnimationGraphVariant': 'animation-graph-variant',
    'cc.animation.AnimationMask': 'animation-mask'
};

/**
 * 扩展名到图标的映射
 */
export const extMap: Record<string, IconType> = {
    'js': 'javascript',
    'ts': 'typescript',
    'chunk': 'chunk',
    'pac': 'auto-atlas',
    'plist': 'sprite-atlas',
    'rt@f9941': 'render-texture'
}; 

/**
 * 获取资源图标
 */
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

    // 如果都没有找到，返回自定义资源图标
    return 'custom-asset';
}