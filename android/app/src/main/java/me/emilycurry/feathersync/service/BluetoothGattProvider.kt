package me.emilycurry.feathersync.service

import android.bluetooth.*
import android.bluetooth.BluetoothGatt.GATT_SUCCESS
import android.content.Context
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*
import java.util.concurrent.Callable
import java.util.concurrent.ExecutorService
import java.util.concurrent.Future
import java.util.concurrent.TimeoutException
import kotlin.collections.HashSet

class BluetoothGattProvider(private val executor: ExecutorService,
                            private val device: BluetoothDevice,
                            private val context: Context) {
    private val providerCallback = ProviderCallback(this::onConnected,
            this::onServicesDiscovered,
            this::onCharacteristicWritten)
    private var gatt: BluetoothGatt = device.connectGatt(this.context, true, this.providerCallback)
    private var isConnected = false
    private var isServicesDiscovered = false
    private val isCharacteristicWritten = HashSet<UUID>()

    fun getGatt(): Future<BluetoothGatt> {
        val task = Callable<BluetoothGatt> {
            val started = Instant.now()
            while (!isConnected) {
                if (Instant.now().isAfter(started.plus(15, ChronoUnit.SECONDS))) {
                    throw TimeoutException("BluetoothGattProvider - Timed out waiting to connect to device")
                }
                Thread.sleep(500)
            }
            return@Callable this.gatt
        }
        return this.executor.submit(task)
    }

    fun getService(serviceId: UUID): Future<BluetoothGattService> {
        val task = Callable<BluetoothGattService> {
            val gatt = this.getGatt().get()
            val started = Instant.now()
            while (!isServicesDiscovered) {
                if (Instant.now().isAfter(started.plus(15, ChronoUnit.SECONDS))) {
                    throw TimeoutException("BluetoothGattProvider - Timed out waiting for to fetch services")
                }
                Thread.sleep(500)
            }
            return@Callable gatt.getService(serviceId)
        }
        return this.executor.submit(task)
    }

    fun getServiceCharacteristic(serviceId: UUID, characteristicId: UUID): Future<BluetoothGattCharacteristic> {
        val task = Callable<BluetoothGattCharacteristic> {
            val service = this.getService(serviceId).get()
            return@Callable service?.getCharacteristic(characteristicId)
                    ?: throw IllegalArgumentException("BluetoothGattProvider - Could not fetch characteristic [ $characteristicId ]")
        }
        return this.executor.submit(task)
    }

    fun setServiceCharacteristic(serviceId: UUID, characteristicId: UUID, value: ByteArray): Future<Unit> {
        val task = Callable {
            this.isCharacteristicWritten.remove(characteristicId)
            val gatt = this.getGatt().get()
            val chr = this.getServiceCharacteristic(serviceId, characteristicId).get()
            chr.value = value
            gatt.writeCharacteristic(chr)
            val started = Instant.now()
            while (!this.isCharacteristicWritten.contains(characteristicId)) {
                if (Instant.now().isAfter(started.plus(15, ChronoUnit.SECONDS))) {
                    throw TimeoutException("BluetoothGattProvider - Timed out waiting for to write characteristic [ $characteristicId ]")
                }
                Thread.sleep(500)
            }
            return@Callable
        }
        return this.executor.submit(task)
    }
    
    fun disconnect() {
        if (this.gatt != null) this.gatt.disconnect()
    }

    private fun onConnected() {
        this.isConnected = true
    }

    private fun onServicesDiscovered(v: Boolean) {
        this.isServicesDiscovered = v
    }

    private fun onCharacteristicWritten(v: UUID) {
        this.isCharacteristicWritten.add(v)
    }

    inner class ProviderCallback(private val onConnected: () -> Unit,
                                 private val onServicesDiscovered: (Boolean) -> Unit,
                                 private val onCharacteristicWritten: (UUID) -> Unit) : BluetoothGattCallback() {
        override fun onConnectionStateChange(
                gatt: BluetoothGatt,
                status: Int,
                newState: Int
        ) {
            super.onConnectionStateChange(gatt, status, newState)
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    this.onConnected()
                    gatt.discoverServices()
                }
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            super.onServicesDiscovered(gatt, status)
            this.onServicesDiscovered(status == GATT_SUCCESS)
        }

        override fun onCharacteristicWrite(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic, status: Int) {
            super.onCharacteristicWrite(gatt, characteristic, status)
            this.onCharacteristicWritten(characteristic.uuid)
        }
    }
}