package me.emilycurry.feathersync

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.bottomnavigation.BottomNavigationView
import me.emilycurry.feathersync.service.ACTION_SET_STATUS
import me.emilycurry.feathersync.service.BLEDeviceService
import me.emilycurry.feathersync.service.EXTRA_ACTION_SET_STATUS_CODE

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val navView: BottomNavigationView = findViewById(R.id.nav_view)

        val navController = findNavController(R.id.nav_host_fragment)
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        val appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.navigation_status, R.id.navigation_image, R.id.navigation_connect
            )
        )
        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)
    }

    private fun setStatus(code: Int) {
        Log.i("MainActivity", "Set status called with code [ $code ]")
        val intent = Intent(this, BLEDeviceService::class.java).apply {
            action = ACTION_SET_STATUS
            putExtra(EXTRA_ACTION_SET_STATUS_CODE, code)
        }
        this.startService(intent)
    }

    fun setStatusOffline(view: View) {
        this.setStatus(0)
    }

    fun setStatusUnknown(view: View) {
        this.setStatus(1)
    }
}