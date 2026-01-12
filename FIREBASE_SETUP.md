# Firebase 配置指南

## 步骤1：创建Firebase项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（例如：purchase-management）
4. 按照提示完成项目创建

## 步骤2：启用Realtime Database

1. 在Firebase控制台中，点击左侧菜单的"Realtime Database"
2. 点击"创建数据库"
3. 选择数据库位置（建议选择离您最近的区域）
4. 选择"以测试模式启动"（稍后可以修改规则）

## 步骤3：获取配置信息

1. 在Firebase控制台中，点击项目设置（齿轮图标）
2. 滚动到"您的应用"部分
3. 点击"Web应用"图标（</>）
4. 注册应用（可以随意命名）
5. 复制配置信息

## 步骤4：配置数据库规则

1. 在Realtime Database页面，点击"规则"标签
2. 将规则设置为：

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**注意**：这是公开读写权限，仅用于演示。生产环境请设置适当的权限规则。

## 步骤5：更新代码配置

1. 打开 `script.js` 文件
2. 找到 `firebaseConfig` 对象（大约在第20行）
3. 将步骤3中复制的配置信息填入：

```javascript
const firebaseConfig = {
    apiKey: "你的API密钥",
    authDomain: "你的项目.firebaseapp.com",
    databaseURL: "https://你的项目-default-rtdb.firebaseio.com",
    projectId: "你的项目ID",
    storageBucket: "你的项目.appspot.com",
    messagingSenderId: "你的发送者ID",
    appId: "你的应用ID"
};
```

## 步骤6：测试

1. 刷新网页
2. 添加一条测试记录
3. 在Firebase控制台的Realtime Database中查看数据是否同步
4. 在另一个浏览器或设备上打开同一网页，应该能看到相同的数据

## 安全建议

对于生产环境，建议：

1. 设置身份验证（Authentication）
2. 修改数据库规则，限制读写权限
3. 使用Firebase Security Rules保护数据

示例规则（需要身份验证）：

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```
