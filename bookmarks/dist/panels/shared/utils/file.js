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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9wYW5lbHMvc2hhcmVkL3V0aWxzL2ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQTZEO0FBRzdEOzs7O0dBSUc7QUFDSCxTQUFnQixZQUFZLENBQUksUUFBZ0I7SUFDNUMsSUFBSTtRQUNBLElBQUksSUFBQSxlQUFVLEVBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEIsTUFBTSxPQUFPLEdBQUcsSUFBQSxpQkFBWSxFQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFNLENBQUM7U0FDbkM7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDbkM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBVkQsb0NBVUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLGFBQWEsQ0FBQyxRQUFnQixFQUFFLElBQVM7SUFDckQsSUFBSTtRQUNBLElBQUEsa0JBQWEsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEMsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBUkQsc0NBUUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLElBQVk7SUFDdEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRkQsc0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5cbi8qKlxuICog6K+75Y+WIEpTT04g5paH5Lu2XG4gKiBAcGFyYW0gZmlsZVBhdGgg5paH5Lu26Lev5b6EXG4gKiBAcmV0dXJucyDop6PmnpDlkI7nmoQgSlNPTiDmlbDmja7vvIzlpLHotKXov5Tlm54gbnVsbFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZEpzb25GaWxlPFQ+KGZpbGVQYXRoOiBzdHJpbmcpOiBUIHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIFQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCfor7vlj5bmlofku7blpLHotKU6JywgZXJyb3IpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiDlhpnlhaUgSlNPTiDmlofku7ZcbiAqIEBwYXJhbSBmaWxlUGF0aCDmlofku7bot6/lvoRcbiAqIEBwYXJhbSBkYXRhIOimgeWGmeWFpeeahOaVsOaNrlxuICogQHJldHVybnMg5piv5ZCm5YaZ5YWl5oiQ5YqfXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZUpzb25GaWxlKGZpbGVQYXRoOiBzdHJpbmcsIGRhdGE6IGFueSk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign5YaZ5YWl5paH5Lu25aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiDop4TojIPljJbot6/lvoRcbiAqIEBwYXJhbSBwYXRoIOWOn+Wni+i3r+W+hFxuICogQHJldHVybnMg6KeE6IyD5YyW5ZCO55qE6Lev5b6EXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufSAiXX0=