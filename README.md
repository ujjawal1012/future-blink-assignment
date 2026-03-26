# Future Blink - AI Flow Canvas ⚡

## 🛠️ Tech Stack

- **Frontend:** React, React Flow, Axios, React-Markdown, CSS3.
- **Backend:** Node.js, Express, OpenRouter API.
- **Database:** MongoDB (Mongoose).
- **Styling:** Custom Vanilla CSS (Dark mode).

---

## 📋 Prerequisites

- **Node.js** (v20.19.0+ or v22.12.0+)
- **MongoDB** (Local or Atlas)
- **OpenRouter API Key** (Get one at [openrouter.ai](https://openrouter.ai/))

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd future-blink
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory (api key copy from mail):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/future-blink
OPENROUTER_API_KEY=your_actual_key_here 
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🏃 Run the Project

### Start the Backend
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000`.

### Start the Frontend
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📖 Usage

1. Open the app in your browser.
2. Type a prompt in the **PROMPT INPUT** node (e.g., *"What is HTML? Give me a table of features."*).
3. Click **▶ Run Flow** in the header.
4. Watch the AI "Think" (expand the section to see reasoning) and then stream the final response.
5. Click **💾 Save** to persist the interaction to the database.

---

## 📂 Project Structure

```text
├── backend/
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   ├── .env           # Configuration (ignore in git)
│   └── server.js      # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Custom React Flow nodes
│   │   ├── App.jsx     # Main Logic & Canvas
│   │   └── App.css     # Styling
│   └── package.json
└── README.md
```

## 🤝 Contributing
Feel free to fork this project and submit pull requests for any improvements or new features!
