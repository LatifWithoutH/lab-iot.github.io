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

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

#define LED_PIN   D0
#define BUZZ_PIN  D1
#define RELAY_PIN D2

FirebaseData fbdo;
String user = "{{USER_ID}}";

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== MODUL 04 - Kendali Output Digital ===");

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZ_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZ_PIN, LOW);
  digitalWrite(RELAY_PIN, LOW);

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

  Serial.printf("\\nFirebase Client v%s\\n\\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.getString(fbdo, "/" + user + "/switch1")) {
    if (fbdo.to<bool>() == true) {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED ON");
    } else {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED OFF");
    }
  }

  if (Firebase.getString(fbdo, "/" + user + "/switch2")) {
    if (fbdo.to<bool>() == true) {
      digitalWrite(BUZZ_PIN, HIGH);
      Serial.println("Buzzer ON");
    } else {
      digitalWrite(BUZZ_PIN, LOW);
      Serial.println("Buzzer OFF");
    }
  }

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
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
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

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

FirebaseData fbdo;
String user = "{{USER_ID}}";

void setup() {
  Serial.begin(115200);
  
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();

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

  Serial.printf("Firebase Client v%s\\n\\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

void loop() {
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1, 1);
  display.print("Trainer IoT");

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

  display.display();
  display.clearDisplay();
}
`,
    "modul06BH1750": `
// ============================================
// MODUL 06 BAGIAN 2 - SENSOR CAHAYA BH1750
// ============================================

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <BH1750.h>

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
BH1750 lightMeter;
String user = "{{USER_ID}}";

unsigned int lux;
char light[16];

void setup() {
  Serial.begin(115200);

  Wire.begin();
  lightMeter.begin();

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

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

  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

void loop() {
  lux = lightMeter.readLightLevel();

  sprintf(light, "LIGHT:%5d lx", lux);
  lcd.setCursor(0, 0); lcd.print("Light Meter(lx)");
  lcd.setCursor(0, 1); lcd.print(light);

  Serial.print("Cahaya: ");
  Serial.print(lux);
  Serial.println(" lx");

  Firebase.setInt(fbdo, "/" + user + "/gauge1", lux);

  delay(150);
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

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

#define LS_PIN A0

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "{{USER_ID}}";

int ls_adc, ls_value;
char ls_data[16];

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
  Serial.println("\\nConnected with IP: " + WiFi.localIP().toString());

  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

void loop() {
  ls_adc = analogRead(LS_PIN);
  ls_value = map(ls_adc, 0, 1024, 0, 100); 

  Serial.print("Cahaya: " + String(ls_value) + "%\\n");

  Firebase.setInt(fbdo, "/" + user + "/gauge1", ls_value);

  lcd.setCursor(0, 0); lcd.print("Light Sensor(%)");
  lcd.setCursor(0, 1);
  sprintf(ls_data, "LS:%3d", ls_value);
  lcd.print(ls_data);

  delay(150);
}
`,
    "modul06POTENSI": `
// ============================================
// MODUL POTENSIOMETER (Modul 6 Bag 3 / Modul 12)
// ============================================

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

#define POT_PIN A0

FirebaseData fbdo;
String user = "{{USER_ID}}";

int pot_adc;
char pot_data[16];

void setup() {
  Serial.begin(115200);
  
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();

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

  Serial.printf("Firebase Client v%s\\n\\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

void loop() {
  pot_adc = analogRead(POT_PIN); 
  
  sprintf(pot_data, "POT:%4d", pot_adc);
  Firebase.setInt(fbdo, "/" + user + "/gauge1", pot_adc);

  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1, 1);
  display.print("ADC Potensiometer");

  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1, 25);
  display.print(pot_data);

  display.display();
  display.clearDisplay();
  
  delay(150);
}
`,
    "modul07DHT": `
// ============================================
// MODUL 07 - MONITORING SUHU & KELEMBABAN (DHT11)
// ============================================

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

#define DHT_PIN D5

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT11);
String user = "{{USER_ID}}";

float t, h;

void setup() {
  Serial.begin(115200);
  dht.begin();

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

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

  Serial.printf("Firebase Client v%s\\n\\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

void loop() {
  t = dht.readTemperature();
  h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("Tidak dapat membaca sensor DHT11!");
    return;
  }

  Serial.println("Temp: " + String(t) + " °C");
  Serial.println("Humd: " + String(h) + "%");
  Serial.println();

  Firebase.setFloat(fbdo, "/" + user + "/gauge1", t);
  Firebase.setFloat(fbdo, "/" + user + "/gauge2", h);

  lcd.setCursor(0, 0);
  lcd.print("Temp: " + String(t) + char(223) + "C"); 
  
  lcd.setCursor(0, 1);
  lcd.print("Humd: " + String(h) + "%");
}
`,
    "modul08": `
// ============================================
// MODUL 08 - MONITORING CUACA & KETINGGIAN
// ============================================

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_BMP085.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

FirebaseData fbdo;
Adafruit_BMP085 bmp;
String user = "{{USER_ID}}";

int temperature;
int pressure;
int altitude;

void setup() {
  Serial.begin(115200);

  Wire.begin();
  if (!bmp.begin()) {
    Serial.println("Sensor BMP180 tidak terdeteksi!");
    while (1);
  }
  Serial.println("Sensor BMP180 berhasil diinisialisasi.");

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 25);
  display.print("Connecting WiFi...");
  display.display();

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

  Serial.printf("Firebase Client v%s\\n\\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

void loop() {
  temperature = bmp.readTemperature();
  pressure = bmp.readPressure() / 100;
  altitude = bmp.readAltitude();

  Serial.println("=== Data BMP180 ===");
  Serial.println("Suhu      : " + String(temperature) + " °C");
  Serial.println("Tekanan   : " + String(pressure) + " hPa");
  Serial.println("Ketinggian: " + String(altitude) + " m");
  Serial.println();

  Firebase.setInt(fbdo, "/" + user + "/gauge1", temperature);
  Firebase.setInt(fbdo, "/" + user + "/gauge2", pressure);
  Firebase.setInt(fbdo, "/" + user + "/hlevel1", altitude);

  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(35, 0);
  display.print("BMP180");

  display.setCursor(0, 15);
  display.print("Suhu : ");
  display.print(temperature);
  display.print(" C");

  display.setCursor(0, 30);
  display.print("Pres : ");
  display.print(pressure);
  display.print(" hPa");

  display.setCursor(0, 45);
  display.print("Alt  : ");
  display.print(altitude);
  display.print(" m");

  display.display();

  delay(2000);
}
`,
    "modul09": `
// ============================================
// MODUL 09 - SMART AGRICULTURE (TANAH & HUJAN)
// ============================================

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

#define AS_PIN A0

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "{{USER_ID}}";

int as_adc, as_value;
char as_data[16];

void setup() {
  Serial.begin(115200);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

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

  Serial.printf("Firebase Client v%s\\n\\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

void loop() {
  as_adc = analogRead(AS_PIN);
  as_value = map(as_adc, 0, 760, 0, 100); 
  
  if (as_value > 100) as_value = 100;

  Serial.print("ADC : "); Serial.println(as_adc);
  Serial.print("Nilai: "); Serial.print(as_value); Serial.println("%");
  Serial.println();

  Firebase.setInt(fbdo, "/" + user + "/gauge1", as_value);

  lcd.setCursor(0, 0); lcd.print("Analog Sens(%)");
  sprintf(as_data, "AS:%3d", as_value);
  lcd.setCursor(0, 1); lcd.print(as_data);

  delay(150);
}
`,
    "modul10BAG02": `
// ============================================
// MODUL 10 BAGIAN 2 - SENSOR ULTRASONIK (JARAK)
// ============================================
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <NewPing.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

#define T    D5
#define E    D6
#define Maks 200
NewPing us(T, E, Maks);

FirebaseData fbdo;
String user = "{{USER_ID}}";
int jarak;
char val_jarak[3];

void setup(){
  Serial.begin(115200);

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while(WiFi.status() != WL_CONNECTED) { 
    Serial.print("."); 
    delay(300); 
  }
  Serial.println("\\nConnected!");

  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

void loop(){
  jarak = us.ping_cm(); 
  sprintf(val_jarak, "%3d", jarak);

  Serial.println("Jarak: " + String(jarak) + " cm");

  Firebase.setInt(fbdo, "/" + user + "/hlevel1", jarak);

  display.clearDisplay();
  
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1,1);
  display.print("Jarak(cm)");

  display.setTextSize(3);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(1,25);
  display.print(val_jarak);

  display.display(); 
  
  delay(150);
}
`,
    "modul10PIR": `
// ============================================
// MODUL 10 BAGIAN 1 - SENSOR PIR (GERAKAN)
// ============================================
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

#define PIR_PIN D0 

FirebaseData fbdo;
String user = "{{USER_ID}}";

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);

  Serial.println("=== MODUL 10 BAG 1: Sensor PIR ===");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("."); delay(300);
  }
  Serial.println("\\nConnected!");

  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
  
  delay(2000); 
}

void loop() {
  int pirState = digitalRead(PIR_PIN);

  if (pirState == HIGH) {
    Serial.println("Gerakan Terdeteksi!");
    Firebase.setString(fbdo, "/" + user + "/indicator1", "Gerakan Terdeteksi");
  } else {
    Serial.println("Kondisi Aman.");
    Firebase.setString(fbdo, "/" + user + "/indicator1", "Aman");
  }

  delay(500);
}
`,
    "modul11": `
// ============================================
// MODUL 11 - KENDALI AKTUATOR PRESISI (MOTOR SERVO)
// ============================================

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Servo.h>

#define SERVO_PIN D0

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

FirebaseData fbdo;
Servo servo;
String user = "{{USER_ID}}";

void setup() {
  Serial.begin(115200);
  servo.attach(SERVO_PIN);

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

  Serial.printf("Firebase Client v%s\\n\\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.getString(fbdo, "/" + user + "/switch1")) {
    if (fbdo.to<bool>() == true) {
      servo.write(180);
      Serial.println("Servo 180 derajat");
    } else {
      servo.write(0);
      Serial.println("Servo 0 derajat");
    }
  }
  delay(100);
}
`,
    "modul12": `
// ============================================
// MODUL 12 - IDENTIFIKASI BERBASIS RFID (WM)
// ============================================

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN D0
#define SS_PIN  D8
#define BUZZ_PIN D3

#define WIFI_SSID      "{{WIFI_SSID}}"
#define WIFI_PASSWORD  "{{WIFI_PASSWORD}}"
#define DATABASE_URL   "{{DATABASE_URL}}"
#define API_KEY        "{{API_KEY}}"

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
MFRC522 mfrc522(SS_PIN, RST_PIN);

String user = "{{USER_ID}}";
String nuid;
String rfid_tag = "12e44a1b"; 

void setup() {
  Serial.begin(115200);
  
  pinMode(BUZZ_PIN, OUTPUT);
  digitalWrite(BUZZ_PIN, LOW);

  SPI.begin();
  mfrc522.PCD_Init();

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0); lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1); lcd.print("Connecting-WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\\nConnected with IP: " + WiFi.localIP().toString());

  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);

  delay(2000);
  lcd.clear();
}

void loop() {
  lcd.setCursor(0, 0); lcd.print("RFID READER");
  lcd.setCursor(0, 1); lcd.print("NUID:           ");

  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial())  return;

  String tag_id = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) tag_id += "0";
    tag_id += String(mfrc522.uid.uidByte[i], HEX);
  }
  nuid = tag_id;
  nuid.toUpperCase();

  Serial.print("UID Tag: ");
  Serial.println(nuid);

  if (rfid_tag == nuid) {
    buzz_auth();
    buzz_accepted();
    lcd.setCursor(5, 1); lcd.print("AKSES OK!");
  } else {
    buzz_auth();
    buzz_denied();
    lcd.setCursor(5, 1); lcd.print("AKSES DITOLAK");
  }

  Firebase.setString(fbdo, "/" + user + "/indicator1", nuid);

  delay(2000);
}

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
String id_name = "Sola";

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
  
  if(id == 1){
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

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SparkFun_APDS9960.h>

#define APDS9960_SDA D2
#define APDS9960_SCL D1
#define APDS9960_INT D5

LiquidCrystal_I2C lcd(0x27, 16, 2);

SparkFun_APDS9960 apds = SparkFun_APDS9960();
volatile bool isr_flag = 0;

void ICACHE_RAM_ATTR interruptRoutine();

int pos = 0; 
int lamp_pin[3] = {D0, D6, D7};
boolean lamp_state[3];
String state;

void setup() {
  Serial.begin(115200);

  Wire.begin(APDS9960_SDA, APDS9960_SCL);
  
  pinMode(digitalPinToInterrupt(APDS9960_INT), INPUT);
  attachInterrupt(digitalPinToInterrupt(APDS9960_INT), interruptRoutine, FALLING);

  apds.init();
  apds.enableGestureSensor(true);

  for (int i = 0; i <= 2; i++) {
    pinMode(lamp_pin[i], OUTPUT);
    digitalWrite(lamp_pin[i], LOW);
    lamp_state[i] = false;
  }

  lcd.init();
  lcd.backlight();
  lcd.print("Trainer Kit IoT");
  delay(2000);
  lcd.clear();
}

void loop() {
  if (isr_flag == 1) {
    detachInterrupt(digitalPinToInterrupt(APDS9960_INT));
    handleGesture();
    isr_flag = 0;
    attachInterrupt(digitalPinToInterrupt(APDS9960_INT), interruptRoutine, FALLING);
  }

  if (pos > 2) pos = 0;
  if (pos < 0) pos = 2;

  digitalWrite(lamp_pin[pos], lamp_state[pos]);

  lcd.setCursor(0, 0); 
  lcd.print("Lampu Gesture ");
  
  lcd.setCursor(0, 1); 
  lcd.print("> Lampu");
  lcd.setCursor(8, 1); 
  lcd.print(pos + 1);
  lcd.setCursor(9, 1); 
  lcd.print(":");
  
  if (lamp_state[pos] == true)  state = "ON";
  if (lamp_state[pos] == false) state = "OFF";
  
  lcd.setCursor(11, 1); 
  lcd.print(state);
}

void interruptRoutine() {
  isr_flag = 1;
}

void handleGesture() {
  if (apds.isGestureAvailable()) {
    switch (apds.readGesture()) {
      case DIR_UP:
        lamp_state[pos] = true;
        Serial.println("ATAS");
        break;
      case DIR_DOWN:
        lamp_state[pos] = false;
        Serial.println("BAWAH");
        break;
      case DIR_LEFT:
        pos--;
        Serial.println("KIRI");
        break;
      case DIR_RIGHT:
        pos++;
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
