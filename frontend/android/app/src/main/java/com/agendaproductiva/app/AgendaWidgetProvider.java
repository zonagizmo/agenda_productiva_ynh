package com.agendaproductiva.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class AgendaWidgetProvider extends AppWidgetProvider {

    static final String PREFS_NAME = "AgendaWidgetData";
    static final String PREFS_KEY  = "widget_data";

    private static final int[] ITEM_IDS = {
        R.id.widget_item0, R.id.widget_item1, R.id.widget_item2,
        R.id.widget_item3, R.id.widget_item4
    };

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        RemoteViews views = buildViews(ctx);
        for (int id : ids) {
            try {
                mgr.updateAppWidget(id, views);
            } catch (Throwable e) {
                // If a specific widget ID fails, skip it
            }
        }
    }

    static RemoteViews buildViews(Context ctx) {
        try {
            RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_agenda);

            // Tap opens app
            Intent intent = new Intent(ctx, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pi = PendingIntent.getActivity(ctx, 0, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, pi);

            SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String json = prefs.getString(PREFS_KEY, null);

            if (json == null) {
                for (int id : ITEM_IDS) views.setViewVisibility(id, View.GONE);
                views.setViewVisibility(R.id.widget_more, View.GONE);
                views.setViewVisibility(R.id.widget_empty, View.VISIBLE);
                views.setTextViewText(R.id.widget_date, "");
                return views;
            }

            JSONObject data  = new JSONObject(json);
            String dateKey   = data.optString("date", "");
            JSONArray items  = data.optJSONArray("items");
            if (items == null) items = new JSONArray();

            views.setTextViewText(R.id.widget_date, formatDate(dateKey));

            int count = items.length();
            int shown = Math.min(count, ITEM_IDS.length);
            for (int i = 0; i < ITEM_IDS.length; i++) {
                if (i < shown) {
                    JSONObject item = items.getJSONObject(i);
                    boolean done   = item.optBoolean("done", false);
                    String text    = item.optString("text", "");
                    String prefix  = done ? "✓ " : "○ ";
                    views.setTextViewText(ITEM_IDS[i], prefix + text);
                    views.setInt(ITEM_IDS[i], "setTextColor", done ? 0xFF7777AA : 0xFFEEEEFF);
                    views.setViewVisibility(ITEM_IDS[i], View.VISIBLE);
                } else {
                    views.setViewVisibility(ITEM_IDS[i], View.GONE);
                }
            }

            if (count > ITEM_IDS.length) {
                int extra = count - ITEM_IDS.length;
                views.setTextViewText(R.id.widget_more, "+ " + extra + " mas");
                views.setViewVisibility(R.id.widget_more, View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.widget_more, View.GONE);
            }

            views.setViewVisibility(R.id.widget_empty, count == 0 ? View.VISIBLE : View.GONE);

            return views;

        } catch (Throwable e) {
            // Return minimal safe view on any error
            RemoteViews fallback = new RemoteViews(ctx.getPackageName(), R.layout.widget_agenda);
            try {
                for (int id : ITEM_IDS) fallback.setViewVisibility(id, View.GONE);
                fallback.setViewVisibility(R.id.widget_more, View.GONE);
                fallback.setViewVisibility(R.id.widget_empty, View.VISIBLE);
                fallback.setTextViewText(R.id.widget_empty, "Error: " + e.getMessage());
            } catch (Exception ignored) {}
            return fallback;
        }
    }

    private static String formatDate(String dateKey) {
        if (dateKey == null || dateKey.isEmpty()) return "";
        try {
            Date d = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(dateKey);
            if (d == null) return dateKey;
            return new SimpleDateFormat("EEE d MMM", Locale.getDefault()).format(d);
        } catch (Throwable e) {
            return dateKey;
        }
    }
}
