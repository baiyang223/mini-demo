export async function startRecording() {
    return new Promise((resolve, reject) => {
        try {
            if (!recorderManager) {
                var recorderManager = uni.getRecorderManager();
            }
            // 是否开启录音权限
            let permission = plus.navigator.checkPermission('RECORD');
            if (permission == 'authorized') {
                // 应用有录音权限，可以进行录音操作
                recorderManager.start({
                    duration: profile.duration // 录音时长：3分钟
                });
            } else {
                // 应用没有录音权限，可能需要请求用户授予录音权限
                // 或者显示一个提示，告知用户需要录音权限才能进行操作
                reject('应用没有录音权限');
            }
        } catch (e) {
            // 如果出现错误，调用 reject 函数并传递错误信息
            reject('请在app和小程序端体验录音，Uni官方明确H5不支持getRecorderManager, 详情查看Uni官方文档');
        }
    });
}
