/**
 * 防抖函数类型定义
 */
type DebouncedFunction<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): void;
    cancel: () => void;
};

/**
 * 创建一个防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(毫秒)
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): DebouncedFunction<T> {
    let timeoutId: NodeJS.Timeout | null = null;

    // 创建防抖函数
    const debouncedFn = function(this: any, ...args: Parameters<T>) {
        // 清除之前的定时器
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // 设置新的定时器
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
            timeoutId = null;
        }, delay);
    } as DebouncedFunction<T>;

    // 添加取消方法
    debouncedFn.cancel = function() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debouncedFn;
} 