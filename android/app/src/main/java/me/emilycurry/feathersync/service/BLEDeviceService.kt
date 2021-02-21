package me.emilycurry.feathersync.service

import android.app.Service
import android.content.Intent
import android.os.*
import android.util.Log
import android.widget.Toast
import java.util.*
import java.util.concurrent.*

const val ACTION_SET_STATUS = "me.emilycurry.feathersync.service.BLEDeviceService.SET_STATUS"
const val EXTRA_ACTION_SET_STATUS_CODE =
        "me.emilycurry.feathersync.service.BLEDeviceService.EXTRA_ACTION_SET_STATUS_CODE"

const val SERVICE_STATUS = "00001851-0000-1000-8000-00805F9B34FB"
const val SERVICE_IMAGE = "00001860-0000-1000-8000-00805F9B34FB"
const val CHR_STATUS_CODE = "00002C50-0000-1000-8000-00805F9B34FB"
const val SCAN_PERIOD: Long = 10000

class BLEDeviceService : Service() {
    private var serviceLooper: Looper? = null
    private var serviceHandler: ServiceHandler? = null

    override fun onCreate() {
        super.onCreate()
        HandlerThread("ServiceStartArguments", Process.THREAD_PRIORITY_BACKGROUND).apply {
            start()

            // Get the HandlerThread's Looper and use it for our Handler
            serviceLooper = looper
            serviceHandler = ServiceHandler(looper)
            Log.i("BLEDeviceService", "BLEDeviceService Started")
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        Log.i("BLEDeviceService", "Command received, adding to queue")
        serviceHandler?.obtainMessage()?.also { msg ->
            msg.data.putParcelable("intent", intent)
            serviceHandler?.sendMessage(msg)
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    // Handler that receives messages from the thread
    private inner class ServiceHandler(looper: Looper) : Handler(looper) {
        private val executor: ExecutorService = Executors.newCachedThreadPool()
        private val gattFactory = BluetoothGattProviderFactory(executor, applicationContext)

        override fun handleMessage(msg: Message) {
            val intent = msg.data.get("intent")
            try {
                if (intent != null && intent is Intent) {
                    handleIntent(intent)
                } else {
                    throw RejectedExecutionException("somehow got a message in queue with no intent")
                }
            } catch (ex: Exception) {
                when (ex) {
                    is RejectedExecutionException, is TimeoutException, is ExecutionException -> {
                        Toast.makeText(applicationContext, ex.message, Toast.LENGTH_LONG).show()
                        Log.e("BLEDeviceService", ex.message, ex)
                    }
                    else -> throw ex
                }

            }
        }

        private fun handleIntent(intent: Intent) {
            Log.i("BLEDeviceService", "Handling message with intent action [ ${intent.action} ]")
            val gatt = this.gattFactory.makeGattProvider().get()
            try {
                when (intent.action) {
                    ACTION_SET_STATUS -> {
                        val code = intent.getIntExtra(EXTRA_ACTION_SET_STATUS_CODE, 1)
                        val chrValue = ByteArray(1) { _ -> code.toByte() }
                        gatt.setServiceCharacteristic(UUID.fromString(SERVICE_STATUS), UUID.fromString(CHR_STATUS_CODE), chrValue).get()
                    }
                }
                Toast.makeText(baseContext, "Success!", Toast.LENGTH_LONG).show()
            } finally {
                gatt.disconnect()
                Log.i(
                        "BLEDeviceService",
                        "Completed handling of message with intent action [ ${intent.action} ]"
                )
            }
        }


    }
}