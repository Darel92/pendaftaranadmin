const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN_BOT = "8017274977:AAGonzixUns6wo0chSKgyw3BveSQDuQd2oM";
const ADMIN_CHAT_ID = "8105758234";

let steamHexVerified = new Set(); // Menyimpan daftar Steam Hex yang diverifikasi

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public")); // Untuk menyajikan index.html

// Endpoint untuk verifikasi Steam Hex
app.get("/verifikasi", (req, res) => {
    const { steam_hex } = req.query;
    if (steamHexVerified.has(steam_hex)) {
        res.json({ terverifikasi: true });
    } else {
        res.json({ terverifikasi: false });
    }
});

// Endpoint untuk menerima pendaftaran
app.post("/submit", async (req, res) => {
    const { steam_hex, nama_ic, nama_ooc, umur_ooc } = req.body;

    if (!steamHexVerified.has(steam_hex)) {
        return res.status(400).send("Steam Hex belum diverifikasi!");
    }

    const message = `📌 *Pendaftaran Admin/Helper*\n\n` +
        `🔹 *Steam Hex:* ${steam_hex}\n` +
        `🔹 *Nama IC:* ${nama_ic}\n` +
        `🔹 *Nama OOC:* ${nama_ooc}\n` +
        `🔹 *Umur OOC:* ${umur_ooc}`;

    await fetch(`https://api.telegram.org/bot${TOKEN_BOT}/sendMessage?chat_id=${ADMIN_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`);
    res.send("Pendaftaran berhasil dikirim!");
});

// Telegram Bot untuk verifikasi Steam Hex
app.post(`/telegram/${TOKEN_BOT}`, async (req, res) => {
    const message = req.body.message;
    if (!message || !message.text || !message.chat) return res.sendStatus(200);

    const chat_id = message.chat.id;
    const text = message.text.trim();

    if (chat_id.toString() !== ADMIN_CHAT_ID) return res.sendStatus(200);

    if (text.startsWith("/verif ")) {
        const steam_hex = text.split(" ")[1];
        if (steam_hex) {
            steamHexVerified.add(steam_hex);
            fetch(`https://api.telegram.org/bot${TOKEN_BOT}/sendMessage?chat_id=${chat_id}&text=Steam Hex ${steam_hex} telah diverifikasi.`);
        }
    }

    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
