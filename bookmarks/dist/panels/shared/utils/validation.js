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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS9wYW5lbHMvc2hhcmVkL3V0aWxzL3ZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUE7O0dBRUc7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFZO0lBQzFDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7QUFDdkQsQ0FBQztBQUZELDhDQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixZQUFZLENBQUMsR0FBUTtJQUNqQyxPQUFPLEdBQUc7UUFDSCxPQUFPLEdBQUcsS0FBSyxRQUFRO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLEVBQUUsS0FBSyxRQUFRO1FBQzFCLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRO1FBQzVCLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFORCxvQ0FNQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsV0FBVyxDQUFDLEdBQVE7SUFDaEMsT0FBTyxHQUFHO1FBQ0gsT0FBTyxHQUFHLEtBQUssUUFBUTtRQUN2QixPQUFPLEdBQUcsQ0FBQyxFQUFFLEtBQUssUUFBUTtRQUMxQixPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUTtRQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBTkQsa0NBTUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGVBQWUsQ0FBQyxHQUFRO0lBQ3BDLE9BQU8sR0FBRztRQUNILE9BQU8sR0FBRyxLQUFLLFFBQVE7UUFDdkIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDNUIsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQztBQUM3QyxDQUFDO0FBTkQsMENBTUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxHQUFRO0lBQ25DLE9BQU8sR0FBRztRQUNILE9BQU8sR0FBRyxLQUFLLFFBQVE7UUFDdkIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDNUIsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQztBQUM3QyxDQUFDO0FBTkQsd0NBTUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLHNCQUFzQixDQUFDLElBQVM7SUFDNUMsT0FBTyxJQUFJO1FBQ0osT0FBTyxJQUFJLEtBQUssUUFBUTtRQUN4QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUTtRQUM3QixPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUTtRQUM5QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO0FBQ3pDLENBQUM7QUFORCx3REFNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0R3JvdXAsIE5vZGVHcm91cCwgQXNzZXRCb29rbWFyaywgTm9kZUJvb2ttYXJrLCBBZGRpdGlvbmFsSXRlbSB9IGZyb20gJy4uL3R5cGVzL2NvbW1vbic7XG5cbi8qKlxuICog6aqM6K+B5YiG57uE5ZCN56ewXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUdyb3VwTmFtZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbmFtZS50cmltKCkubGVuZ3RoID4gMCAmJiBuYW1lLmxlbmd0aCA8PSAyMDtcbn1cblxuLyoqXG4gKiDpqozor4HmmK/lkKbkuLrotYTmupDliIbnu4RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXNzZXRHcm91cChvYmo6IGFueSk6IG9iaiBpcyBBc3NldEdyb3VwIHtcbiAgICByZXR1cm4gb2JqICYmIFxuICAgICAgICAgICB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBcbiAgICAgICAgICAgdHlwZW9mIG9iai5pZCA9PT0gJ3N0cmluZycgJiYgXG4gICAgICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gJ3N0cmluZycgJiYgXG4gICAgICAgICAgIEFycmF5LmlzQXJyYXkob2JqLmJvb2ttYXJrTGlzdCk7XG59XG5cbi8qKlxuICog6aqM6K+B5piv5ZCm5Li66IqC54K55YiG57uEXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vZGVHcm91cChvYmo6IGFueSk6IG9iaiBpcyBOb2RlR3JvdXAge1xuICAgIHJldHVybiBvYmogJiYgXG4gICAgICAgICAgIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIFxuICAgICAgICAgICB0eXBlb2Ygb2JqLmlkID09PSAnc3RyaW5nJyAmJiBcbiAgICAgICAgICAgdHlwZW9mIG9iai5uYW1lID09PSAnc3RyaW5nJyAmJiBcbiAgICAgICAgICAgQXJyYXkuaXNBcnJheShvYmoubm9kZUxpc3QpO1xufVxuXG4vKipcbiAqIOmqjOivgeaYr+WQpuS4uui1hOa6kOS5puetvlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBc3NldEJvb2ttYXJrKG9iajogYW55KTogb2JqIGlzIEFzc2V0Qm9va21hcmsge1xuICAgIHJldHVybiBvYmogJiYgXG4gICAgICAgICAgIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIFxuICAgICAgICAgICB0eXBlb2Ygb2JqLm5hbWUgPT09ICdzdHJpbmcnICYmIFxuICAgICAgICAgICB0eXBlb2Ygb2JqLnV1aWQgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgIHR5cGVvZiBvYmouYXNzZXRUeXBlID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiDpqozor4HmmK/lkKbkuLroioLngrnkuabnrb5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9kZUJvb2ttYXJrKG9iajogYW55KTogb2JqIGlzIE5vZGVCb29rbWFyayB7XG4gICAgcmV0dXJuIG9iaiAmJiBcbiAgICAgICAgICAgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgXG4gICAgICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gJ3N0cmluZycgJiYgXG4gICAgICAgICAgIHR5cGVvZiBvYmoudXVpZCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgdHlwZW9mIG9iai5zY2VuZU5hbWUgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIOmqjOivgemZhOWKoOmhuVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVBZGRpdGlvbmFsSXRlbShpdGVtOiBhbnkpOiBpdGVtIGlzIEFkZGl0aW9uYWxJdGVtIHtcbiAgICByZXR1cm4gaXRlbSAmJiBcbiAgICAgICAgICAgdHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgIHR5cGVvZiBpdGVtLnR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgIHR5cGVvZiBpdGVtLnZhbHVlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICB0eXBlb2YgaXRlbS5uYW1lID09PSAnc3RyaW5nJztcbn0gIl19