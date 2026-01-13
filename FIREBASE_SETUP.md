# Firebase 云存储配置指南

## 步骤 1：创建 Firebase 项目

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击"添加项目"或"创建项目"
3. 输入项目名称（例如：purchase-management）
4. 按照提示完成项目创建

## 步骤 2：启用 Realtime Database

1. 在 Firebase 控制台中，点击左侧菜单的"Realtime Database"
2. 点击"创建数据库"
3. 选择数据库位置（建议选择离您最近的区域，如 `asia-east1`）
4. 选择"以测试模式启动"（稍后需要配置安全规则）
5. 点击"启用"

## 步骤 3：获取 Firebase 配置信息

1. 在 Firebase 控制台中，点击左侧的齿轮图标 ⚙️
2. 选择"项目设置"
3. 滚动到"您的应用"部分
4. 如果没有 Web 应用，点击"</>"图标添加 Web 应用
5. 输入应用昵称（例如：采购管理系统）
6. 点击"注册应用"
7. 复制配置信息（类似下面的格式）：

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-east1.firebasedatabase.app",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 步骤 4：配置数据库安全规则

1. 在 Firebase 控制台中，点击"Realtime Database"
2. 点击"规则"标签页
3. 将规则修改为（允许已登录用户读写）：

```json
{
  "rules": {
    "purchases": {
      ".read": true,
      ".write": true
    }
  }
}
```

**注意**：这是测试规则，允许所有人读写。生产环境应该配置更严格的规则。

## 步骤 5：将配置信息填入代码

打开 `script.js` 文件，找到 `firebaseConfig` 对象（大约在第 11-20 行），将步骤 3 中复制的配置信息填入：

```javascript
const firebaseConfig = {
    apiKey: "你的API_KEY",
    authDomain: "你的AUTH_DOMAIN",
    databaseURL: "你的DATABASE_URL",
    projectId: "你的PROJECT_ID",
    storageBucket: "你的STORAGE_BUCKET",
    messagingSenderId: "你的MESSAGING_SENDER_ID",
    appId: "你的APP_ID"
};
```

## 步骤 6：测试云存储

1. 保存 `script.js` 文件
2. 刷新网页
3. 登录系统
4. 添加一条采购记录
5. 在浏览器顶部应该看到"云端同步"的绿色指示器
6. 在其他电脑上打开相同的网址，应该能看到刚才添加的数据

## 故障排除

### 如果看到"本地存储"而不是"云端同步"
- 检查 Firebase 配置是否正确
- 打开浏览器控制台（F12）查看是否有错误信息
- 确认网络连接正常

### 如果数据无法保存
- 检查数据库安全规则是否正确配置
- 确认数据库 URL 配置正确

### 如果数据无法加载
- 检查数据库安全规则是否允许读取
- 确认数据库中有数据（在 Firebase 控制台的 Realtime Database 中查看）

## 注意事项

1. Firebase 免费版有使用限制，但通常足够个人使用
2. 数据库安全规则很重要，不要在生产环境中使用过于宽松的规则
3. 建议定期备份数据（使用导出功能）
