"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdditionalItem = exports.isNodeBookmark = exports.isAssetBookmark = exports.isNodeGroup = exports.isAssetGroup = exports.validateGroupName = void 0;
/**
 * 验证分组名称
 */
function validateGroupName(name) {
    return name.trim().length > 0 && name.length <= 20;
}
exports.validateGroupName = validateGroupName;
/**
 * 验证是否为资源分组
 */
function isAssetGroup(obj) {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        Array.isArray(obj.bookmarkList);
}
exports.isAssetGroup = isAssetGroup;
/**
 * 验证是否为节点分组
 */
function isNodeGroup(obj) {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        Array.isArray(obj.nodeList);
}
exports.isNodeGroup = isNodeGroup;
/**
 * 验证是否为资源书签
 */
function isAssetBookmark(obj) {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.name === 'string' &&
        typeof obj.uuid === 'string' &&
        typeof obj.assetType === 'string';
}
exports.isAssetBookmark = isAssetBookmark;
/**
 * 验证是否为节点书签
 */
function isNodeBookmark(obj) {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.name === 'string' &&
        typeof obj.uuid === 'string' &&
        typeof obj.sceneName === 'string';
}
exports.isNodeBookmark = isNodeBookmark;
/**
 * 验证附加项
 */
function validateAdditionalItem(item) {
    return item &&
        typeof item === 'object' &&
        typeof item.type === 'string' &&
        typeof item.value === 'string' &&
        typeof item.name === 'string';
}
exports.validateAdditionalItem = validateAdditionalItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9wYW5lbHMvc2hhcmVkL3V0aWxzL3ZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUE7O0dBRUc7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFZO0lBQzFDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7QUFDdkQsQ0FBQztBQUZELDhDQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixZQUFZLENBQUMsR0FBUTtJQUNqQyxPQUFPLEdBQUc7UUFDSCxPQUFPLEdBQUcsS0FBSyxRQUFRO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLEVBQUUsS0FBSyxRQUFRO1FBQzFCLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRO1FBQzVCLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFORCxvQ0FNQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsV0FBVyxDQUFDLEdBQVE7SUFDaEMsT0FBTyxHQUFHO1FBQ0gsT0FBTyxHQUFHLEtBQUssUUFBUTtRQUN2QixPQUFPLEdBQUcsQ0FBQyxFQUFFLEtBQUssUUFBUTtRQUMxQixPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUTtRQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBTkQsa0NBTUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGVBQWUsQ0FBQyxHQUFRO0lBQ3BDLE9BQU8sR0FBRztRQUNILE9BQU8sR0FBRyxLQUFLLFFBQVE7UUFDdkIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDNUIsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQztBQUM3QyxDQUFDO0FBTkQsMENBTUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxHQUFRO0lBQ25DLE9BQU8sR0FBRztRQUNILE9BQU8sR0FBRyxLQUFLLFFBQVE7UUFDdkIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDNUIsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQztBQUM3QyxDQUFDO0FBTkQsd0NBTUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLHNCQUFzQixDQUFDLElBQVM7SUFDNUMsT0FBTyxJQUFJO1FBQ0osT0FBTyxJQUFJLEtBQUssUUFBUTtRQUN4QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUTtRQUM3QixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUTtRQUM5QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO0FBQ3pDLENBQUM7QUFORCx3REFNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0R3JvdXAsIE5vZGVHcm91cCwgQXNzZXRCb29rbWFyaywgTm9kZUJvb2ttYXJrLCBBZGRpdGlvbmFsSXRlbSB9IGZyb20gJy4uL3R5cGVzL2NvbW1vbic7XHJcblxyXG4vKipcclxuICog6aqM6K+B5YiG57uE5ZCN56ewXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVHcm91cE5hbWUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gbmFtZS50cmltKCkubGVuZ3RoID4gMCAmJiBuYW1lLmxlbmd0aCA8PSAyMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOmqjOivgeaYr+WQpuS4uui1hOa6kOWIhue7hFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQXNzZXRHcm91cChvYmo6IGFueSk6IG9iaiBpcyBBc3NldEdyb3VwIHtcclxuICAgIHJldHVybiBvYmogJiYgXHJcbiAgICAgICAgICAgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgXHJcbiAgICAgICAgICAgdHlwZW9mIG9iai5pZCA9PT0gJ3N0cmluZycgJiYgXHJcbiAgICAgICAgICAgdHlwZW9mIG9iai5uYW1lID09PSAnc3RyaW5nJyAmJiBcclxuICAgICAgICAgICBBcnJheS5pc0FycmF5KG9iai5ib29rbWFya0xpc3QpO1xyXG59XHJcblxyXG4vKipcclxuICog6aqM6K+B5piv5ZCm5Li66IqC54K55YiG57uEXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlR3JvdXAob2JqOiBhbnkpOiBvYmogaXMgTm9kZUdyb3VwIHtcclxuICAgIHJldHVybiBvYmogJiYgXHJcbiAgICAgICAgICAgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgXHJcbiAgICAgICAgICAgdHlwZW9mIG9iai5pZCA9PT0gJ3N0cmluZycgJiYgXHJcbiAgICAgICAgICAgdHlwZW9mIG9iai5uYW1lID09PSAnc3RyaW5nJyAmJiBcclxuICAgICAgICAgICBBcnJheS5pc0FycmF5KG9iai5ub2RlTGlzdCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDpqozor4HmmK/lkKbkuLrotYTmupDkuabnrb5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0Fzc2V0Qm9va21hcmsob2JqOiBhbnkpOiBvYmogaXMgQXNzZXRCb29rbWFyayB7XHJcbiAgICByZXR1cm4gb2JqICYmIFxyXG4gICAgICAgICAgIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIFxyXG4gICAgICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gJ3N0cmluZycgJiYgXHJcbiAgICAgICAgICAgdHlwZW9mIG9iai51dWlkID09PSAnc3RyaW5nJyAmJlxyXG4gICAgICAgICAgIHR5cGVvZiBvYmouYXNzZXRUeXBlID09PSAnc3RyaW5nJztcclxufVxyXG5cclxuLyoqXHJcbiAqIOmqjOivgeaYr+WQpuS4uuiKgueCueS5puetvlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzTm9kZUJvb2ttYXJrKG9iajogYW55KTogb2JqIGlzIE5vZGVCb29rbWFyayB7XHJcbiAgICByZXR1cm4gb2JqICYmIFxyXG4gICAgICAgICAgIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIFxyXG4gICAgICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gJ3N0cmluZycgJiYgXHJcbiAgICAgICAgICAgdHlwZW9mIG9iai51dWlkID09PSAnc3RyaW5nJyAmJlxyXG4gICAgICAgICAgIHR5cGVvZiBvYmouc2NlbmVOYW1lID09PSAnc3RyaW5nJztcclxufVxyXG5cclxuLyoqXHJcbiAqIOmqjOivgemZhOWKoOmhuVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQWRkaXRpb25hbEl0ZW0oaXRlbTogYW55KTogaXRlbSBpcyBBZGRpdGlvbmFsSXRlbSB7XHJcbiAgICByZXR1cm4gaXRlbSAmJiBcclxuICAgICAgICAgICB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiZcclxuICAgICAgICAgICB0eXBlb2YgaXRlbS50eXBlID09PSAnc3RyaW5nJyAmJlxyXG4gICAgICAgICAgIHR5cGVvZiBpdGVtLnZhbHVlID09PSAnc3RyaW5nJyAmJlxyXG4gICAgICAgICAgIHR5cGVvZiBpdGVtLm5hbWUgPT09ICdzdHJpbmcnO1xyXG59ICJdfQ==