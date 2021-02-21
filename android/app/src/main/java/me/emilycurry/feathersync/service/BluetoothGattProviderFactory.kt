package me.emilycurry.feathersync.service

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*
import java.util.concurrent.Callable
import java.util.concurrent.ExecutorService
import java.util.concurrent.Future
import java.util.concurrent.TimeoutException

/**
 * thanks i hate it
 */
class BluetoothGattProviderFactory(private val executor: ExecutorService, private val context: Context) {
    private val adapter: BluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
    private val scanner: BluetoothLeScanner = adapter.bluetoothLeScanner
    private var device: BluetoothDevice? = null

    fun makeGattProvider(): Future<BluetoothGattProvider> {
        val task = Callable {
            val btd = this.getBluetoothDevice().get()
            return@Callable BluetoothGattProvider(this.executor, btd, this.context)
        }
        return this.executor.submit(task)
    }

    private fun getBluetoothDevice(): Future<BluetoothDevice> {
        val task = Callable<BluetoothDevice> {
            if (device != null) return@Callable device
            val filterStatus: ScanFilter =
                    ScanFilter.Builder().setServiceUuid(ParcelUuid(UUID.fromString(SERVICE_STATUS)))
                            .build()
            val filterImage: ScanFilter =
                    ScanFilter.Builder().setServiceUuid(ParcelUuid(UUID.fromString(SERVICE_IMAGE)))
                            .build()
            val scanSettings: ScanSettings = ScanSettings.Builder()
                    .setCallbackType(ScanSettings.CALLBACK_TYPE_FIRST_MATCH)
                    .setScanMode(ScanSettings.SCAN_MODE_LOW_POWER)
                    .setMatchMode(ScanSettings.MATCH_MODE_AGGRESSIVE)
                    .setNumOfMatches(ScanSettings.MATCH_NUM_ONE_ADVERTISEMENT)
                    .build()

            var found: BluetoothDevice? = null

            val leScanCallback: ScanCallback = object : ScanCallback() {
                override fun onScanResult(callbackType: Int, result: ScanResult) {
                    super.onScanResult(callbackType, result)
                    found = result.device
                }
            }

            val started = Instant.now()
            try {
                scanner.startScan(listOf(filterStatus, filterImage), scanSettings, leScanCallback)
                while (Instant.now().isBefore(started.plus(10, ChronoUnit.SECONDS))) {
                    this.device = found
                    if (found != null) return@Callable found!!
                    Thread.sleep(500)
                }
            } finally {
                scanner.stopScan(leScanCallback)
            }
            this.device = null
            throw TimeoutException("BluetoothGattProviderFactory#getDevice - Timeout")
        }
        return this.executor.submit(task)
    }
}