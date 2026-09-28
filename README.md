# ☕ Cafe Livre
### *A Short Story Store*

> **A cozy corner for stories you can finish in one sitting.**  
> Discover a story, read the opening, and find the ones that stay with you.

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

---

## ✦ About

**Cafe Livre** is a cozy web-based short story marketplace designed around the experience of discovering and reading short fiction.

Instead of browsing a conventional online bookstore, readers can explore a curated shelf of stories, preview their openings, save favorites, add stories to a cart, purchase them, and keep them in a personal library.

The project is currently a **frontend/demo application**, with application data and user state persisted locally in the browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📚 **Story Shelf** | Browse a collection of short stories |
| 🏷️ **Genre Filtering** | Filter stories by genre |
| 👀 **Story Preview** | Read the opening before continuing |
| ⭐ **Ratings & Responses** | Rate stories and leave responses |
| ♡ **Wishlist** | Save stories for later |
| 🛒 **Shopping Cart** | Add and manage stories before checkout |
| 💳 **Checkout** | Demo checkout with multiple payment options |
| 🎟️ **Promo Offers** | Apply available promotional codes |
| 📖 **Personal Library** | Access purchased stories |
| 👤 **User Accounts** | Sign up, log in, and log out |
| ✍️ **Seller Accounts** | List new stories on the shelf |
| 🌙 **Theme Toggle** | Switch between available visual themes |
| 💾 **Persistent State** | Save app data using browser `localStorage` |
| 📱 **Responsive UI** | Designed for different screen sizes |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| ⚛️ **React 18** | UI and component architecture |
| ⚡ **Vite 5** | Development server and build tooling |
| 🟨 **JavaScript** | Application logic |
| 🎨 **CSS** | Styling and responsive interface |
| 🔍 **ESLint** | Code quality and linting |
| 💾 **localStorage** | Client-side persistence |

> **No backend or external database is currently required.**

---

## 📂 Project Structure

```text
Cafe Livre - A Short Story Store/
│
├── 📄 README.md
│
└── 📁 short_story_store_app/
    │
    ├── 📁 src/
    │   ├── 📁 components/
    │   │   ├── AuthModal.jsx
    │   │   ├── BrandMark.jsx
    │   │   ├── CartDrawer.jsx
    │   │   ├── CheckoutModal.jsx
    │   │   ├── Footer.jsx
    │   │   ├── GenreFilter.jsx
    │   │   ├── Header.jsx
    │   │   ├── Hero.jsx
    │   │   ├── LibraryDrawer.jsx
    │   │   ├── RatingStars.jsx
    │   │   ├── SellModal.jsx
    │   │   ├── StoryCard.jsx
    │   │   ├── StoryGrid.jsx
    │   │   ├── StoryModal.jsx
    │   │   ├── TeaSteamArt.jsx
    │   │   └── ThemeToggle.jsx
    │   │
    │   ├── 📁 data/
    │   │   ├── offers.js
    │   │   ├── seedActivity.js
    │   │   ├── stories.js
    │   │   └── users.js
    │   │
    │   ├── 📁 state/
    │   │   └── store.jsx
    │   │
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    ├── index.html
    ├── package.json
    ├── eslint.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Noor-E-Jannat20/Cafe-Livre.git
cd Cafe-Livre
```

### 2. Enter the application directory

```bash
cd short_story_store_app
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite will provide a local development URL, usually:

```text
http://localhost:5173
```

---

## 📜 Available Scripts

Run these commands from `short_story_store_app/`.

| Command | What it does |
|---|---|
| `npm run dev` | ⚡ Start the development server |
| `npm run build` | 📦 Create a production build |
| `npm run preview` | 👀 Preview the production build |
| `npm run lint` | 🔍 Run ESLint |

---

## 🧪 Demo Accounts

The project includes seed accounts for testing:

| Account | Username | Password |
|---|---|---|
| 📖 Reader | `reader.demo` | `reader123` |
| ✍️ Seller | `priya.sundaram` | `seller123` |

> ⚠️ These are **demo credentials only**. They are included in the frontend seed data and should never be treated as real authentication credentials.

---

## 💾 Data & Storage

Cafe Livre currently uses the browser's `localStorage` to persist application state.

This includes:

- 👤 Current session
- 👥 Users
- 📚 Stories
- ♡ Wishlist
- 🛒 Cart
- ⭐ Ratings
- 💬 Responses
- 📦 Orders
- 📖 Purchases
- 🎨 Theme preference
- 🎟️ Promotional offers

Because the data is stored locally, it belongs to the current browser/device and is **not synchronized between users**.

---

## ✍️ Adding & Editing Stories

The initial story catalogue can be edited here:

```text
short_story_store_app/src/data/stories.js
```

Story entries contain information such as:

- Title
- Author
- Seller
- Genre
- Reading time
- Price
- Sales count
- Short description
- Full story text

The application also provides a **List a Story** interface for adding stories during runtime.

---

## 🔐 Production Considerations

Cafe Livre is currently a **frontend/demo application**.

For a production release, the following would need a real backend:

- 🔑 Secure authentication
- 🔒 Password hashing
- 🗄️ Database storage
- 💳 Real payment processing
- 📦 Order processing
- 👤 Server-side user management
- ✍️ Seller management
- 🛡️ Server-side validation
- 🚫 Authorization and access control

### Important

**Never store real passwords, payment information, or sensitive personal data in frontend source code or plain `localStorage`.**

---

## 📦 Production Build

Create a production build with:

```bash
npm run build
```

The generated files will be placed in:

```text
short_story_store_app/dist/
```

The project can then be deployed to a static hosting service such as:

- GitHub Pages
- Netlify
- Vercel

---

## 🤝 Contributing

Contributions are welcome.

If you're working with the repository as a collaborator, a simple workflow is:

### 1. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make your changes

Test the application locally and make sure your changes work as expected.

### 3. Check the project

```bash
npm run lint
npm run build
```

### 4. Commit your changes

```bash
git add .
git commit -m "Describe your changes"
```

### 5. Push your branch

```bash
git push -u origin feature/your-feature-name
```

### 6. Open a Pull Request

Open a Pull Request on GitHub and describe what you changed.

> 💡 Keeping `main` stable and using feature branches makes collaboration much safer.

---

## 🗺️ Future Possibilities

Some natural directions for expanding Cafe Livre include:

- ☁️ Real backend and database
- 🔐 Secure authentication
- 💳 Real payment integration
- 📧 Email notifications
- 🔎 Advanced story search
- 📊 Seller analytics
- 📱 Progressive Web App support
- 🌐 Cloud-synced personal libraries
- 📝 Richer author profiles
- 💬 More advanced reviews and discussions

---

## 📄 License

No license has currently been specified for this project.

If the repository is intended to be publicly reused or modified, consider adding an appropriate open-source license.

---

<p align="center">
  <strong>☕ Cafe Livre</strong><br>
  <em>Where every cup holds a story.</em>
</p>
