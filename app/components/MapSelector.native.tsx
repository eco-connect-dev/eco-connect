import { StyleSheet, View } from "react-native";
import type {
  WebViewErrorEvent,
  WebViewMessageEvent,
} from "react-native-webview/lib/WebViewTypes";

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapPin = MapCoordinate & {
  id: string;
  title: string;
  kind: "dump" | "pickup";
};

type MapSelectorProps = {
  selectedPoint?: MapCoordinate;
  markers?: MapPin[];
  onSelectPoint?: (point: MapCoordinate) => void;
  onMapLoadError?: (message: string) => void;
};

function createMapHtml(
  initialPoint: MapCoordinate,
  markers: MapPin[],
  selectable: boolean,
) {
  const safeMarkers = JSON.stringify(markers).replace(/</g, "\\u003c");
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #e7ece7; }
      .leaflet-container { font-family: sans-serif; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const initialPoint = [${initialPoint.latitude}, ${initialPoint.longitude}];
      const submissionPins = ${safeMarkers};
      const selectable = ${selectable};
      window.onerror = function (message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: String(message) }));
      };
      const map = L.map('map', { zoomControl: true }).setView(initialPoint, 15);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map).on('tileerror', function () {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'tiles-error' }));
      });
      if (submissionPins.length) {
        const bounds = [];
        submissionPins.forEach(function (pin) {
          const coordinate = [pin.latitude, pin.longitude];
          bounds.push(coordinate);
          const marker = L.circleMarker(coordinate, {
            radius: 9,
            color: '#ffffff',
            weight: 3,
            fillColor: pin.kind === 'pickup' ? '#08752b' : '#e86b45',
            fillOpacity: 1
          }).addTo(map);
          const popup = document.createElement('div');
          popup.textContent = pin.title;
          marker.bindPopup(popup);
        });
        if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
        else map.setView(bounds[0], 15);
      } else if (selectable) {
        let marker = L.marker(initialPoint).addTo(map);
        map.on('click', function (event) {
          const point = { latitude: event.latlng.lat, longitude: event.latlng.lng };
          marker.setLatLng(event.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify(point));
        });
      }
    </script>
  </body>
</html>`;
}

export default function MapSelector({
  selectedPoint = { latitude: 6.9271, longitude: 79.8612 },
  markers = [],
  onSelectPoint,
  onMapLoadError,
}: MapSelectorProps) {
  // Defer WebView module initialization until the user opens the map picker.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { WebView } = require("react-native-webview");

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const message = JSON.parse(event.nativeEvent.data) as
        | MapCoordinate
        | { type: "error" | "tiles-error"; message?: string };
      if ("type" in message) {
        onMapLoadError?.(message.message ?? "Map tiles could not be loaded.");
        return;
      }
      const point = message;
      if (
        onSelectPoint &&
        Number.isFinite(point.latitude) &&
        Number.isFinite(point.longitude)
      ) {
        onSelectPoint(point);
      }
    } catch {
      // Ignore unexpected messages from the embedded map page.
    }
  }

  return (
    <View style={styles.container}>
      <WebView
        javaScriptEnabled
        onError={(event: WebViewErrorEvent) =>
          onMapLoadError?.(event.nativeEvent.description)
        }
        onLoadSubResourceError={(event: WebViewErrorEvent) =>
          onMapLoadError?.(event.nativeEvent.description)
        }
        onMessage={handleMessage}
        originWhitelist={["*"]}
        scrollEnabled={false}
        source={{
          html: createMapHtml(selectedPoint, markers, Boolean(onSelectPoint)),
          baseUrl: "https://eco-connect.local/",
        }}
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden", borderRadius: 16 },
  webView: { backgroundColor: "#E7ECE7", flex: 1 },
});
