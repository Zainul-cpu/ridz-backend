const express = require("express");const cors = require("cors");
const midtransClient = require("midtrans-client");

const app = express();

app.use(cors());
app.use(express.json());

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

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

app.post("/api/payment", async (req, res) => {

    try {

        const {
            orderId,
            product,
            package,
            price
        } = req.body;

        if (!orderId || !product || !package || !price) {
            return res.status(400).json({
                success: false,
                message: "Data pembayaran belum lengkap."
            });
        }

        const grossAmount = Number(
            String(price).replace(/\D/g, "")
        );

        if (!grossAmount || grossAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Nominal pembayaran tidak valid."
            });
        }

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount
            },

            item_details: [
                {
                    id: package,
                    price: grossAmount,
                    quantity: 1,
                    name: `${product} - ${package}`
                }
            ]
        };

        const transaction = await snap.createTransaction(parameter);

        res.json({
            success: true,
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });

    } catch (error) {

        console.error("Gagal membuat pembayaran:", error);

        res.status(500).json({
            success: false,
            message: "Gagal membuat pembayaran."
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
