#include "bluefruit.h"
#include "BLEStatusService.h"

#define STATUS_DISPLAY_WAIT_SERIAL

BLEStatusService statusSvc = BLEStatusService();
BLEDis bledis = BLEDis();
BLEBas blebas = BLEBas();

void setup()
{
#ifdef STATUS_DISPLAY_WAIT_SERIAL

  Serial.begin(115200);
  while (!Serial)
    delay(10); // for nrf52840 with native usb

#endif // STATUS_DISPLAY_WAIT_SERIAL
  pinMode(LED_BUILTIN, OUTPUT);
  startBle();
  statusSvc.begin();
  startAdv();
}

void loop()
{
  digitalWrite(LED_BUILTIN, HIGH); // turn the LED on (HIGH is the voltage level)
  delay(1000);                     // wait for a second
  digitalWrite(LED_BUILTIN, LOW);  // turn the LED off by making the voltage LOW
  delay(1000);                     // wait for a second
}

void startBle(void)
{
  Serial.println("Initialize the Bluefruit module...");
  Bluefruit.begin();

  Serial.println("Setting Device Name...");
  Bluefruit.setName("Emily's Cool Thing");

  // Set the connect/disconnect callback handlers
  // Bluefruit.Periph.setConnectCallback(connect_callback);
  // Bluefruit.Periph.setDisconnectCallback(disconnect_callback);

  Serial.println("Configuring the Device Information Service");
  bledis.setManufacturer("Emily's Cool Stuff.com");
  bledis.setModel("Feather Status Display");
  bledis.begin();

  Serial.println("Configuring the Battery Service");
  blebas.begin();
  blebas.write(100); // Is this correct? Will it auto update?
}

void startAdv(void)
{
  // Advertising packet
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();

  // Include HRM Service UUID
  Bluefruit.Advertising.addService(statusSvc);

  // Include Name
  Bluefruit.Advertising.addName();

  /* Start Advertising
   * - Enable auto advertising if disconnected
   * - Interval:  fast mode = 20 ms, slow mode = 152.5 ms
   * - Timeout for fast mode is 30 seconds
   * - Start(timeout) with timeout = 0 will advertise forever (until connected)
   * 
   * For recommended advertising interval
   * https://developer.apple.com/library/content/qa/qa1931/_index.html   
   */
  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244); // in unit of 0.625 ms
  Bluefruit.Advertising.setFastTimeout(10);   // number of seconds in fast mode
  Bluefruit.Advertising.start(0);             // 0 = Don't stop advertising after n seconds
  Serial.println("\nAdvertising!");
}