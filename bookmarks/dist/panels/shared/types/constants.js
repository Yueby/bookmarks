"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANIMATION_DURATION = exports.DEBOUNCE_DELAY = exports.DEFAULT_COLORS = exports.ActionType = exports.EventType = exports.SortOrder = exports.ViewType = exports.PanelType = exports.VERSION = void 0;
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
 * 排序方式
 */
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc291cmNlL3BhbmVscy9zaGFyZWQvdHlwZXMvY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztHQUVHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBRS9COztHQUVHO0FBQ0gsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ3BCLHFDQUF3QixDQUFBO0lBQ3hCLG1DQUFzQixDQUFBO0FBQ3ZCLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ25CLDZCQUFpQixDQUFBO0lBQ2pCLDJCQUFlLENBQUE7QUFDaEIsQ0FBQyxFQUhXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBR25CO0FBRUQ7O0dBRUc7QUFDSCxJQUFZLFNBR1g7QUFIRCxXQUFZLFNBQVM7SUFDcEIsd0JBQVcsQ0FBQTtJQUNYLDBCQUFhLENBQUE7QUFDZCxDQUFDLEVBSFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFHcEI7QUFFRDs7R0FFRztBQUNILElBQVksU0FLWDtBQUxELFdBQVksU0FBUztJQUNwQiwwQ0FBNkIsQ0FBQTtJQUM3Qix3Q0FBMkIsQ0FBQTtJQUMzQiwwQ0FBNkIsQ0FBQTtJQUM3QixnREFBbUMsQ0FBQTtBQUNwQyxDQUFDLEVBTFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFLcEI7QUFFRDs7R0FFRztBQUNILElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNyQix5QkFBVyxDQUFBO0lBQ1gsK0JBQWlCLENBQUE7SUFDakIsK0JBQWlCLENBQUE7QUFDbEIsQ0FBQyxFQUpXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBSXJCO0FBRUQ7O0dBRUc7QUFDVSxRQUFBLGNBQWMsR0FBRztJQUM3QixTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztDQUNBLENBQUM7QUFFWDs7R0FFRztBQUNVLFFBQUEsY0FBYyxHQUFHLEdBQUcsQ0FBQztBQUVsQzs7R0FFRztBQUNVLFFBQUEsa0JBQWtCLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIOeJiOacrOWPt1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSAnMS4wLjAnO1xyXG5cclxuLyoqXHJcbiAqIOmdouadv+exu+Wei1xyXG4gKi9cclxuZXhwb3J0IGVudW0gUGFuZWxUeXBlIHtcclxuXHRBU1NFVCA9ICdhc3NldC1ib29rbWFyaycsXHJcblx0Tk9ERSA9ICdub2RlLWJvb2ttYXJrJ1xyXG59XHJcblxyXG4vKipcclxuICog6KeG5Zu+57G75Z6LXHJcbiAqL1xyXG5leHBvcnQgZW51bSBWaWV3VHlwZSB7XHJcblx0QVNTRVRTID0gJ2Fzc2V0cycsXHJcblx0Tk9ERVMgPSAnbm9kZXMnXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmjpLluo/mlrnlvI9cclxuICovXHJcbmV4cG9ydCBlbnVtIFNvcnRPcmRlciB7XHJcblx0QVNDID0gJ2FzYycsXHJcblx0REVTQyA9ICdkZXNjJ1xyXG59XHJcblxyXG4vKipcclxuICog5LqL5Lu257G75Z6LXHJcbiAqL1xyXG5leHBvcnQgZW51bSBFdmVudFR5cGUge1xyXG5cdEFTU0VUX0NIQU5HRSA9ICdhc3NldC1jaGFuZ2UnLFxyXG5cdE5PREVfQ0hBTkdFID0gJ25vZGUtY2hhbmdlJyxcclxuXHRHUk9VUF9DSEFOR0UgPSAnZ3JvdXAtY2hhbmdlJyxcclxuXHRCT09LTUFSS19DSEFOR0UgPSAnYm9va21hcmstY2hhbmdlJ1xyXG59XHJcblxyXG4vKipcclxuICog5pON5L2c57G75Z6LXHJcbiAqL1xyXG5leHBvcnQgZW51bSBBY3Rpb25UeXBlIHtcclxuXHRBREQgPSAnYWRkJyxcclxuXHRSRU1PVkUgPSAncmVtb3ZlJyxcclxuXHRVUERBVEUgPSAndXBkYXRlJ1xyXG59XHJcblxyXG4vKipcclxuICog6buY6K6k6aKc6Imy5YiX6KGoXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT0xPUlMgPSBbXHJcblx0JyM0YTllZmYnLFxyXG5cdCcjZmY0YTRhJyxcclxuXHQnIzRhZmY0YScsXHJcblx0JyNmZmQ3NGEnLFxyXG5cdCcjZmY0YWY1JyxcclxuXHQnIzRhZmZkNycsXHJcblx0JyNkNzRhZmYnLFxyXG5cdCcjNGFkN2ZmJ1xyXG5dIGFzIGNvbnN0O1xyXG5cclxuLyoqXHJcbiAqIOW7tui/n+aXtumXtFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFQk9VTkNFX0RFTEFZID0gMzAwO1xyXG5cclxuLyoqXHJcbiAqIOWKqOeUu+aXtumXtFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEFOSU1BVElPTl9EVVJBVElPTiA9IDIwMDtcclxuIl19