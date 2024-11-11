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
exports.formatDate = exports.handleError = exports.generateId = void 0;
/**
 * 导出所有工具函数
 */
__exportStar(require("./debounce"), exports);
__exportStar(require("./file"), exports);
__exportStar(require("./validation"), exports);
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
exports.generateId = generateId;
function handleError(error, message) {
    console.error(message, error);
    Editor.Dialog.error('错误', {
        detail: message + '\n' + (error.message || error)
    });
}
exports.handleError = handleError;
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}
exports.formatDate = formatDate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zb3VyY2UvcGFuZWxzL3NoYXJlZC91dGlscy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBQ0gsNkNBQTJCO0FBQzNCLHlDQUF1QjtBQUN2QiwrQ0FBNkI7QUFFN0IsU0FBZ0IsVUFBVTtJQUN0QixPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUUsQ0FBQztBQUZELGdDQUVDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLEtBQVUsRUFBRSxPQUFlO0lBQ25ELE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUN0QixNQUFNLEVBQUUsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDO0tBQ3BELENBQUMsQ0FBQztBQUNQLENBQUM7QUFMRCxrQ0FLQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxTQUFpQjtJQUN4QyxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ2hELENBQUM7QUFGRCxnQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog5a+85Ye65omA5pyJ5bel5YW35Ye95pWwXG4gKi9cbmV4cG9ydCAqIGZyb20gJy4vZGVib3VuY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9maWxlJztcbmV4cG9ydCAqIGZyb20gJy4vdmFsaWRhdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyb3I6IGFueSwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlLCBlcnJvcik7XG4gICAgRWRpdG9yLkRpYWxvZy5lcnJvcign6ZSZ6K+vJywge1xuICAgICAgICBkZXRhaWw6IG1lc3NhZ2UgKyAnXFxuJyArIChlcnJvci5tZXNzYWdlIHx8IGVycm9yKVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZSh0aW1lc3RhbXA6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHRpbWVzdGFtcCkudG9Mb2NhbGVTdHJpbmcoKTtcbn0gIl19