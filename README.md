
# 🛒 QCompare – Product Price Comparison Engine

**QCompare** is an intelligent full-stack price comparison app that scrapes and compares real-time product data from quick-commerce platforms like **Blinkit**, **Zepto**, and **Swiggy Instamart**, helping users make smarter purchase decisions.

Built with `React.js`, `Node.js`, `Express`, and `Puppeteer`, powered by smart matching logic using `Fuse.js`, token-based Jaccard similarity, and custom normalization.

---

## ✨ Features

- ✅ Real-time scraping of product data from Blinkit, Zepto & Swiggy Instamart
- 📍 Location-based scraping via user pincode
- 📦 Extracts product name, image, price, delivery time, availability, and quantity
- 🧠 AI-based product matching using token similarity and Fuse.js
- 🧩 Matches platform-specific quantity variants
- ⚡ Optimized parallel scraping for performance
- 📊 Unified response format with matched & unmatched entries
- 💻 Clean frontend built with **React + Tailwind CSS**
- 🔐 Robust error handling and modular scraper architecture

---

## 📸 Demo

Demo Video [(https://drive.google.com/file/d/1mY9_hEG6TmIUM_8qGktY7P4yMnvIIRv-/view?usp=drive_link)]


> 🧪 In the demo, we show how a user enters their pincode and desired product (e.g. "Amul Butter") to instantly compare prices, delivery time, and availability across platforms.

---

## 🧱 Tech Stack

| Layer        | Tech Stack                          |
|--------------|--------------------------------------|
| Frontend     | React.js, Tailwind CSS               |
| Backend      | Node.js, Express.js                  |
| Scraping     | Puppeteer (Blinkit, Zepto, Swiggy)   |
| Matching     | Jaccard Similarity, Fuse.js          |
| API Layer    | REST (Axios)                         |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/srishtayal/QCompare.git
cd QCompare

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
````

---

## 🧪 Running the App

```bash
# Start backend
cd backend
npm start

# Start frontend
cd ../frontend
npm run dev
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:3000](http://localhost:3000)

---

## 🔍 How Matching Works

* Product names are first **normalized** and **tokenized**
* Uses **Jaccard similarity** on token sets across platforms
* Custom logic handles:

  * Brand/variant mismatch (`Amul Butter 500g` vs `Amul Pasteurized Butter`)
  * Quantity variations (`1 L`, `1L`, `1000 ml`)
  * Sold out / Unavailable scenarios

---

## 🛠 Folder Structure

```
QCompare/
├── backend/
│   ├── scrapers/
│   ├── utils/
│   ├── index.js
├── frontend/
│   ├── src/
│   ├── App.jsx
│   ├── components/
│   ├── services/
├── README.md
```

---

## 📦 Use Cases

* 🔍 Find the cheapest platform for daily groceries
* 📉 Track delivery time and availability
* ⏰ Save time comparing prices manually
* 📬 Could be extended for price alerts, historical tracking

---

## 🔐 Environment Variables

Create `.env` files (if required) for secrets like future APIs, Redis, or DB integrations.

---

## 🤝 Contributors

👩‍💻 [Srishti Tayal](https://github.com/srishtayal)
👨‍💻 [Aditya Raj Singh](https://github.com/adityars06)

---

## ⭐️ Support

If you found this project helpful, feel free to ⭐ the repo, fork it, and share feedback!

> Have ideas for improvements or want to contribute? Open a PR or drop us a message. We'd love to collaborate!

