const express = require("express");const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Ridz Storey Backend aktif 🚀");
});

// Membuat order
app.post("/api/order", (req, res) => {

    const {
        product,
        package,
        price,
        userId,
        serverId
    } = req.body;

    if (!product || !package || !price) {
        return res.status(400).json({
            success: false,
            message: "Data order belum lengkap."
        });
    }

    const order = {
        orderId: "RZ-" + Date.now(),
        product,
        package,
        price,
        userId: userId || null,
        serverId: serverId || null,
        status: "PENDING"
    };

    console.log("Order baru:", order);

    res.json({
        success: true,
        message: "Order berhasil dibuat.",
        order
    });
});

app.post("/api/midtrans/webhook", (req, res) => {

    console.log("Notifikasi Midtrans diterima:");
    console.log(req.body);

    res.status(200).json({
        success: true
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
