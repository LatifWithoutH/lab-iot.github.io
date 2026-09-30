// ============================================
// AUTO-GENERATED ARDUINO TEMPLATES
// Jangan edit file ini secara manual. Jalankan generate_templates.py
// ============================================

const ARDUINO_TEMPLATES = {
    "modul04": `
// ============================================
// MODUL 04 - KENDALI OUTPUT DIGITAL
// LED, Buzzer, Relay via Firebase & IoT KIT
// ============================================

// Library
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== OBJEK & VARIABEL ======
FirebaseData fbdo;
String user = "{{USER_ID}}";

// ====== PIN KOMPONEN ======
#define LED_PIN   D0   // LED terhubung ke D0
#define BUZZ_PIN  D1   // Buzzer terhubung ke D1
#define RELAY_PIN D2   // Relay terhubung ke D2


// ============================================
void setup() {
  // Inisialisasi Serial Monitor
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== MODUL 04 - Kendali Output Digital ===");

  // Set pin sebagai OUTPUT
  pinMode(LED_PIN,   OUTPUT);
  pinMode(BUZZ_PIN,  OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);

  // Pastikan semua output MATI di awal
  digitalWrite(LED_PIN,   LOW);
  digitalWrite(BUZZ_PIN,  LOW);
  digitalWrite(RELAY_PIN, LOW);

  // Koneksi ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Koneksi ke Firebase
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

// ============================================
void loop() {
  // --- KENDALI LED (switch1) ---
  if (Firebase.getString(fbdo, "/" + user + "/switch1")) {
    if (fbdo.to<bool>() == true) {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED ON");
    } else {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED OFF");
    }
  }

  // --- KENDALI BUZZER (switch2) ---
  if (Firebase.getString(fbdo, "/" + user + "/switch2")) {
    if (fbdo.to<bool>() == true) {
      digitalWrite(BUZZ_PIN, HIGH);
      Serial.println("Buzzer ON");
    } else {
      digitalWrite(BUZZ_PIN, LOW);
      Serial.println("Buzzer OFF");
    }
  }

  // --- KENDALI RELAY (switch3) ---
  if (Firebase.getString(fbdo, "/" + user + "/switch3")) {
    if (fbdo.to<bool>() == true) {
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("Relay ON");
    } else {
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Relay OFF");
    }
  }
}

`,
    "modul05LCD": `
// ============================================
// MODUL 05 BAGIAN 1 - LCD 16x2 I2C
// ============================================

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "{{USER_ID}}";

void setup() {
  Serial.begin(115200);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1);
  lcd.print("Connecting-WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Perbaikan: Menghapus backslash ganda pada \n
  Serial.printf("Firebase Client v%s\\n\\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

void loop() {
  lcd.setCursor(0, 0);
  lcd.print("Menampilkan Teks");

  // Perbaikan: Menggunakan getBool() jika data di Firebase berupa true/false
  if (Firebase.getBool(fbdo, "/" + user + "/switch1")) {
    lcd.setCursor(0, 1);
    // Perbaikan: Menggunakan boolData()
    if (fbdo.boolData() == true) {
      lcd.print("Data Sakelar ON ");
    } else {
      lcd.print("Data Sakelar OFF");
    }
  } else {
    // Tampilkan alasan error di Serial Monitor jika gagal baca
    lcd.setCursor(0, 1);
    lcd.print("Gagal baca data ");
    Serial.println(fbdo.errorReason());
  }
  
  // Perbaikan Fatal: Wajib ada delay agar tidak spam request ke Firebase!
  delay(1000); 
}

`,
    "modul05OLED": `
// ============================================
// MODUL 05 BAGIAN 2 - OLED DISPLAY 128x64
// ============================================

// Library 
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


// ====== KONFIGURASI OLED ======
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
// Inisialisasi objek OLED dengan resolusi 128x64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== OBJEK & VARIABEL ======
FirebaseData fbdo;
String user = "{{USER_ID}}";

// ============================================
void setup() {
  Serial.begin(115200);
  
  // Inisialisasi OLED (Alamat I2C default 0x3C)
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay(); // Bersihkan layar di awal

  // Koneksi ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Koneksi ke Firebase
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

// ============================================
void loop() {
  // --- Teks Judul (Ukuran 1) ---
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE); // Gunakan SSD1306_WHITE atau WHITE
  display.setCursor(1, 1);
  display.print("Trainer IoT");

  // --- Membaca status switch1 dari Firebase ---
  if (Firebase.getString(fbdo, "/" + user + "/switch1")) {
    display.setTextSize(2);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(1, 25);
    
    if (fbdo.to<bool>() == true) {
      display.print("Data ON");
    } else {
      display.print("Data OFF");
    }
  }

  // --- WAJIB: Tampilkan buffer ke layar, lalu bersihkan ---
  display.display();       // Menampilkan apa yang sudah di-draw di buffer
  display.clearDisplay();  // Membersihkan buffer untuk refresh berikutnya
}

`,
    "modul06BH1750": `
// ============================================
// MODUL 06 BAGIAN 2 - SENSOR CAHAYA BH1750
// ============================================

// Library ESP8266 WiFi dan Firebase
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Library I2C, LCD, dan Sensor BH1750
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <BH1750.h>

// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== OBJEK & VARIABEL ======
FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2); // Alamat I2C LCD biasanya 0x27
BH1750 lightMeter;
String user = "{{USER_ID}}";

unsigned int lux;
char light[16];

// ============================================
void setup() {
  Serial.begin(115200);

  // Inisialisasi I2C dan Sensor BH1750
  Wire.begin();
  lightMeter.begin();

  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

  // Koneksi ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Koneksi ke Firebase
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

// ============================================
void loop() {
  // Membaca intensitas cahaya dalam satuan Lux
  lux = lightMeter.readLightLevel();

  // Format teks untuk ditampilkan di LCD
  sprintf(light, "LIGHT:%5d lx", lux);
  lcd.setCursor(0, 0); lcd.print("Light Meter(lx)");
  lcd.setCursor(0, 1); lcd.print(light);

  // Print ke Serial Monitor
  Serial.print("Cahaya: ");
  Serial.print(lux);
  Serial.println(" lx");

  // Kirim data ke Gauge 1 di Firebase
  Firebase.setInt(fbdo, "/" + user + "/gauge1", lux);

  delay(150); // Jeda agar perubahan nilai lebih halus
}

`,
    "modul06LDR": `
// ============================================
// MODUL 06 BAGIAN 1 - SENSOR CAHAYA ANALOG (LDR)
// ============================================
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== PIN & OBJEK ======
#define LS_PIN A0 // Pin sensor cahaya LDR/Photodiode

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "{{USER_ID}}";

int ls_adc, ls_value;
char ls_data[16];

// ============================================
void setup() {
  Serial.begin(115200);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("."); delay(300);
  }
  Serial.println("Connected with IP: " + WiFi.localIP().toString());

  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

// ============================================
void loop() {
  ls_adc = analogRead(LS_PIN);
  // Konversi nilai ADC (0-1024) menjadi persentase (0-100%)
  ls_value = map(ls_adc, 0, 1024, 0, 100); 

  Serial.print("Cahaya: " + String(ls_value) + "%\n");

  // Kirim data ke Gauge 1 di Firebase
  Firebase.setInt(fbdo, "/" + user + "/gauge1", ls_value);

  // Tampilkan di LCD
  lcd.setCursor(0, 0); lcd.print("Light Sensor(%)");
  lcd.setCursor(0, 1);
  sprintf(ls_data, "LS:%3d", ls_value);
  lcd.print(ls_data);

  delay(150); // Jeda agar perubahan nilai lebih halus
}

`,
    "modul06POTENSI": `
// ============================================
// MODUL POTENSIOMETER (Modul 6 Bag 3 / Modul 12)
// Membaca ADC Potensiometer & Tampil di OLED
// ============================================

// Library ESP8266 WiFi dan Firebase
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Library OLED Display (I2C)
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ====== KONFIGURASI OLED ======
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

/// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== PIN & OBJEK ======
#define POT_PIN A0 // Pin potensiometer terhubung ke A0 NodeMCU

FirebaseData fbdo;
String user = "{{USER_ID}}";

int pot_adc;
char pot_data[16]; // Diperbesar dari 4 ke 16 agar tidak buffer overflow

// ============================================
void setup() {
  Serial.begin(115200);
  
  // Inisialisasi OLED (Alamat I2C default 0x3C)
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();

  // Koneksi ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Koneksi ke Firebase
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

// ============================================
void loop() {
  // Membaca data ADC potensiometer (0 - 1023)
  pot_adc = analogRead(POT_PIN); 
  
  // Format teks untuk ditampilkan di OLED
  sprintf(pot_data, "POT:%4d", pot_adc);

  // Kirim data ADC ke Gauge 1 di Firebase
  Firebase.setInt(fbdo, "/" + user + "/gauge1", pot_adc);

  // --- Tampilan di OLED ---
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1, 1);
  display.print("ADC Potensiometer");

  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1, 25);
  display.print(pot_data);

  // WAJIB: Tampilkan buffer ke layar, lalu bersihkan
  display.display();
  display.clearDisplay();
  
  delay(150); // Jeda kecil agar angka di OLED tidak berkedip terlalu cepat
}

`,
    "modul07DHT": `
// ============================================
// MODUL 07 - MONITORING SUHU & KELEMBABAN (DHT11)
// ============================================

// Library ESP8266 WiFi dan Firebase
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Library I2C, LCD, dan DHT11
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== PIN & OBJEK ======
#define DHT_PIN D5       // Pin DHT11 terhubung ke D5 NodeMCU

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2); // Alamat I2C LCD 0x27, ukuran 16x2
DHT dht(DHT_PIN, DHT11);            // Objek sensor DHT11
String user = "{{USER_ID}}";

float t, h; // Variabel penyimpan data suhu (t) dan kelembaban (h)

// ============================================
void setup() {
  Serial.begin(115200);
  
  // Inisialisasi Sensor DHT11
  dht.begin();

  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

  // Koneksi ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Koneksi ke Firebase
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear(); // Bersihkan LCD setelah 2 detik
}

// ============================================
void loop() {
  // Membaca suhu (Celsius) dan kelembaban (%)
  t = dht.readTemperature();
  h = dht.readHumidity();

  // Cek apakah pembacaan sensor gagal (nilainya NaN / Not a Number)
  if (isnan(t) || isnan(h)) {
    Serial.println("Tidak dapat membaca sensor DHT11!");
    return; // Lewati siklus loop ini jika gagal
  }

  // Print ke Serial Monitor
  Serial.println("Temp: " + String(t) + " °C");
  Serial.println("Humd: " + String(h) + "%");
  Serial.println();

  // Kirim data ke Firebase (Gauge 1 untuk Suhu, Gauge 2 untuk Kelembaban)
  Firebase.setFloat(fbdo, "/" + user + "/gauge1", t);
  Firebase.setFloat(fbdo, "/" + user + "/gauge2", h);

  // Tampilkan data di LCD
  lcd.setCursor(0, 0);
  // char(223) adalah kode ASCII untuk simbol derajat (°) pada LCD
  lcd.print("Temp: " + String(t) + char(223) + "C"); 
  
  lcd.setCursor(0, 1);
  lcd.print("Humd: " + String(h) + "%");
  
  // DHT11 butuh waktu ~1 detik untuk pembacaan berikutnya, 
  // jadi tidak perlu delay tambahan yang terlalu lama.
}

`,
    "modul08": `
// ============================================
// MODUL 08 - MONITORING CUACA & KETINGGIAN
// Sensor BMP180 + OLED Display via I2C Expander
// ============================================

// Library ESP8266 WiFi dan Firebase
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Library OLED Display (I2C)
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Library Sensor BMP180
#include <Adafruit_BMP085.h>

// ====== KONFIGURASI OLED ======
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

/// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== OBJEK & VARIABEL ======
FirebaseData fbdo;
Adafruit_BMP085 bmp;
String user = "{{USER_ID}}";

int temperature; // Data suhu (°C)
int pressure;    // Data tekanan udara (hPa)
int altitude;    // Data ketinggian (m)

// ============================================
void setup() {
  Serial.begin(115200);

  // Inisialisasi I2C dan Sensor BMP180
  Wire.begin();
  if (!bmp.begin()) {
    Serial.println("Sensor BMP180 tidak terdeteksi!");
    while (1); // Berhenti jika sensor tidak ditemukan
  }
  Serial.println("Sensor BMP180 berhasil diinisialisasi.");

  // Inisialisasi OLED (Alamat I2C default 0x3C)
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 25);
  display.print("Connecting WiFi...");
  display.display();

  // Koneksi ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Koneksi ke Firebase
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

// ============================================
void loop() {
  // Membaca data dari sensor BMP180
  temperature = bmp.readTemperature();          // Suhu dalam °C
  pressure = bmp.readPressure() / 100;          // Tekanan dalam hPa (dibagi 100 dari Pa)
  altitude = bmp.readAltitude();                // Ketinggian dalam meter

  // Print ke Serial Monitor
  Serial.println("=== Data BMP180 ===");
  Serial.println("Suhu      : " + String(temperature) + " °C");
  Serial.println("Tekanan   : " + String(pressure) + " hPa");
  Serial.println("Ketinggian: " + String(altitude) + " m");
  Serial.println();

  // Kirim data ke Firebase
  Firebase.setInt(fbdo, "/" + user + "/gauge1", temperature);  // Gauge 1 = Suhu
  Firebase.setInt(fbdo, "/" + user + "/gauge2", pressure);     // Gauge 2 = Tekanan
  Firebase.setInt(fbdo, "/" + user + "/hlevel1", altitude);    // HLevel 1 = Ketinggian

  // --- Tampilan di OLED ---
  display.clearDisplay();

  // Judul
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(35, 0);
  display.print("BMP180");

  // Suhu
  display.setCursor(0, 15);
  display.print("Suhu : ");
  display.print(temperature);
  display.print(" C");

  // Tekanan
  display.setCursor(0, 30);
  display.print("Pres : ");
  display.print(pressure);
  display.print(" hPa");

  // Ketinggian
  display.setCursor(0, 45);
  display.print("Alt  : ");
  display.print(altitude);
  display.print(" m");

  // WAJIB: Tampilkan buffer ke layar
  display.display();

  delay(2000); // Jeda 2 detik sebelum pembacaan berikutnya
}

`,
    "modul09": `
// ============================================
// MODUL 09 - SMART AGRICULTURE (TANAH & HUJAN)
// ============================================

// Library ESP8266 WiFi dan Firebase
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Library I2C dan LCD
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

/// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== PIN & OBJEK ======
#define AS_PIN A0 // Pin Analog Sensor (Tanah/Hujan) ke A0 NodeMCU

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "{{USER_ID}}";

int as_adc, as_value;
char as_data[16];

// ============================================
void setup() {
  Serial.begin(115200);

  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

  // Koneksi ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Koneksi ke Firebase
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

// ============================================
void loop() {
  // Membaca data ADC sensor (0 - 1023)
  as_adc = analogRead(AS_PIN);
  
  // Konversi nilai ADC ke persentase (0 - 100%)
  // CATATAN: 760 adalah nilai ADC maksimal saat sensor basah/kotor.
  // Jika pakai sensor hujan, angka 760 ini mungkin perlu disesuaikan (lihat panduan kalibrasi).
  as_value = map(as_adc, 0, 760, 0, 100); 
  
  // Batasi nilai agar tidak lebih dari 100%
  if (as_value > 100) as_value = 100;

  // Print ke Serial Monitor (Berguna untuk kalibrasi)
  Serial.print("ADC  : "); Serial.println(as_adc);
  Serial.print("Nilai: "); Serial.print(as_value); Serial.println("%");
  Serial.println();

  // Kirim data ke Gauge 1 di Firebase
  Firebase.setInt(fbdo, "/" + user + "/gauge1", as_value);

  // Tampilkan data di LCD
  lcd.setCursor(0, 0); lcd.print("Analog Sens(%)");
  sprintf(as_data, "AS:%3d", as_value);
  lcd.setCursor(0, 1); lcd.print(as_data);

  delay(150); // Jeda agar perubahan nilai lebih halus
}

`,
    "modul10BAG02": `
// ============================================
// MODUL 10 BAGIAN 2 - SENSOR ULTRASONIK (JARAK)
// Range Meter dengan OLED Display & Firebase
// ============================================
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <NewPing.h> // Library Sensor Ultrasonic sesuai PDF

// ====== KONFIGURASI OLED ======
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== PIN & OBJEK ======
#define T    D5   // PIN T(Trig) terhubung ke PIN D5 NodeMCU
#define E    D6   // PIN E(Echo) terhubung ke PIN D6 NodeMCU
#define Maks 200  // Jarak maksimal yang diukur (cm)
NewPing us(T, E, Maks);

FirebaseData fbdo;
String user = "{{USER_ID}}";
int jarak;
char val_jarak[3];

// ============================================
void setup(){
  Serial.begin(115200);

  // Inisialisasi OLED
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();

  // Koneksi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while(WiFi.status() != WL_CONNECTED) { 
    Serial.print("."); 
    delay(300); 
  }
  Serial.println("Connected!");

  // Koneksi Firebase
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

// ============================================
void loop(){
  // 1. Membaca data sensor menggunakan library NewPing
  jarak = us.ping_cm(); 
  sprintf(val_jarak, "%3d", jarak);

  // 2. Print ke Serial Monitor
  Serial.println("Jarak: " + String(jarak) + " cm");

  // 3. Kirim data ke Horizontal Level 1 di Firebase
  Firebase.setInt(fbdo, "/" + user + "/hlevel1", jarak);

  // 4. Tampilkan data pada OLED Display
  display.clearDisplay();
  
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1,1);
  display.print("Jarak(cm)");

  display.setTextSize(3);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1,25);
  display.print(val_jarak);

  // WAJIB: Tampilkan buffer ke layar
  display.display(); 
  
  delay(150); // Jeda agar perubahan nilai lebih halus
}
`,
    "modul10PIR": `

// ============================================
// MODUL 10 BAGIAN 1 - SENSOR PIR (GERAKAN)
// ============================================
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== PIN & OBJEK ======
#define PIR_PIN D0  // Pin sensor PIR terhubung ke D0 NodeMCU

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "{{USER_ID}}";

// ============================================
void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);

  Serial.println("=== MODUL 10 BAG 1: Sensor PIR ===");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("."); delay(300);
  }
  Serial.println("Connected!");

  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
  
  // Kalibrasi awal PIR (biarkan sensor stabil selama 1-2 detik)
  delay(2000); 
}

// ============================================
void loop() {
  // Tampilkan teks pada LCD
  lcd.setCursor(0, 0); 
  lcd.print("Deteksi Gerakan:");

  // Jika PIR mendeteksi gerakan, output bernilai HIGH
  if (digitalRead(PIR_PIN) == HIGH) {
    lcd.setCursor(0, 1); 
    lcd.print("Gerak Terdeteksi");
    Serial.println("Gerakan Terdeteksi!");
    
    // Kirim string ke Indikator 1 di Firebase
    Firebase.setString(fbdo, "/" + user + "/indicator1", "Gerakan Terdeteksi");
  } else {
    lcd.setCursor(0, 1); 
    lcd.print("Tidak Terdeteksi");
    Serial.println("Tidak Terdeteksi");
    
    // Kirim string ke Indikator 1 di Firebase
    Firebase.setString(fbdo, "/" + user + "/indicator1", "Tidak Terdeteksi");
  }
  
  delay(500);  // Jeda agar tidak terlalu cepat
}
`,
    "modul11": `
// ============================================
// MODUL 11 - KENDALI AKTUATOR PRESISI (MOTOR SERVO)
// ============================================

// Library ESP8266 WiFi, Firebase, dan Servo
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Servo.h>

// ====== PIN & OBJEK ======
#define SERVO_PIN D0 // Pin sinyal servo terhubung ke D0

/// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== OBJEK & VARIABEL ======
FirebaseData fbdo;
Servo servo;
String user = "{{USER_ID}}";

// ============================================
void setup() {
  Serial.begin(115200);
  
  // Konfigurasi pin pada objek servo
  servo.attach(SERVO_PIN);

  // Koneksi ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Koneksi ke Firebase
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

// ============================================
void loop() {
  // Membaca status switch1 dari Firebase
  if (Firebase.getString(fbdo, "/" + user + "/switch1")) {
    if (fbdo.to<bool>() == true) {
      servo.write(180); // Putar servo ke 180 derajat
      Serial.println("Servo 180 derajat");
    } else {
      servo.write(0);   // Putar servo ke 0 derajat
      Serial.println("Servo 0 derajat");
    }
  }
  
  delay(100); // Jeda kecil agar tidak spam pembacaan
}


`,
    "modul12": `
// ============================================
// MODUL 12 - IDENTIFIKASI BERBASIS RFID (WM)
// ============================================

// Library WiFi & Firebase
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Library LCD I2C
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Library RFID (SPI)
#include <SPI.h>
#include <MFRC522.h>

// ====== KONFIGURASI PIN RFID ======
#define RST_PIN D0  // Pin RST RFID ke D0
#define SS_PIN  D8  // Pin SDA(SS) RFID ke D8

// ====== KONFIGURASI PIN BUZZER ======
#define BUZZ_PIN D3 // Pin Buzzer ke D3

/// ====== KONFIGURASI (WAJIB DIGANTI!) ======
#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"

#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

// ====== OBJEK & VARIABEL ======
FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
MFRC522 mfrc522(SS_PIN, RST_PIN); // Buat objek MFRC522

String user = "{{USER_ID}}";
String nuid;
// Ganti "12e44a1b" dengan NUID kartu RFID kamu yang asli nanti!
String rfid_tag = "12e44a1b"; 

// ============================================
void setup() {
  Serial.begin(115200);
  
  pinMode(BUZZ_PIN, OUTPUT);
  digitalWrite(BUZZ_PIN, LOW);

  SPI.begin();           // Inisialisasi komunikasi SPI
  mfrc522.PCD_Init();    // Inisialisasi RFID RC522

  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

  // Koneksi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("Connected with IP: " + WiFi.localIP().toString());

  // Koneksi Firebase
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

// ============================================
void loop() {
  lcd.setCursor(0, 0); lcd.print("RFID READER");
  lcd.setCursor(0, 1); lcd.print("NUID:           "); // Spasi untuk clear teks lama

  // Cek apakah ada kartu baru yang mendekat
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial())  return;

  // Gabungkan byte UID menjadi satu string NUID
  String tag_id = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) tag_id += "0"; // Tambah '0' depan jika hex < 10
    tag_id += String(mfrc522.uid.uidByte[i], HEX);
  }
  nuid = tag_id;
  nuid.toUpperCase(); // Opsional: jadikan huruf kapital semua biar rapi

  Serial.print("UID Tag: ");
  Serial.println(nuid);

  // Verifikasi NUID dengan Kartu Master
  if (rfid_tag == nuid) {
    buzz_auth();
    buzz_accepted();
    lcd.setCursor(5, 1); lcd.print("AKSES OK!");
  } else {
    buzz_auth();
    buzz_denied();
    lcd.setCursor(5, 1); lcd.print("AKSES DITOLAK");
  }

  // Kirim NUID ke Indikator 1 di Firebase
  Firebase.setString(fbdo, "/" + user + "/indicator1", nuid);

  delay(2000); // Tahan tampilan LCD selama 2 detik
}

// ============================================
// FUNGSI BUNYI BUZZER
// ============================================
void buzz_auth() {
  for (int x = 0; x < 8; x++) {
    digitalWrite(BUZZ_PIN, HIGH); delay(50);
    digitalWrite(BUZZ_PIN, LOW);  delay(30);
  }
  delay(500);
}

void buzz_accepted() {
  for (int x = 0; x < 2; x++) {
    digitalWrite(BUZZ_PIN, HIGH); delay(200);
    digitalWrite(BUZZ_PIN, LOW);  delay(100);
  }
}

void buzz_denied() {
  digitalWrite(BUZZ_PIN, HIGH); delay(1000);
  digitalWrite(BUZZ_PIN, LOW);  delay(100);
}

`,
    "modul13DEL": `
// ============================================
// MODUL 13 - FINGERPRINT (DELETE / HAPUS)
// ============================================
#include <Adafruit_Fingerprint.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>

#define BUZZ_PIN D3
LiquidCrystal_I2C lcd(0x27, 16, 2);
SoftwareSerial FP_Serial(D5, D6);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&FP_Serial);

int id;

void setup(){
  Serial.begin(115200);
  pinMode(BUZZ_PIN, OUTPUT); digitalWrite(BUZZ_PIN, LOW);
  finger.begin(57600);
  
  lcd.init(); lcd.backlight();
  lcd.print("Trainer Kit IoT"); delay(2000); lcd.clear();
  
  if(finger.verifyPassword()){
    lcd.setCursor(0, 0); lcd.print("Sensor ditemukan");
    Serial.println("Sensor ditemukan"); delay(1000); lcd.clear();
  } else{
    lcd.setCursor(0, 0); lcd.print("Tidak Ada Sensor");
    Serial.println("Tidak Ada Sensor"); delay(1000); lcd.clear();
  }
}

int baca_id(){
  uint8_t num = 0;
  while(num == 0){ while(!Serial.available()); num = Serial.parseInt(); }
  buzz_done(); return num;
}

void loop(){
  Serial.println("Ketik ID (1-127) yang akan dihapus!");
  lcd.setCursor(0, 0); lcd.print("Ketik ID (1-127)");
  lcd.setCursor(0, 1); lcd.print("Serial Monitor  ");
  
  id = baca_id();
  if(id == 0) return;
  
  Serial.print("Menghapus ID#"); Serial.println(id);
  deleteFingerprint(id);
}

uint8_t deleteFingerprint(int id){
  int p = -1;
  p = finger.deleteModel(id);
  if(p == FINGERPRINT_OK){
    Serial.println("Sidik jari dihapus!"); buzz_deleted();
    lcd.setCursor(0, 0); lcd.print("Berhasil dihapus"); delay(2000);
  } else{
    Serial.println("Sidik jari gagal dihapus"); buzz_failed();
    lcd.setCursor(0, 0); lcd.print("Gagal dihapus   "); delay(2000);
  }
  return p;
}

void buzz_done(){ digitalWrite(BUZZ_PIN, HIGH); delay(200); digitalWrite(BUZZ_PIN, LOW); delay(100); }
void buzz_deleted(){ for(int x=0; x<2; x++){ digitalWrite(BUZZ_PIN, HIGH); delay(200); digitalWrite(BUZZ_PIN, LOW); delay(100); } }
void buzz_failed(){ digitalWrite(BUZZ_PIN, HIGH); delay(1000); digitalWrite(BUZZ_PIN, LOW); delay(100); }

`,
    "modul13READ": `
// ============================================
// MODUL 13 - FINGERPRINT (READ / VERIFIKASI)
// ============================================
#include <Adafruit_Fingerprint.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>

#define BUZZ_PIN D3
LiquidCrystal_I2C lcd(0x27, 16, 2);
SoftwareSerial FP_Serial(D5, D6);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&FP_Serial);

int id = 0;
String id_name = "Sola"; // Ganti dengan nama kamu

void setup(){
  Serial.begin(115200);
  pinMode(BUZZ_PIN, OUTPUT); digitalWrite(BUZZ_PIN, LOW);
  finger.begin(57600);
  
  lcd.init(); lcd.backlight();
  lcd.print("Trainer Kit IoT"); delay(2000); lcd.clear();
  
  if(finger.verifyPassword()){
    lcd.setCursor(0, 0); lcd.print("Sensor ditemukan");
    Serial.println("Sensor ditemukan"); delay(1000); lcd.clear();
  } else{
    lcd.setCursor(0, 0); lcd.print("Tidak Ada Sensor");
    Serial.println("Tidak Ada Sensor"); delay(1000); lcd.clear();
  }
}

void loop(){
  lcd.setCursor(0, 0); lcd.print(" SELAMAT DATANG");
  lcd.setCursor(0, 1); lcd.print(" SCAN JARI ANDA");
  
  id = getFingerprintIDez(); delay(50);
  
  if(id == 1){ // Jika ID 1 yang terdaftar terdeteksi
    lcd.clear(); buzz_match();
    lcd.setCursor(0, 0); lcd.print("ID TERDAFTAR    ");
    lcd.setCursor(0, 1); lcd.print("Hai, " + id_name);
    delay(2000); id = 0; lcd.clear();
  } else{
    buzz_not_match();
    lcd.setCursor(0, 0); lcd.print("TIDAK TERDAFTAR!");
    lcd.setCursor(0, 1); lcd.print("Silahkan Reg. fp");
    delay(2000); id = 0; lcd.clear();
  }
}

int getFingerprintIDez(){
  int p = -1;
  while(p != FINGERPRINT_OK){
    p = finger.getImage();
    if(p == FINGERPRINT_OK){ Serial.println("Memindai sidik jari"); buzz_scan(); break; }
  }
  p = finger.image2Tz(); if(p != FINGERPRINT_OK){ Serial.println("Konversi bermasalah"); return p; }
  Serial.println("Konversi sidik jari");
  
  p = finger.fingerFastSearch();
  if(p != FINGERPRINT_OK){ Serial.println("Sidik jari tidak ditemukan"); return p; }
  Serial.println("Sidik jari ditemukan");
  
  Serial.print("ID Ditemukan#"); Serial.print(finger.fingerID);
  Serial.print(" dengan konfidensi"); Serial.println(finger.confidence);
  return finger.fingerID;
}

void buzz_scan(){ for(int x=0; x<8; x++){ digitalWrite(BUZZ_PIN, HIGH); delay(50); digitalWrite(BUZZ_PIN, LOW); delay(30); } }
void buzz_match(){ for(int x=0; x<2; x++){ digitalWrite(BUZZ_PIN, HIGH); delay(200); digitalWrite(BUZZ_PIN, LOW); delay(100); } }
void buzz_not_match(){ digitalWrite(BUZZ_PIN, HIGH); delay(1000); digitalWrite(BUZZ_PIN, LOW); delay(100); }

`,
    "modul13REG": `
// ============================================
// MODUL 13 - FINGERPRINT (ENROLL / DAFTAR)
// ============================================
#include <Adafruit_Fingerprint.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>

#define BUZZ_PIN D3
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Koneksi PIN Fingerprint: TX ke D5, RX ke D6
SoftwareSerial FP_Serial(D5, D6);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&FP_Serial);

int id;

void setup(){
  Serial.begin(115200);
  pinMode(BUZZ_PIN, OUTPUT);
  digitalWrite(BUZZ_PIN, LOW);
  
  finger.begin(57600);
  
  lcd.init(); lcd.backlight();
  lcd.print("Trainer Kit IoT"); delay(2000); lcd.clear();
  
  if(finger.verifyPassword()){
    lcd.setCursor(0, 0); lcd.print("Sensor ditemukan");
    Serial.println("Sensor ditemukan"); delay(1000); lcd.clear();
  } else{
    lcd.setCursor(0, 0); lcd.print("Tidak Ada Sensor");
    Serial.println("Tidak Ada Sensor"); delay(1000); lcd.clear();
  }
}

int baca_id(){
  uint8_t num = 0;
  while(num == 0){ while(!Serial.available()); num = Serial.parseInt(); }
  buzz_notif(); return num;
}

void loop(){
  Serial.println("Ketik ID (1-127) yang akan didaftarkan!");
  lcd.setCursor(0, 0); lcd.print("Ketik ID (1-127)");
  lcd.setCursor(0, 1); lcd.print("Serial Monitor  ");
  
  id = baca_id();
  if(id == 0) return;
  
  Serial.print("Mendaftar ID#"); Serial.println(id);
  while(!getFingerprintEnroll());
}

uint8_t getFingerprintEnroll(){
  int p = -1;
  lcd.setCursor(0, 0); lcd.print("Tempel jari anda");
  lcd.setCursor(0, 1); lcd.print("................");
  
  while(p != FINGERPRINT_OK){
    p = finger.getImage();
    if(p == FINGERPRINT_OK){
      buzz_scan(); lcd.setCursor(0, 0); lcd.print("Scanning sensor ");
      delay(2000); Serial.println("Memindai sidik jari (1)"); break;
    }
  }
  p = finger.image2Tz(1); if(p != FINGERPRINT_OK) return p;
  Serial.println("Konversi sidik jari (1)");
  
  Serial.println("Lepas jari"); buzz_notif();
  lcd.setCursor(0, 0); lcd.print("Lepas jari      ");
  p = 0; while(p != FINGERPRINT_NOFINGER){ p = finger.getImage(); }
  
  p = -1; Serial.println("Letakkan lagi jari yang sama");
  lcd.setCursor(0, 0); lcd.print("Letakkan kembali");
  while(p != FINGERPRINT_OK){
    p = finger.getImage();
    if(p == FINGERPRINT_OK){
      buzz_scan(); Serial.println("Memindai sidik jari (2)"); break;
    }
  }
  p = finger.image2Tz(2); if(p != FINGERPRINT_OK) return p;
  Serial.println("Konversi sidik jari (2)");
  
  p = finger.createModel();
  if(p == FINGERPRINT_OK){
    Serial.println("Sidik jari cocok"); buzz_match();
    lcd.setCursor(0, 0); lcd.print("Sidik jari cocok"); delay(2000);
  } else if(p == FINGERPRINT_ENROLLMISMATCH){
    Serial.println("Sidik jari tidak cocok"); buzz_not_match();
    lcd.setCursor(0, 0); lcd.print("Tidak cocok     "); lcd.setCursor(0, 1); lcd.print("Ulangi proses   "); delay(2000); return p;
  }
  
  p = finger.storeModel(id);
  if(p == FINGERPRINT_OK){
    Serial.println("Sidik jari disimpan!"); buzz_store_id();
    lcd.setCursor(0, 0); lcd.print("Menyimpan data..");
    lcd.setCursor(0, 1); lcd.print("ID " + String(id) + " Tersimpan "); delay(3000);
  } else{
    Serial.println("Sidik jari gagal disimpan!"); buzz_not_match();
    lcd.setCursor(0, 0); lcd.print("Gagal Menyimpan "); lcd.setCursor(0, 1); lcd.print("Ulangi proses   "); delay(3000); return p;
  }
  return true;
}

void buzz_scan(){ for(int x=0; x<8; x++){ digitalWrite(BUZZ_PIN, HIGH); delay(50); digitalWrite(BUZZ_PIN, LOW); delay(30); } }
void buzz_notif(){ digitalWrite(BUZZ_PIN, HIGH); delay(200); digitalWrite(BUZZ_PIN, LOW); delay(100); }
void buzz_match(){ for(int x=0; x<2; x++){ digitalWrite(BUZZ_PIN, HIGH); delay(200); digitalWrite(BUZZ_PIN, LOW); delay(100); } }
void buzz_not_match(){ digitalWrite(BUZZ_PIN, HIGH); delay(1000); digitalWrite(BUZZ_PIN, LOW); delay(100); }
void buzz_store_id(){ for(int x=0; x<2; x++){ digitalWrite(BUZZ_PIN, HIGH); delay(200); digitalWrite(BUZZ_PIN, LOW); delay(100); } digitalWrite(BUZZ_PIN, HIGH); delay(500); digitalWrite(BUZZ_PIN, LOW); delay(100); }

`,
    "modul14": `
// ============================================
// MODUL 14 - SENSOR GESTURE & INTEGRASI (WM)
// Kendali 3 LED dengan Sapuan Tangan (APDS9960)
// ============================================

// Library LCD 16x2 I2C
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Library APDS9960
#include <SparkFun_APDS9960.h>

// ====== KONFIGURASI PIN ======
#define APDS9960_SDA D2
#define APDS9960_SCL D1
#define APDS9960_INT D5

LiquidCrystal_I2C lcd(0x27, 16, 2);

// ====== OBJEK & VARIABEL GLOBAL ======
SparkFun_APDS9960 apds = SparkFun_APDS9960();
volatile bool isr_flag = 0;

// Fungsi interupsi (Wajib disimpan di IRAM untuk ESP8266)
void ICACHE_RAM_ATTR interruptRoutine();

// Variabel data lampu dan pin lampu
int pos = 0; 
int lamp_pin[3] = {D0, D6, D7}; // Pin LED 1, 2, 3
boolean lamp_state[3];            // Status ON/OFF tiap LED
String state;

// ============================================
void setup() {
  Serial.begin(115200);

  // Memulai komunikasi I2C
  Wire.begin(APDS9960_SDA, APDS9960_SCL);
  
  // Mengatur pin interrupt sebagai input dan mendaftarkan fungsi interupsi
  pinMode(digitalPinToInterrupt(APDS9960_INT), INPUT);
  attachInterrupt(digitalPinToInterrupt(APDS9960_INT), interruptRoutine, FALLING);

  // Inisialisasi APDS-9960
  apds.init();
  apds.enableGestureSensor(true); // Mengaktifkan mode gesture

  // Mengatur pin lampu sebagai output dengan kondisi awal LOW (MATI)
  for (int i = 0; i <= 2; i++) {
    pinMode(lamp_pin[i], OUTPUT);
    digitalWrite(lamp_pin[i], LOW);
    lamp_state[i] = false;
  }

  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.print("Trainer Kit IoT");
  delay(2000);
  lcd.clear();
}

// ============================================
void loop() {
  // Membaca status ISR (Interrupt Service Routine)
  if (isr_flag == 1) {
    detachInterrupt(digitalPinToInterrupt(APDS9960_INT)); // Nonaktifkan interupsi sementara
    handleGesture();                                      // Proses gesture
    isr_flag = 0;                                         // Reset flag
    attachInterrupt(digitalPinToInterrupt(APDS9960_INT), interruptRoutine, FALLING); // Aktifkan lagi
  }

  // Membuat indeks 'pos' berputar (wrap-around) antara 0, 1, dan 2
  if (pos > 2) pos = 0;
  if (pos < 0) pos = 2;

  // Menyalakan/mematikan LED sesuai status tersimpan pada posisi yang dipilih
  digitalWrite(lamp_pin[pos], lamp_state[pos]);

  // Menampilkan status di LCD
  lcd.setCursor(0, 0); 
  lcd.print("Lampu Gesture ");
  
  lcd.setCursor(0, 1); 
  lcd.print("> Lampu");
  lcd.setCursor(8, 1); 
  lcd.print(pos + 1);      // Tampilkan nomor LED (1, 2, atau 3)
  lcd.setCursor(9, 1); 
  lcd.print(":");
  
  // Mengubah status boolean menjadi teks ON/OFF
  if (lamp_state[pos] == true)  state = "ON";
  if (lamp_state[pos] == false) state = "OFF";
  
  lcd.setCursor(11, 1); 
  lcd.print(state);
}

// ============================================
// FUNGSI INTERUPSI & GESTURE
// ============================================

// Fungsi Interrupt Routine (Hanya menandai flag)
void interruptRoutine() {
  isr_flag = 1;
}

// Fungsi handleGesture: membaca arah gesture
void handleGesture() {
  if (apds.isGestureAvailable()) {
    switch (apds.readGesture()) {
      case DIR_UP:
        lamp_state[pos] = true;  // Nyalakan LED yang dipilih
        Serial.println("ATAS");
        break;
      case DIR_DOWN:
        lamp_state[pos] = false; // Matikan LED yang dipilih
        Serial.println("BAWAH");
        break;
      case DIR_LEFT:
        pos--;                   // Pindah pilihan ke LED sebelumnya
        Serial.println("KIRI");
        break;
      case DIR_RIGHT:
        pos++;                   // Pindah pilihan ke LED berikutnya
        Serial.println("KANAN");
        break;
      default:
        Serial.println("TIDAK ADA");
        break;
    }
  }
}

`
};

// Export untuk digunakan di dashboard.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARDUINO_TEMPLATES;
}
