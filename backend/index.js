import express from "express";
import cors from "cors";
import weatherRoutes from "./routes/weather.js"
import path from "path";


const __dirname = path.resolve();
const app = express();


app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

app.use("/data", weatherRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    });
}

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})