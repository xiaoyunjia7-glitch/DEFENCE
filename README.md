# 家齐新星防御 (Jiaqi Nova Defense)

一个经典的导弹指挥官风格塔防游戏。保护你的城市免受坠落火箭的攻击。

## 部署到 Vercel 指南

1. **上传到 GitHub**:
   - 在 GitHub 上创建一个新的仓库。
   - 将此代码推送到仓库：
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin <你的仓库URL>
     git push -u origin main
     ```

2. **连接到 Vercel**:
   - 登录 [Vercel](https://vercel.com)。
   - 点击 "Add New" -> "Project"。
   - 导入你的 GitHub 仓库。
   - Vercel 会自动识别 Vite 配置。
   - 点击 "Deploy"。

## 技术栈
- React 19
- Vite
- Tailwind CSS 4
- Motion (Framer Motion)
- Lucide React (图标)

## 核心玩法
- 点击屏幕发射拦截导弹。
- 拦截导弹爆炸产生的范围伤害可以摧毁敌方火箭。
- 保护 6 座城市和 3 座炮台。
- 达到 1000 分即可获胜。
