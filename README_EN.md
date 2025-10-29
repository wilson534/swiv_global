# 🧭 Swiv

> **Learn like TikTok, Match like Tinder — but on Solana.**

An AI-powered social investing app built on Solana, combining AI learning, on-chain reputation, and persona-based matching to create a trustworthy learning community.

---

## ✨ Key Features

### 🎭 PersonaNFT (Persona NFT)
- Non-transferable on-chain investor persona identity
- AI-generated personalized investment profile
- Cross-dApp verifiable identity proof

### 📚 AI Learning Feed
- TikTok-style vertical swipe learning experience
- GPT-4 generated personalized investment content
- Real-time AI assistant for Q&A
- 📊 **Learning Activity Tracking**: On-chain record of learning progress and engagement

### 💞 Trust-based Matching System
- Tinder-style horizontal swipe matching
- Smart recommendations based on on-chain trust score
- Three-dimensional matching: Keywords + Risk Preference + Trust Score
- 🏆 **Growth Level System**: 50-level progression system based on learning contributions

### 🛡️ On-chain Trust Score System
- ⛓️ **Solana On-chain Storage**: Transparent and immutable
- 💯 **Multi-dimensional Calculation**: Matching, chatting, learning, helping others
- 🚀 **Real-time Updates**: Each interaction costs only ~$0.00025
- 👮 **Smart Risk Control**: Dual protection with AI + on-chain reporting

### 🎓 Mentor-Mentee Matching System
- 👨‍🏫 **Mentor Mechanism**: Level 20+ users can become mentors
- 🌱 **Mentee Growth**: Get professional guidance, accelerate learning
- 🎁 **Mutual Rewards**: Mentors gain reputation, mentees gain growth
- 💡 **Knowledge First**: Based on contribution, not wealth

---

## 🏗️ Tech Stack

```
📱 Frontend:  React Native + Expo
🌐 API:       Next.js 14 (App Router)
🔗 Blockchain: Solana (Anchor Framework)
🤖 AI:        OpenAI GPT-4 + LangChain
💾 Database:  Supabase (PostgreSQL)
```

For detailed tech stack, see [`docs/TECH_STACK.md`](./docs/TECH_STACK.md)

---

## 📂 Project Structure

```
swiv/
├── docs/                      # 📚 Complete project documentation
│   ├── PRD_bilingual.md      # Product Requirements Doc (Bilingual)
│   ├── DEVELOPMENT_ROADMAP.md # 4-week Development Roadmap
│   ├── TECH_STACK.md         # Tech Stack Details
│   └── CONTEXT_LOG.md        # Development Context Log
│
├── programs/                  # 🔗 Solana Smart Contracts (Anchor)
│   ├── persona-nft/          # PersonaNFT Program
│   ├── trust-score/          # TrustScore Program
│   └── social-graph/         # SocialGraph Program
│
├── mobile/                    # 📱 React Native Mobile App
│   ├── app/                  # Expo Router Pages
│   │   ├── (auth)/          # Login Pages
│   │   ├── (tabs)/          # Main Tab Pages
│   │   └── persona/         # AI Assessment Page
│   └── components/           # Reusable Components
│
├── api/                       # 🌐 Next.js API Service
│   ├── app/api/              # API Routes
│   │   ├── persona/         # Persona Related
│   │   ├── feed/            # Content Feed
│   │   ├── match/           # Matching Logic
│   │   └── ask/             # AI Q&A
│   └── lib/                 # Utility Libraries
│
└── README.md                  # This File
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI 1.17+
- Anchor CLI 0.29+
- Expo CLI
- Supabase Account
- OpenAI API Key

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/swiv.git
cd swiv
```

### 2️⃣ Install Dependencies

```bash
# Install Solana program dependencies
cd programs/persona-nft && cargo build
cd ../trust-score && cargo build
cd ../social-graph && cargo build

# Install API dependencies
cd ../../api && npm install

# Install mobile dependencies
cd ../mobile && npm install
```

### 3️⃣ Configure Environment Variables

```bash
# API Environment Variables (api/.env.local)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
OPENAI_API_KEY=sk-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx

# Mobile Environment Variables (mobile/.env)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### 4️⃣ Deploy Smart Contracts

```bash
# Configure Solana devnet
solana config set --url devnet
solana-keygen new  # Create wallet
solana airdrop 2   # Get test SOL

# Deploy contracts
cd programs
anchor build
anchor deploy
```

### 5️⃣ Start Services

```bash
# Terminal 1: Start API
cd api && npm run dev

# Terminal 2: Start Mobile App
cd mobile && npx expo start
```

---

## 📖 Documentation

### Core Documentation
- 📋 [Product Requirements (PRD)](./docs/PRD_bilingual.md) - Complete product design and technical specifications
- 🛣️ [Development Roadmap](./docs/DEVELOPMENT_ROADMAP.md) - 4-week development plan and progress tracking
- 🛠️ [Tech Stack Documentation](./docs/TECH_STACK.md) - Detailed technology selection and usage guide
- 📝 [Development Log](./docs/CONTEXT_LOG.md) - Decision records and context management

### Smart Contract Documentation
- [PersonaNFT Program](./programs/persona-nft/README.md) (To be created)
- [TrustScore Program](./programs/trust-score/README.md) (To be created)
- [SocialGraph Program](./programs/social-graph/README.md) (To be created)

### API Documentation
- [API Reference](./api/README.md) (To be created)

---

## 🎯 Roadmap

### ✅ Week 1: Infrastructure
- [x] Project initialization and documentation creation
- [ ] Solana development environment setup
- [ ] React Native project scaffolding
- [ ] Next.js API setup
- [ ] Supabase database configuration

### ⏳ Week 2: Smart Contracts
- [ ] PersonaNFT Program development
- [ ] TrustScore Program development
- [ ] SocialGraph Program development
- [ ] Contract testing and deployment

### ⏳ Week 3: Frontend & API
- [ ] Wallet connection integration
- [ ] AI assessment & NFT minting
- [ ] Feed page
- [ ] Match page
- [ ] Chat system
- [ ] AI API integration

### ⏳ Week 4: Testing & Optimization
- [ ] Functional testing
- [ ] Performance optimization
- [ ] UI/UX refinement
- [ ] Documentation completion
- [ ] Demo production

For complete roadmap, see [`docs/DEVELOPMENT_ROADMAP.md`](./docs/DEVELOPMENT_ROADMAP.md)

---

## 🧪 Testing

```bash
# Smart Contract Testing
cd programs && anchor test

# API Testing
cd api && npm test

# Mobile Testing
cd mobile && npm test
```

---

## 🤝 Contributing

We welcome all forms of contributions!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

Please ensure:
- Code follows project conventions
- Update relevant documentation
- Add appropriate tests
- Commit messages are clear and specific

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details

---

## 👥 Team

**Musketeer (@Musketeer)** - Founder & Developer

---

## 🔗 Links

- 🌐 Website: (Coming soon)
- 📱 Demo: (Coming soon)
- 🐦 Twitter: (Coming soon)
- 💬 Discord: (Coming soon)

---

## 🙏 Acknowledgments

- [Solana Foundation](https://solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [OpenAI](https://openai.com/)
- [Expo](https://expo.dev/)

---

<div align="center">

**Made with ❤️ and ☕ on Solana**

</div>

