# 🌧️ Precipitation Monitor

A full-stack web application for monitoring and visualizing precipitation data across Nepal. Built with a Node.js backend and a React frontend, with data preprocessing handled via Jupyter Notebook.

🔗 **Live Demo:** [precipitation-monitor.onrender.com](https://precipitation-monitor.onrender.com)

---

## 📌 Features

- 📊 Interactive precipitation data visualization for Nepal
- 🗺️ Location-based rainfall monitoring
- 📁 Clean and processed dataset via Jupyter Notebook pipeline
- 🌐 Full-stack architecture with REST API backend
- ☁️ Deployed on Render

---

## 🗂️ Project Structure

```
Precipitation-Monitor/
├── backend/           # Node.js server & API
├── frontend/          # Frontend UI (React)
├── data-clean.ipynb   # Jupyter Notebook for data cleaning & preprocessing
├── package.json       # Root-level Node.js dependencies
└── .gitignore
```

---

## 🛠️ Tech Stack

| Layer        | Technology              |
|--------------|-------------------------|
| Frontend     | React,Leaflet           |
| Backend      | Node.js, Express        |
| Data Science | Python, Jupyter Notebook |
| Deployment   | Render                  |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or above)
- [Python](https://www.python.org/) (v3.8 or above)
- [Jupyter Notebook](https://jupyter.org/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SwaroopDangal/Precipitation-Monitor.git
   cd Precipitation-Monitor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the backend server**

   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Open the frontend**

   Open `frontend/index.html` in your browser, or serve it using a local server.

---

## 📓 Data Preprocessing

The `data-clean.ipynb` notebook handles raw precipitation dataset cleaning, transformation, and export. To run it:

```bash
pip install pandas numpy matplotlib jupyter
jupyter notebook data-clean.ipynb
```

---

## 🌐 Deployment

The application is deployed on **Render**. To deploy your own instance:

1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Set the build and start commands as needed

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request



## 👤 Author

**Swaroop Dangal**
- GitHub: [@SwaroopDangal](https://github.com/SwaroopDangal)
