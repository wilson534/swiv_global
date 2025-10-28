# 🤝 贡献指南 / Contributing Guide

感谢您对 Swiv 项目的关注！我们欢迎所有形式的贡献。

---

## 📋 贡献方式 / Ways to Contribute

### 1. 报告 Bug / Report Bugs
在 GitHub Issues 中创建详细的 bug 报告。

### 2. 提出功能建议 / Suggest Features
在 Issues 中描述您想要的新功能。

### 3. 提交代码 / Submit Code
通过 Pull Request 提交代码改进。

### 4. 改进文档 / Improve Documentation
帮助完善或翻译文档。

### 5. 代码审查 / Code Review
审查其他贡献者的 Pull Requests。

---

## 🚀 开始贡献 / Getting Started

### 1. Fork 仓库

点击右上角的 "Fork" 按钮。

### 2. 克隆到本地

```bash
git clone https://github.com/YOUR_USERNAME/swiv.git
cd swiv
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 4. 安装依赖

```bash
# 安装所有依赖
npm install

# API
cd api && npm install

# Mobile
cd mobile && npm install --legacy-peer-deps
```

### 5. 开发

遵循项目的代码风格和规范。

### 6. 测试

```bash
# 运行测试
npm test

# 类型检查
npx tsc --noEmit

# 代码格式检查
npm run lint
```

### 7. 提交

```bash
git add .
git commit -m "feat: add amazing feature"
git push origin feature/your-feature-name
```

### 8. 创建 Pull Request

在 GitHub 上创建 PR，填写详细的描述。

---

## 📝 提交规范 / Commit Convention

我们使用 [Conventional Commits](https://www.conventionalcommits.org/)：

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

```bash
feat(api): add persona creation endpoint

- Implement GPT-4 persona generation
- Add validation for user answers
- Store persona in database

Closes #123
```

---

## 🎨 代码风格 / Code Style

### TypeScript/JavaScript

- 使用 Prettier 格式化
- 2 空格缩进
- 单引号
- 分号结尾

```typescript
// ✅ 好的例子
const greeting = 'Hello, Swiv!';

function calculateScore(a: number, b: number): number {
  return a + b;
}

// ❌ 不好的例子
const greeting = "Hello, Swiv!"

function calculateScore(a,b){
  return a+b
}
```

### Rust

- 使用 `rustfmt` 格式化
- 遵循 Rust 官方风格指南

```rust
// ✅ 好的例子
pub fn mint_persona_nft(
    ctx: Context<MintPersonaNft>,
    risk_profile: u8,
) -> Result<()> {
    // ...
}

// ❌ 不好的例子
pub fn mint_persona_nft(ctx:Context<MintPersonaNft>,risk_profile:u8)->Result<()>{
    //...
}
```

---

## 🧪 测试要求 / Testing Requirements

### 单元测试

所有新功能必须包含测试。

```typescript
// api/lib/__tests__/matching.test.ts
describe('calculateMatchScore', () => {
  it('should return correct match score', () => {
    const score = calculateMatchScore(userA, userB);
    expect(score).toBeGreaterThan(0);
  });
});
```

### 集成测试

```typescript
// programs/persona-nft/tests/persona-nft.ts
it('should mint PersonaNFT', async () => {
  await program.methods
    .mintPersonaNft(...)
    .rpc();
  
  const account = await program.account.personaNft.fetch(...);
  expect(account.owner.toString()).to.equal(...);
});
```

---

## 📖 文档要求 / Documentation Requirements

### 代码注释

```typescript
/**
 * 计算两个用户的匹配分数
 * 
 * @param userA - 第一个用户
 * @param userB - 第二个用户
 * @returns 匹配分数 (0-100)
 */
export function calculateMatchScore(
  userA: UserProfile,
  userB: UserProfile
): number {
  // ...
}
```

### API 文档

新增 API 端点时，更新 `docs/API_DOCUMENTATION.md`。

### 架构文档

重大架构变更时，更新 `docs/TECH_STACK.md` 和 `docs/PRD_bilingual.md`。

---

## 🔍 代码审查 / Code Review

### 审查者关注点

- 代码质量和可读性
- 测试覆盖率
- 性能影响
- 安全问题
- 文档完整性

### PR 审查清单

- [ ] 代码遵循项目规范
- [ ] 所有测试通过
- [ ] 新功能有测试
- [ ] 文档已更新
- [ ] 无明显性能问题
- [ ] 无安全隐患

---

## 🐛 Bug 报告模板 / Bug Report Template

```markdown
**描述 / Description**
简要描述 bug。

**复现步骤 / Steps to Reproduce**
1. 打开 XX 页面
2. 点击 XX 按钮
3. 看到错误

**预期行为 / Expected Behavior**
应该发生什么。

**实际行为 / Actual Behavior**
实际发生了什么。

**环境 / Environment**
- OS: macOS 13.0
- Browser: Chrome 120
- Node: 18.17.0

**截图 / Screenshots**
（如有必要）

**额外信息 / Additional Context**
其他相关信息。
```

---

## 💡 功能建议模板 / Feature Request Template

```markdown
**功能描述 / Feature Description**
简要描述建议的功能。

**使用场景 / Use Case**
这个功能解决什么问题？

**建议方案 / Proposed Solution**
您认为应该如何实现？

**替代方案 / Alternatives**
其他可能的解决方案。

**优先级 / Priority**
- [ ] 高
- [ ] 中
- [ ] 低
```

---

## 🎁 奖励 / Rewards

### 贡献者名单

所有贡献者将被添加到 README.md 的致谢名单。

### Top Contributors

每月活跃的贡献者将获得特别徽章。

---

## 📞 联系我们 / Contact

- GitHub Issues: https://github.com/YOUR_USERNAME/swiv/issues
- Discord: TBD
- Email: team@swiv.app

---

## 🙏 致谢 / Acknowledgments

感谢所有为 Swiv 做出贡献的开发者！

---

**维护者：** @Musketeer
**最后更新：** 2025-10-24




