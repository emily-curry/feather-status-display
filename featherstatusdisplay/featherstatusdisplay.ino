#include "bluefruit.h"
#include "SDCard.h"
#include "BLEBatteryService.h"
#include "BLEStatusService.h"
#include "BLEImageService.h"
#include "PixelController.h"
#include "DisplayController.h"

#define STATUS_DISPLAY_WAIT_SERIAL
// #define PIXEL_ENABLE

BLEBatteryService batterySvc = BLEBatteryService();
BLEStatusService statusSvc = BLEStatusService();
BLEImageService imageSvc = BLEImageService();
BLEDis bledis = BLEDis();

void setup()
{
  Serial.begin(115200);
#ifdef STATUS_DISPLAY_WAIT_SERIAL
  while (!Serial)
    delay(10); // for nrf52840 with native usb

#endif // STATUS_DISPLAY_WAIT_SERIAL

  SDCard::begin();
  DisplayController::begin();
  PixelController::begin();
  startBle();
  statusSvc.begin();
  imageSvc.begin();
  startAdv();
}

void loop()
{
  delay(100000);
  batterySvc.update();
}

void startBle(void)
{
  Serial.println("Initialize the Bluefruit module...");
  Bluefruit.configPrphBandwidth(BANDWIDTH_MAX);
  Bluefruit.begin();
  Bluefruit.Periph.clearBonds();
  // Bluefruit.setTxPower(4); // Check bluefruit.h for supported values

  Serial.println("Setting Device Name...");
  Bluefruit.setName("Emily!");

  // Set the connect/disconnect callback handlers
  Bluefruit.Periph.setConnectCallback(connect_callback);
  Bluefruit.Periph.setDisconnectCallback(disconnect_callback);
  // Bluefruit.Periph.setConnInterval(6, 12); // 7.5 - 15 ms

  Serial.println("Configuring the Device Information Service");
  bledis.setManufacturer("Emily's Cool Stuff.com");
  bledis.setModel("Feather Status Display");
  bledis.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  bledis.begin();

  Serial.println("Configuring the Battery Service");
  batterySvc.begin();
}

void connect_callback(uint16_t conn_handle)
{
  // Get the reference to current connection
  BLEConnection *conn = Bluefruit.Connection(conn_handle);

  char central_name[32] = {0};
  conn->getPeerName(central_name, sizeof(central_name));

  // request PHY changed to 2MB
  Serial.println("Request to change PHY");
  conn->requestPHY();

  // // request to update data length
  Serial.println("Request to change Data Length");
  conn->requestDataLengthUpdate();

  // // request mtu exchange
  Serial.println("Request to change MTU");
  conn->requestMtuExchange(237);

  // request connection interval of 7.5 ms
  // conn->requestConnectionParameter(6); // in unit of 1.25

  // delay a bit for all the request to complete
  delay(1000);

  Serial.print("Connected to ");
  Serial.println(central_name);
}

/**
 * Callback invoked when a connection is dropped
 * @param conn_handle connection where this event happens
 * @param reason is a BLE_HCI_STATUS_CODE which can be found in ble_hci.h
 */
void disconnect_callback(uint16_t conn_handle, uint8_t reason)
{
  (void)conn_handle;
  (void)reason;

  Serial.print("Disconnected, reason = 0x");
  Serial.println(reason, HEX);
  Serial.println("Advertising! Again!");
}

void startAdv(void)
{
  // Advertising packet
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();

  // Include Status Service
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
  Bluefruit.Advertising.setFastTimeout(30);   // number of seconds in fast mode
  Bluefruit.Advertising.start(0);             // 0 = Don't stop advertising after n seconds
  Serial.println("\nAdvertising!");
}
