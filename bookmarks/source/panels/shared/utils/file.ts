import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 读取 JSON 文件
 * @param filePath 文件路径
 * @returns 解析后的 JSON 数据，失败返回 null
 */
export function readJsonFile<T>(filePath: string): T | null {
    try {
        if (existsSync(filePath)) {
            const content = readFileSync(filePath, 'utf-8');
            return JSON.parse(content) as T;
        }
    } catch (error) {
        console.error('读取文件失败:', error);
    }
    return null;
}

/**
 * 写入 JSON 文件
 * @param filePath 文件路径
 * @param data 要写入的数据
 * @returns 是否写入成功
 */
export function writeJsonFile(filePath: string, data: any): boolean {
    try {
        writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('写入文件失败:', error);
        return false;
    }
}

/**
 * 规范化路径
 * @param path 原始路径
 * @returns 规范化后的路径
 */
export function normalizePath(path: string): string {
    return path.replace(/\\/g, '/');
} 