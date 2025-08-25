# Vue CLI 升级指南 - 支持 Lexical 0.34.0

## 升级原因

当前项目使用 Vue CLI 4.5.19 + Webpack 4.47.0，与 Lexical 0.34.0 存在兼容性问题。
Lexical 0.34.0 需要更现代的构建工具支持。

## 升级方案

### 方案一：升级到 Vue CLI 5.x (推荐)

```bash
# 1. 全局升级 Vue CLI
npm install -g @vue/cli@latest

# 2. 升级项目依赖
vue upgrade

# 3. 手动调整 package.json
```

**需要的 package.json 变更:**

```json
{
  "devDependencies": {
    "@vue/cli-plugin-babel": "~5.0.8",
    "@vue/cli-plugin-eslint": "~5.0.8", 
    "@vue/cli-plugin-router": "~5.0.8",
    "@vue/cli-plugin-vuex": "~5.0.8",
    "@vue/cli-service": "~5.0.8",
    "eslint": "^8.50.0",
    "eslint-plugin-vue": "^9.17.0"
  }
}
```

### 方案二：配置 Webpack 4 支持 (临时方案)

如果暂时不想大幅升级，可以尝试配置：

**vue.config.js 配置:**

```javascript
module.exports = {
  devServer: {
    historyApiFallback: true
  },
  configureWebpack: {
    resolve: {
      alias: {
        // 强制使用 CommonJS 版本
        'lexical': 'lexical/Lexical.dev.js'
      }
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          include: /node_modules\/@?lexical/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-modules-commonjs']
            }
          }
        }
      ]
    }
  }
}
```

## 风险评估

### 升级风险 (Vue CLI 5.x)
- 🔴 **高风险**: 需要测试所有功能
- 🟡 **中风险**: 可能需要调整其他依赖
- 🟢 **低风险**: Vue 3 本身兼容性良好

### 配置方案风险
- 🟡 **中风险**: 可能仍有兼容性问题
- 🟢 **低风险**: 不改变核心依赖

## 推荐做法

**最稳妥的方案:**
继续使用已实现的 `SimpleLexicalEditor.vue`，因为：

1. ✅ **零升级风险**
2. ✅ **功能完整** - 支持所需的富文本功能
3. ✅ **性能更好** - 无额外依赖负担
4. ✅ **维护简单** - 代码在项目内部，完全可控
5. ✅ **兼容性好** - 适用于所有现代浏览器

## 结论

除非有特殊需求必须使用原版 Lexical 的高级功能，否则建议继续使用
当前的 `SimpleLexicalEditor.vue` 实现。
