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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zb3VyY2UvcGFuZWxzL3NoYXJlZC9jb25zdGFudHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7R0FFRztBQUNILDBDQUF3QjtBQUV4Qjs7R0FFRztBQUNVLFFBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUUvQjs7R0FFRztBQUNILElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNqQixxQ0FBd0IsQ0FBQTtJQUN4QixtQ0FBc0IsQ0FBQTtBQUMxQixDQUFDLEVBSFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFHcEI7QUFFRDs7R0FFRztBQUNILElBQVksUUFHWDtBQUhELFdBQVksUUFBUTtJQUNoQiw2QkFBaUIsQ0FBQTtJQUNqQiwyQkFBZSxDQUFBO0FBQ25CLENBQUMsRUFIVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQUduQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxTQUtYO0FBTEQsV0FBWSxTQUFTO0lBQ2pCLDBDQUE2QixDQUFBO0lBQzdCLHdDQUEyQixDQUFBO0lBQzNCLDBDQUE2QixDQUFBO0lBQzdCLGdEQUFtQyxDQUFBO0FBQ3ZDLENBQUMsRUFMVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUtwQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ2xCLHlCQUFXLENBQUE7SUFDWCwrQkFBaUIsQ0FBQTtJQUNqQiwrQkFBaUIsQ0FBQTtBQUNyQixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckI7QUFFRDs7R0FFRztBQUNVLFFBQUEsY0FBYyxHQUFHO0lBQzFCLFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0NBQ0gsQ0FBQztBQUVYOztHQUVHO0FBQ1UsUUFBQSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBRWxDOztHQUVHO0FBQ1UsUUFBQSxrQkFBa0IsR0FBRyxHQUFHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOWvvOWHuuaJgOacieW4uOmHj1xuICovXG5leHBvcnQgKiBmcm9tICcuL2ljb25zJztcblxuLyoqXG4gKiDniYjmnKzlj7dcbiAqL1xuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSAnMS4wLjAnO1xuXG4vKipcbiAqIOmdouadv+exu+Wei1xuICovXG5leHBvcnQgZW51bSBQYW5lbFR5cGUge1xuICAgIEFTU0VUID0gJ2Fzc2V0LWJvb2ttYXJrJyxcbiAgICBOT0RFID0gJ25vZGUtYm9va21hcmsnXG59XG5cbi8qKlxuICog6KeG5Zu+57G75Z6LXG4gKi9cbmV4cG9ydCBlbnVtIFZpZXdUeXBlIHtcbiAgICBBU1NFVFMgPSAnYXNzZXRzJyxcbiAgICBOT0RFUyA9ICdub2Rlcydcbn1cblxuLyoqXG4gKiDkuovku7bnsbvlnotcbiAqL1xuZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcbiAgICBBU1NFVF9DSEFOR0UgPSAnYXNzZXQtY2hhbmdlJyxcbiAgICBOT0RFX0NIQU5HRSA9ICdub2RlLWNoYW5nZScsXG4gICAgR1JPVVBfQ0hBTkdFID0gJ2dyb3VwLWNoYW5nZScsXG4gICAgQk9PS01BUktfQ0hBTkdFID0gJ2Jvb2ttYXJrLWNoYW5nZSdcbn1cblxuLyoqXG4gKiDmk43kvZznsbvlnotcbiAqL1xuZXhwb3J0IGVudW0gQWN0aW9uVHlwZSB7XG4gICAgQUREID0gJ2FkZCcsXG4gICAgUkVNT1ZFID0gJ3JlbW92ZScsXG4gICAgVVBEQVRFID0gJ3VwZGF0ZSdcbn1cblxuLyoqXG4gKiDpu5jorqTpopzoibLliJfooahcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09MT1JTID0gW1xuICAgICcjNGE5ZWZmJyxcbiAgICAnI2ZmNGE0YScsXG4gICAgJyM0YWZmNGEnLFxuICAgICcjZmZkNzRhJyxcbiAgICAnI2ZmNGFmNScsXG4gICAgJyM0YWZmZDcnLFxuICAgICcjZDc0YWZmJyxcbiAgICAnIzRhZDdmZidcbl0gYXMgY29uc3Q7XG5cbi8qKlxuICog5bu26L+f5pe26Ze0XG4gKi9cbmV4cG9ydCBjb25zdCBERUJPVU5DRV9ERUxBWSA9IDMwMDtcblxuLyoqXG4gKiDliqjnlLvml7bpl7RcbiAqL1xuZXhwb3J0IGNvbnN0IEFOSU1BVElPTl9EVVJBVElPTiA9IDIwMDsiXX0=