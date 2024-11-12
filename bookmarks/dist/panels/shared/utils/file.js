"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = exports.writeJsonFile = exports.readJsonFile = void 0;
const fs_1 = require("fs");
/**
 * 读取 JSON 文件
 * @param filePath 文件路径
 * @returns 解析后的 JSON 数据，失败返回 null
 */
function readJsonFile(filePath) {
    try {
        if ((0, fs_1.existsSync)(filePath)) {
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            return JSON.parse(content);
        }
    }
    catch (error) {
        console.error('读取文件失败:', error);
    }
    return null;
}
exports.readJsonFile = readJsonFile;
/**
 * 写入 JSON 文件
 * @param filePath 文件路径
 * @param data 要写入的数据
 * @returns 是否写入成功
 */
function writeJsonFile(filePath, data) {
    try {
        (0, fs_1.writeFileSync)(filePath, JSON.stringify(data, null, 2));
        return true;
    }
    catch (error) {
        console.error('写入文件失败:', error);
        return false;
    }
}
exports.writeJsonFile = writeJsonFile;
/**
 * 规范化路径
 * @param path 原始路径
 * @returns 规范化后的路径
 */
function normalizePath(path) {
    return path.replace(/\\/g, '/');
}
exports.normalizePath = normalizePath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9wYW5lbHMvc2hhcmVkL3V0aWxzL2ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQTZEO0FBRzdEOzs7O0dBSUc7QUFDSCxTQUFnQixZQUFZLENBQUksUUFBZ0I7SUFDNUMsSUFBSTtRQUNBLElBQUksSUFBQSxlQUFVLEVBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEIsTUFBTSxPQUFPLEdBQUcsSUFBQSxpQkFBWSxFQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFNLENBQUM7U0FDbkM7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDbkM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBVkQsb0NBVUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLGFBQWEsQ0FBQyxRQUFnQixFQUFFLElBQVM7SUFDckQsSUFBSTtRQUNBLElBQUEsa0JBQWEsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEMsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBUkQsc0NBUUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLElBQVk7SUFDdEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRkQsc0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuXHJcbi8qKlxyXG4gKiDor7vlj5YgSlNPTiDmlofku7ZcclxuICogQHBhcmFtIGZpbGVQYXRoIOaWh+S7tui3r+W+hFxyXG4gKiBAcmV0dXJucyDop6PmnpDlkI7nmoQgSlNPTiDmlbDmja7vvIzlpLHotKXov5Tlm54gbnVsbFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRKc29uRmlsZTxUPihmaWxlUGF0aDogc3RyaW5nKTogVCB8IG51bGwge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBpZiAoZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcclxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIFQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCfor7vlj5bmlofku7blpLHotKU6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlhpnlhaUgSlNPTiDmlofku7ZcclxuICogQHBhcmFtIGZpbGVQYXRoIOaWh+S7tui3r+W+hFxyXG4gKiBAcGFyYW0gZGF0YSDopoHlhpnlhaXnmoTmlbDmja5cclxuICogQHJldHVybnMg5piv5ZCm5YaZ5YWl5oiQ5YqfXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVKc29uRmlsZShmaWxlUGF0aDogc3RyaW5nLCBkYXRhOiBhbnkpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCflhpnlhaXmlofku7blpLHotKU6JywgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOinhOiMg+WMlui3r+W+hFxyXG4gKiBAcGFyYW0gcGF0aCDljp/lp4vot6/lvoRcclxuICogQHJldHVybnMg6KeE6IyD5YyW5ZCO55qE6Lev5b6EXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG59ICJdfQ==