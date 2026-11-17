const fs = require('fs');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const readlineSync = require('readline-sync');

// --- CẤU HÌNH ---
const INPUT_FILE = "proxies.txt";
const LIVE_FILE = "live.txt"; // File sẽ được format ở chức năng 2
const TIMEOUT = 15000; // 15 giây
const THREADS = 50;

// Hàm lưu kết quả vào file
function saveResult(filename, proxyStr) {
    try {
        fs.appendFileSync(filename, `${proxyStr}\n`, 'utf8');
    } catch (err) {
        // Bỏ qua lỗi ghi file nếu có
    }
}

// Chuyển đổi định dạng proxy để sử dụng
function parseProxy(proxyStr) {
    proxyStr = proxyStr.trim();
    if (proxyStr.startsWith("http")) return proxyStr;

    const parts = proxyStr.split(':');
    if (parts.length === 4) {
        // IP:PORT:USER:PASS -> http://user:pass@ip:port
        const [ip, port, user, pw] = parts;
        return `http://${user}:${pw}@${ip}:${port}`;
    } else if (parts.length === 2) {
        return `http://${proxyStr}`;
    }
    return `http://${proxyStr}`;
}

async function checkProxy(rawProxy) {
    if (!rawProxy.trim()) return;

    const formattedProxy = parseProxy(rawProxy);
    const agent = new HttpsProxyAgent(formattedProxy);

    try {
        const response = await axios.get("http://ip-api.com/json/", {
            httpAgent: agent,
            httpsAgent: agent,
            timeout: TIMEOUT,
            validateStatus: false 
        });

        const data = response.data;
        if (data && data.status === "success") {
            const countryCode = data.countryCode || "UNKNOWN";
            console.log(`\x1b[32m[LIVE]\x1b[0m ${rawProxy} -> ${countryCode}`);
            // Lưu vào live.txt và file quốc gia
            saveResult(LIVE_FILE, rawProxy);
            saveResult(`${countryCode}.txt`, rawProxy);
        } else {
            console.log(`\x1b[33m[LIVE-ERR]\x1b[0m ${rawProxy}`);
            saveResult("err.txt", rawProxy);
        }
    } catch (error) {
        console.log(`\x1b[31m[DIE]\x1b[0m ${rawProxy}`);
        saveResult("die.txt", rawProxy);
    }
}

// Chức năng 2: Sửa định dạng trực tiếp file live.txt
function reformatLiveFileInplace() {
    if (!fs.existsSync(LIVE_FILE)) {
        console.log(`Lỗi: Không tìm thấy file ${LIVE_FILE}! Hãy chạy chức năng 1 trước.`);
        return;
    }

    const content = fs.readFileSync(LIVE_FILE, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    
    let count = 0;
    const newLines = lines.map(line => {
        const parts = line.split(':');
        // Kiểm tra nếu là định dạng IP:PORT:USER:PASS
        if (parts.length === 4 && !line.toLowerCase().startsWith("http")) {
            const [ip, port, user, pw] = parts;
            count++;
            return `http://${user}:${pw}@${ip}:${port}`;
        }
        return line;
    });

    fs.writeFileSync(LIVE_FILE, newLines.join('\n') + '\n', 'utf8');
    console.log("--------------------------------------------------");
    console.log(`THÀNH CÔNG! Đã sửa và ghi đè ${count} proxy trong file ${LIVE_FILE}.`);
    console.log("--------------------------------------------------");
}

async function runChecker(proxyList) {
    const total = proxyList.length;
    let index = 0;

    async function worker() {
        while (index < total) {
            const currentIndex = index++; 
            const currentProxy = proxyList[currentIndex];
            if (currentProxy) {
                await checkProxy(currentProxy);
            }
        }
    }

    const workers = [];
    const numWorkers = Math.min(THREADS, total);
    for (let i = 0; i < numWorkers; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);
    console.log("\nHOÀN THÀNH KIỂM TRA!");
}

async function main() {
    console.log("=== TOOL PROXY TOOL (NODEJS VERSION) ===");
    console.log("1. Kiểm tra Proxy (Đọc proxies.txt -> Lọc Live/Die)");
    console.log("2. Sửa định dạng file live.txt (IP:PORT:USER:PASS -> http://USER:PASS@IP:PORT)");
    
    const choice = readlineSync.question("Chon chuc nang (1/2): ");

    if (choice === "1") {
        if (!fs.existsSync(INPUT_FILE)) {
            console.log(`Lỗi: Không tìm thấy file ${INPUT_FILE}!`);
            return;
        }
        const proxyList = fs.readFileSync(INPUT_FILE, 'utf8')
                            .split(/\r?\n/)
                            .filter(line => line.trim());
                            
        console.log(`Đã nạp ${proxyList.length} proxy. Đang kiểm tra với ${THREADS} luồng...`);
        await runChecker(proxyList);
    } else if (choice === "2") {
        reformatLiveFileInplace();
    } else {
        console.log("Lựa chọn không hợp lệ.");
    }
}

main();