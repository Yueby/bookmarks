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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVib3VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zb3VyY2UvcGFuZWxzL3NoYXJlZC91dGlscy9kZWJvdW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFRQTs7Ozs7R0FLRztBQUNILFNBQWdCLFFBQVEsQ0FDcEIsRUFBSyxFQUNMLEtBQWE7SUFFYixJQUFJLFNBQVMsR0FBMEIsSUFBSSxDQUFDO0lBRTVDLFNBQVM7SUFDVCxNQUFNLFdBQVcsR0FBRyxVQUFvQixHQUFHLElBQW1CO1FBQzFELFdBQVc7UUFDWCxJQUFJLFNBQVMsRUFBRTtZQUNYLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzQjtRQUVELFVBQVU7UUFDVixTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUN4QixFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyQixTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNkLENBQXlCLENBQUM7SUFFMUIsU0FBUztJQUNULFdBQVcsQ0FBQyxNQUFNLEdBQUc7UUFDakIsSUFBSSxTQUFTLEVBQUU7WUFDWCxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsU0FBUyxHQUFHLElBQUksQ0FBQztTQUNwQjtJQUNMLENBQUMsQ0FBQztJQUVGLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUE3QkQsNEJBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDpmLLmipblh73mlbDnsbvlnovlrprkuYlcbiAqL1xudHlwZSBEZWJvdW5jZWRGdW5jdGlvbjxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk+ID0ge1xuICAgICguLi5hcmdzOiBQYXJhbWV0ZXJzPFQ+KTogdm9pZDtcbiAgICBjYW5jZWw6ICgpID0+IHZvaWQ7XG59O1xuXG4vKipcbiAqIOWIm+W7uuS4gOS4qumYsuaKluWHveaVsFxuICogQHBhcmFtIGZuIOmcgOimgemYsuaKlueahOWHveaVsFxuICogQHBhcmFtIGRlbGF5IOW7tui/n+aXtumXtCjmr6vnp5IpXG4gKiBAcmV0dXJucyDpmLLmipblkI7nmoTlh73mlbBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlYm91bmNlPFQgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IGFueT4oXG4gICAgZm46IFQsXG4gICAgZGVsYXk6IG51bWJlclxuKTogRGVib3VuY2VkRnVuY3Rpb248VD4ge1xuICAgIGxldCB0aW1lb3V0SWQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XG5cbiAgICAvLyDliJvlu7rpmLLmipblh73mlbBcbiAgICBjb25zdCBkZWJvdW5jZWRGbiA9IGZ1bmN0aW9uKHRoaXM6IGFueSwgLi4uYXJnczogUGFyYW1ldGVyczxUPikge1xuICAgICAgICAvLyDmuIXpmaTkuYvliY3nmoTlrprml7blmahcbiAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDorr7nva7mlrDnmoTlrprml7blmahcbiAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IG51bGw7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICB9IGFzIERlYm91bmNlZEZ1bmN0aW9uPFQ+O1xuXG4gICAgLy8g5re75Yqg5Y+W5raI5pa55rOVXG4gICAgZGVib3VuY2VkRm4uY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgdGltZW91dElkID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZGVib3VuY2VkRm47XG59ICJdfQ==