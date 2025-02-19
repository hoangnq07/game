const API_URL = "https://script.google.com/macros/s/AKfycbxo69H46quZS6iO9kpBjdVc6fT7eSX639F_wkEG1SMdBvXHiklbmbTsNWPgJ5sPUAPSOA/exec"; // Thay bằng URL của bạn

async function saveScore(username, time) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, time })
    });

    if (response.ok) {
        console.log("🔥 Điểm số đã lưu thành công!");
    } else {
        console.error("❌ Lỗi khi lưu điểm:", await response.text());
    }
}