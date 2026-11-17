# 🚀 Node.js Multi-Threaded Proxy Checker & Formatter

Công cụ kiểm tra trạng thái sống/chết (Live/Die) của danh sách Proxy tốc độ cao bằng Node.js, tự động phân loại theo mã quốc gia và hỗ trợ chuyển đổi định dạng hàng loạt[cite: 1].

---

## ✨ Tính năng chính

- **Đa luồng tốc độ cao (Multi-threading):** Hỗ trợ chạy đồng thời lên tới 50 luồng (`THREADS = 50`), tối ưu thời gian kiểm tra hàng nghìn proxy[cite: 1].
- **Hỗ trợ đa định dạng đầu vào:** Tự động nhận diện và xử lý các định dạng `IP:PORT`, `IP:PORT:USER:PASS`, hoặc `http://...`[cite: 1].
- **Phân loại thông minh:**
  - Tách riêng proxy **Live**, **Die**, và **Lỗi phản hồi (Live-Err)**[cite: 1].
  - Tự động chia các proxy Live thành từng file riêng biệt theo mã quốc gia (ví dụ: `VN.txt`, `US.txt`, `SG.txt`...) thông qua API của `ip-api.com`[cite: 1].
- **Chuyển đổi định dạng hàng loạt:** Tích hợp sẵn công cụ format lại file `live.txt` từ dạng `IP:PORT:USER:PASS` sang chuẩn URL `http://USER:PASS@IP:PORT` để dễ dàng nạp vào các phần mềm/trình duyệt khác[cite: 1].

---

## 🛠️ Yêu cầu cài đặt

1. Cài đặt **Node.js** (phiên bản 14.x trở lên).
2. Tải mã nguồn về máy và mở Terminal/CMD tại thư mục chứa file `full.js`.
3. Cài đặt các thư viện phụ thuộc bằng lệnh:

```bash
npm init -y
npm install axios https-proxy-agent readline-sync
```

---

## ⚙️ Cấu hình tùy chỉnh

Bạn có thể thay đổi các thông số mặc định ở đầu file `full.js` tùy theo cấu hình máy và mạng:

```javascript
const INPUT_FILE = "proxies.txt"; // Tên file chứa danh sách proxy đầu vào
const LIVE_FILE = "live.txt";     // Tên file lưu proxy hoạt động tốt
const TIMEOUT = 15000;            // Thời gian chờ tối đa cho mỗi proxy (15000ms = 15 giây)
const THREADS = 50;               // Số luồng chạy song song cùng lúc
```[cite: 1]

---

## 📥 Dữ liệu đầu vào (Input)

Tạo một file tên là **`proxies.txt`** nằm cùng thư mục với file `full.js`. Mỗi dòng chứa 1 proxy theo một trong các định dạng sau:

```text
192.168.1.1:8080
103.152.165.10:3128:user123:pass456
[http://user123:pass456@45.77.12.34:8000](http://user123:pass456@45.77.12.34:8000)
[http://12.34.56.78:8888](http://12.34.56.78:8888)
```[cite: 1]

---

## 🚀 Hướng dẫn sử dụng

Chạy chương trình bằng lệnh:

```bash
node full.js
```

Màn hình sẽ hiển thị menu gồm 2 chức năng:

### Chức năng 1: Kiểm tra Proxy (`Chọn 1`)
- Tool sẽ đọc toàn bộ danh sách từ `proxies.txt` và tiến hành kiểm tra kết nối[cite: 1].
- Trạng thái từng proxy sẽ được in trực tiếp ra màn hình console với màu sắc phân biệt (`[LIVE]` xanh lá, `[LIVE-ERR]` vàng, `[DIE]` đỏ)[cite: 1].

### Chức năng 2: Sửa định dạng file `live.txt` (`Chọn 2`)
- Yêu cầu: Đã chạy Chức năng 1 và có sẵn file `live.txt`[cite: 1].
- Tool sẽ quét toàn bộ file `live.txt`, tìm các dòng đang ở dạng `IP:PORT:USER:PASS` và ghi đè trực tiếp thành chuẩn `http://USER:PASS@IP:PORT`[cite: 1].

---

## 📤 Kết quả đầu ra (Output)

Sau khi chạy xong Chức năng 1, hệ thống sẽ tự động xuất ra các file `.txt` ngay tại thư mục gốc:

| Tên File | Mô tả chi tiết |
| :--- | :--- |
| **`live.txt`** | Chứa toàn bộ proxy hoạt động tốt và kết nối thành công tới máy chủ kiểm tra[cite: 1]. |
| **`<MÃ_QUỐC_GIA>.txt`** | Các file tách riêng theo quốc gia của IP (Ví dụ: `US.txt`, `VN.txt`, `DE.txt`, `UNKNOWN.txt`)[cite: 1]. |
| **`die.txt`** | Chứa các proxy không thể kết nối, bị từ chối hoặc quá thời gian chờ (`TIMEOUT`)[cite: 1]. |
| **`err.txt`** | Chứa các proxy kết nối được nhưng không trả về dữ liệu IP hợp lệ (`[LIVE-ERR]`)[cite: 1]. |

### Ví dụ kết quả sau khi chạy Chức năng 2 trên `live.txt`:
* **Trước khi format:** `103.152.165.10:3128:user123:pass456`
* **Sau khi format:** `http://user123:pass456@103.152.165.10:3128`[cite: 1]

---

## ⚠️ Lưu ý

- **Ghi nối dữ liệu (Append):** Chức năng 1 sử dụng cơ chế ghi nối tiếp vào cuối file (`appendFileSync`)[cite: 1]. Nếu bạn muốn kiểm tra một danh sách mới hoàn toàn, hãy xóa hoặc đổi tên các file kết quả cũ (`live.txt`, `die.txt`, `err.txt`...) trước khi chạy lại để tránh trùng lặp dữ liệu.
- **Giới hạn API:** Tool sử dụng endpoint miễn phí của `ip-api.com` để kiểm tra IP và quốc gia[cite: 1]. Nếu chạy số lượng proxy quá lớn trong thời gian ngắn, IP máy của bạn hoặc proxy có thể gặp giới hạn tần suất (Rate Limit) từ phía API.

Channel 

Free Airdrop Channel: https://t.me/Vietmmo_Aidrop

Discord Channel: https://discord.com/invite/uw7dCDbnJu

Purchase Keyline: https://web.telegram.org/k/#@ToolAirDrop_Bot
