"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
/**
 * 创建一个防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(毫秒)
 * @returns 防抖后的函数
 */
function debounce(fn, delay) {
    let timeoutId = null;
    // 创建防抖函数
    const debouncedFn = function (...args) {
        // 清除之前的定时器
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // 设置新的定时器
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
            timeoutId = null;
        }, delay);
    };
    // 添加取消方法
    debouncedFn.cancel = function () {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    return debouncedFn;
}
exports.debounce = debounce;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVib3VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zb3VyY2UvcGFuZWxzL3NoYXJlZC91dGlscy9kZWJvdW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFRQTs7Ozs7R0FLRztBQUNILFNBQWdCLFFBQVEsQ0FDcEIsRUFBSyxFQUNMLEtBQWE7SUFFYixJQUFJLFNBQVMsR0FBMEIsSUFBSSxDQUFDO0lBRTVDLFNBQVM7SUFDVCxNQUFNLFdBQVcsR0FBRyxVQUFvQixHQUFHLElBQW1CO1FBQzFELFdBQVc7UUFDWCxJQUFJLFNBQVMsRUFBRTtZQUNYLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzQjtRQUVELFVBQVU7UUFDVixTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUN4QixFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyQixTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNkLENBQXlCLENBQUM7SUFFMUIsU0FBUztJQUNULFdBQVcsQ0FBQyxNQUFNLEdBQUc7UUFDakIsSUFBSSxTQUFTLEVBQUU7WUFDWCxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsU0FBUyxHQUFHLElBQUksQ0FBQztTQUNwQjtJQUNMLENBQUMsQ0FBQztJQUVGLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUE3QkQsNEJBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIOmYsuaKluWHveaVsOexu+Wei+WumuS5iVxyXG4gKi9cclxudHlwZSBEZWJvdW5jZWRGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk+ID0ge1xyXG4gICAgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD4pOiB2b2lkO1xyXG4gICAgY2FuY2VsOiAoKSA9PiB2b2lkO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIOWIm+W7uuS4gOS4qumYsuaKluWHveaVsFxyXG4gKiBAcGFyYW0gZm4g6ZyA6KaB6Ziy5oqW55qE5Ye95pWwXHJcbiAqIEBwYXJhbSBkZWxheSDlu7bov5/ml7bpl7Qo5q+r56eSKVxyXG4gKiBAcmV0dXJucyDpmLLmipblkI7nmoTlh73mlbBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZTxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk+KFxyXG4gICAgZm46IFQsXHJcbiAgICBkZWxheTogbnVtYmVyXHJcbik6IERlYm91bmNlZEZ1bmN0aW9uPFQ+IHtcclxuICAgIGxldCB0aW1lb3V0SWQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgLy8g5Yib5bu66Ziy5oqW5Ye95pWwXHJcbiAgICBjb25zdCBkZWJvdW5jZWRGbiA9IGZ1bmN0aW9uKHRoaXM6IGFueSwgLi4uYXJnczogUGFyYW1ldGVyczxUPikge1xyXG4gICAgICAgIC8vIOa4hemZpOS5i+WJjeeahOWumuaXtuWZqFxyXG4gICAgICAgIGlmICh0aW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDorr7nva7mlrDnmoTlrprml7blmahcclxuICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IG51bGw7XHJcbiAgICAgICAgfSwgZGVsYXkpO1xyXG4gICAgfSBhcyBEZWJvdW5jZWRGdW5jdGlvbjxUPjtcclxuXHJcbiAgICAvLyDmt7vliqDlj5bmtojmlrnms5VcclxuICAgIGRlYm91bmNlZEZuLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gZGVib3VuY2VkRm47XHJcbn0gIl19