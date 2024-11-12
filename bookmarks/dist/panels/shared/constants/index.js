"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANIMATION_DURATION = exports.DEBOUNCE_DELAY = exports.DEFAULT_COLORS = exports.ActionType = exports.EventType = exports.ViewType = exports.PanelType = exports.VERSION = void 0;
/**
 * 导出所有常量
 */
__exportStar(require("./icons"), exports);
/**
 * 版本号
 */
exports.VERSION = '1.0.0';
/**
 * 面板类型
 */
var PanelType;
(function (PanelType) {
    PanelType["ASSET"] = "asset-bookmark";
    PanelType["NODE"] = "node-bookmark";
})(PanelType = exports.PanelType || (exports.PanelType = {}));
/**
 * 视图类型
 */
var ViewType;
(function (ViewType) {
    ViewType["ASSETS"] = "assets";
    ViewType["NODES"] = "nodes";
})(ViewType = exports.ViewType || (exports.ViewType = {}));
/**
 * 事件类型
 */
var EventType;
(function (EventType) {
    EventType["ASSET_CHANGE"] = "asset-change";
    EventType["NODE_CHANGE"] = "node-change";
    EventType["GROUP_CHANGE"] = "group-change";
    EventType["BOOKMARK_CHANGE"] = "bookmark-change";
})(EventType = exports.EventType || (exports.EventType = {}));
/**
 * 操作类型
 */
var ActionType;
(function (ActionType) {
    ActionType["ADD"] = "add";
    ActionType["REMOVE"] = "remove";
    ActionType["UPDATE"] = "update";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
/**
 * 默认颜色列表
 */
exports.DEFAULT_COLORS = [
    '#4a9eff',
    '#ff4a4a',
    '#4aff4a',
    '#ffd74a',
    '#ff4af5',
    '#4affd7',
    '#d74aff',
    '#4ad7ff'
];
/**
 * 延迟时间
 */
exports.DEBOUNCE_DELAY = 300;
/**
 * 动画时间
 */
exports.ANIMATION_DURATION = 200;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zb3VyY2UvcGFuZWxzL3NoYXJlZC9jb25zdGFudHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7R0FFRztBQUNILDBDQUF3QjtBQUV4Qjs7R0FFRztBQUNVLFFBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUUvQjs7R0FFRztBQUNILElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNqQixxQ0FBd0IsQ0FBQTtJQUN4QixtQ0FBc0IsQ0FBQTtBQUMxQixDQUFDLEVBSFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFHcEI7QUFFRDs7R0FFRztBQUNILElBQVksUUFHWDtBQUhELFdBQVksUUFBUTtJQUNoQiw2QkFBaUIsQ0FBQTtJQUNqQiwyQkFBZSxDQUFBO0FBQ25CLENBQUMsRUFIVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQUduQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxTQUtYO0FBTEQsV0FBWSxTQUFTO0lBQ2pCLDBDQUE2QixDQUFBO0lBQzdCLHdDQUEyQixDQUFBO0lBQzNCLDBDQUE2QixDQUFBO0lBQzdCLGdEQUFtQyxDQUFBO0FBQ3ZDLENBQUMsRUFMVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUtwQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ2xCLHlCQUFXLENBQUE7SUFDWCwrQkFBaUIsQ0FBQTtJQUNqQiwrQkFBaUIsQ0FBQTtBQUNyQixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckI7QUFFRDs7R0FFRztBQUNVLFFBQUEsY0FBYyxHQUFHO0lBQzFCLFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0NBQ0gsQ0FBQztBQUVYOztHQUVHO0FBQ1UsUUFBQSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBRWxDOztHQUVHO0FBQ1UsUUFBQSxrQkFBa0IsR0FBRyxHQUFHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICog5a+85Ye65omA5pyJ5bi46YePXHJcbiAqL1xyXG5leHBvcnQgKiBmcm9tICcuL2ljb25zJztcclxuXHJcbi8qKlxyXG4gKiDniYjmnKzlj7dcclxuICovXHJcbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gJzEuMC4wJztcclxuXHJcbi8qKlxyXG4gKiDpnaLmnb/nsbvlnotcclxuICovXHJcbmV4cG9ydCBlbnVtIFBhbmVsVHlwZSB7XHJcbiAgICBBU1NFVCA9ICdhc3NldC1ib29rbWFyaycsXHJcbiAgICBOT0RFID0gJ25vZGUtYm9va21hcmsnXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDop4blm77nsbvlnotcclxuICovXHJcbmV4cG9ydCBlbnVtIFZpZXdUeXBlIHtcclxuICAgIEFTU0VUUyA9ICdhc3NldHMnLFxyXG4gICAgTk9ERVMgPSAnbm9kZXMnXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuovku7bnsbvlnotcclxuICovXHJcbmV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XHJcbiAgICBBU1NFVF9DSEFOR0UgPSAnYXNzZXQtY2hhbmdlJyxcclxuICAgIE5PREVfQ0hBTkdFID0gJ25vZGUtY2hhbmdlJyxcclxuICAgIEdST1VQX0NIQU5HRSA9ICdncm91cC1jaGFuZ2UnLFxyXG4gICAgQk9PS01BUktfQ0hBTkdFID0gJ2Jvb2ttYXJrLWNoYW5nZSdcclxufVxyXG5cclxuLyoqXHJcbiAqIOaTjeS9nOexu+Wei1xyXG4gKi9cclxuZXhwb3J0IGVudW0gQWN0aW9uVHlwZSB7XHJcbiAgICBBREQgPSAnYWRkJyxcclxuICAgIFJFTU9WRSA9ICdyZW1vdmUnLFxyXG4gICAgVVBEQVRFID0gJ3VwZGF0ZSdcclxufVxyXG5cclxuLyoqXHJcbiAqIOm7mOiupOminOiJsuWIl+ihqFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09MT1JTID0gW1xyXG4gICAgJyM0YTllZmYnLFxyXG4gICAgJyNmZjRhNGEnLFxyXG4gICAgJyM0YWZmNGEnLFxyXG4gICAgJyNmZmQ3NGEnLFxyXG4gICAgJyNmZjRhZjUnLFxyXG4gICAgJyM0YWZmZDcnLFxyXG4gICAgJyNkNzRhZmYnLFxyXG4gICAgJyM0YWQ3ZmYnXHJcbl0gYXMgY29uc3Q7XHJcblxyXG4vKipcclxuICog5bu26L+f5pe26Ze0XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVCT1VOQ0VfREVMQVkgPSAzMDA7XHJcblxyXG4vKipcclxuICog5Yqo55S75pe26Ze0XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQU5JTUFUSU9OX0RVUkFUSU9OID0gMjAwOyJdfQ==