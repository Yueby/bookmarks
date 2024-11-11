/**
 * 导出所有工具函数
 */
export * from './debounce';
export * from './file';
export * from './validation';

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function handleError(error: any, message: string) {
    console.error(message, error);
    Editor.Dialog.error('错误', {
        detail: message + '\n' + (error.message || error)
    });
}

export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
} 