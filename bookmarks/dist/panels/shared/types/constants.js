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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc291cmNlL3BhbmVscy9zaGFyZWQvdHlwZXMvY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztHQUVHO0FBQ1UsUUFBQSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBRS9COztHQUVHO0FBQ0gsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ3BCLHFDQUF3QixDQUFBO0lBQ3hCLG1DQUFzQixDQUFBO0FBQ3ZCLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUVEOztHQUVHO0FBQ0gsSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ25CLDZCQUFpQixDQUFBO0lBQ2pCLDJCQUFlLENBQUE7QUFDaEIsQ0FBQyxFQUhXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBR25CO0FBRUQ7O0dBRUc7QUFDSCxJQUFZLFNBR1g7QUFIRCxXQUFZLFNBQVM7SUFDcEIsd0JBQVcsQ0FBQTtJQUNYLDBCQUFhLENBQUE7QUFDZCxDQUFDLEVBSFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFHcEI7QUFFRDs7R0FFRztBQUNILElBQVksU0FLWDtBQUxELFdBQVksU0FBUztJQUNwQiwwQ0FBNkIsQ0FBQTtJQUM3Qix3Q0FBMkIsQ0FBQTtJQUMzQiwwQ0FBNkIsQ0FBQTtJQUM3QixnREFBbUMsQ0FBQTtBQUNwQyxDQUFDLEVBTFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFLcEI7QUFFRDs7R0FFRztBQUNILElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNyQix5QkFBVyxDQUFBO0lBQ1gsK0JBQWlCLENBQUE7SUFDakIsK0JBQWlCLENBQUE7QUFDbEIsQ0FBQyxFQUpXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBSXJCO0FBRUQ7O0dBRUc7QUFDVSxRQUFBLGNBQWMsR0FBRztJQUM3QixTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztDQUNBLENBQUM7QUFFWDs7R0FFRztBQUNVLFFBQUEsY0FBYyxHQUFHLEdBQUcsQ0FBQztBQUVsQzs7R0FFRztBQUNVLFFBQUEsa0JBQWtCLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDniYjmnKzlj7dcbiAqL1xuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSAnMS4wLjAnO1xuXG4vKipcbiAqIOmdouadv+exu+Wei1xuICovXG5leHBvcnQgZW51bSBQYW5lbFR5cGUge1xuXHRBU1NFVCA9ICdhc3NldC1ib29rbWFyaycsXG5cdE5PREUgPSAnbm9kZS1ib29rbWFyaydcbn1cblxuLyoqXG4gKiDop4blm77nsbvlnotcbiAqL1xuZXhwb3J0IGVudW0gVmlld1R5cGUge1xuXHRBU1NFVFMgPSAnYXNzZXRzJyxcblx0Tk9ERVMgPSAnbm9kZXMnXG59XG5cbi8qKlxuICog5o6S5bqP5pa55byPXG4gKi9cbmV4cG9ydCBlbnVtIFNvcnRPcmRlciB7XG5cdEFTQyA9ICdhc2MnLFxuXHRERVNDID0gJ2Rlc2MnXG59XG5cbi8qKlxuICog5LqL5Lu257G75Z6LXG4gKi9cbmV4cG9ydCBlbnVtIEV2ZW50VHlwZSB7XG5cdEFTU0VUX0NIQU5HRSA9ICdhc3NldC1jaGFuZ2UnLFxuXHROT0RFX0NIQU5HRSA9ICdub2RlLWNoYW5nZScsXG5cdEdST1VQX0NIQU5HRSA9ICdncm91cC1jaGFuZ2UnLFxuXHRCT09LTUFSS19DSEFOR0UgPSAnYm9va21hcmstY2hhbmdlJ1xufVxuXG4vKipcbiAqIOaTjeS9nOexu+Wei1xuICovXG5leHBvcnQgZW51bSBBY3Rpb25UeXBlIHtcblx0QUREID0gJ2FkZCcsXG5cdFJFTU9WRSA9ICdyZW1vdmUnLFxuXHRVUERBVEUgPSAndXBkYXRlJ1xufVxuXG4vKipcbiAqIOm7mOiupOminOiJsuWIl+ihqFxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT0xPUlMgPSBbXG5cdCcjNGE5ZWZmJyxcblx0JyNmZjRhNGEnLFxuXHQnIzRhZmY0YScsXG5cdCcjZmZkNzRhJyxcblx0JyNmZjRhZjUnLFxuXHQnIzRhZmZkNycsXG5cdCcjZDc0YWZmJyxcblx0JyM0YWQ3ZmYnXG5dIGFzIGNvbnN0O1xuXG4vKipcbiAqIOW7tui/n+aXtumXtFxuICovXG5leHBvcnQgY29uc3QgREVCT1VOQ0VfREVMQVkgPSAzMDA7XG5cbi8qKlxuICog5Yqo55S75pe26Ze0XG4gKi9cbmV4cG9ydCBjb25zdCBBTklNQVRJT05fRFVSQVRJT04gPSAyMDA7XG4iXX0=