function checkCreatorTypesVersion() {
    try {
        const packageJson = require('../package.json');
        const dependencies = packageJson.dependencies || {};
        const creatorTypes = dependencies['@cocos/creator-types'];
        
        if (!creatorTypes) {
            console.log('No @cocos/creator-types dependency found');
            return;
        }

        const version = creatorTypes.toString();
        if (version.includes('3.')) {
            return;
        }

        throw new Error(`Creator types version ${version} is not compatible with this extension`);
    } catch (e) {
        console.warn('Failed to check Creator types version:', e);
        // 不阻止安装继续进行
        return;
    }
}

function main() {
    try {
        checkCreatorTypesVersion();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();