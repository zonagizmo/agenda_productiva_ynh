package com.agendaproductiva.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void updateData(PluginCall call) {
        String data = call.getString("data", "{}");
        Context ctx = getContext();

        SharedPreferences prefs = ctx.getSharedPreferences(
                AgendaWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(AgendaWidgetProvider.PREFS_KEY, data).apply();

        // Push update to all widget instances
        AppWidgetManager manager = AppWidgetManager.getInstance(ctx);
        ComponentName widget = new ComponentName(ctx, AgendaWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(widget);
        if (ids.length > 0) {
            Intent intent = new Intent(ctx, AgendaWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            ctx.sendBroadcast(intent);
        }

        call.resolve();
    }
}
