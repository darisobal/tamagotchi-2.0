import React from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';

interface Props {
  imageBase64: string | null;
  onPixelized: (grid: number[][]) => void;
}

/**
 * Hidden WebView that converts a base64 PNG image into a 16x16 binary pixel grid
 * using canvas + Otsu's thresholding to produce a Tamagotchi-style sprite.
 */
export default function SelfiePixelizer({ imageBase64, onPixelized }: Props) {
  if (!imageBase64) return null;

  const html = `<!DOCTYPE html><html><body>
<canvas id="c" width="16" height="16"></canvas>
<script>
var img = new Image();
img.onload = function() {
  var ctx = document.getElementById('c').getContext('2d');
  ctx.drawImage(img, 0, 0, 16, 16);
  var d = ctx.getImageData(0, 0, 16, 16).data;
  var gray = [];
  for (var i = 0; i < 256; i++) {
    var j = i * 4;
    gray.push(0.299 * d[j] + 0.587 * d[j+1] + 0.114 * d[j+2]);
  }

  // Histogram stretch for contrast enhancement
  var lo = 255, hi = 0;
  for (var i = 0; i < gray.length; i++) {
    if (gray[i] < lo) lo = gray[i];
    if (gray[i] > hi) hi = gray[i];
  }
  var span = hi - lo || 1;
  for (var i = 0; i < gray.length; i++) {
    gray[i] = ((gray[i] - lo) / span) * 255;
  }

  // Otsu's threshold
  var hist = new Array(256).fill(0);
  for (var k = 0; k < gray.length; k++) hist[Math.round(gray[k])]++;
  var total = gray.length;
  var sumAll = 0;
  for (var t = 0; t < 256; t++) sumAll += t * hist[t];
  var sumB = 0, wB = 0, maxV = 0, th = 128;
  for (var t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    var wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    var mB = sumB / wB;
    var mF = (sumAll - sumB) / wF;
    var v = wB * wF * (mB - mF) * (mB - mF);
    if (v > maxV) { maxV = v; th = t; }
  }

  // Build binary grid
  var grid = [];
  for (var y = 0; y < 16; y++) {
    var row = [];
    for (var x = 0; x < 16; x++) {
      row.push(gray[y * 16 + x] < th ? 1 : 0);
    }
    grid.push(row);
  }

  // Noise removal: remove isolated pixels (no orthogonal neighbors)
  for (var y = 0; y < 16; y++) {
    for (var x = 0; x < 16; x++) {
      if (grid[y][x] === 1) {
        var n = 0;
        if (y > 0 && grid[y-1][x]) n++;
        if (y < 15 && grid[y+1][x]) n++;
        if (x > 0 && grid[y][x-1]) n++;
        if (x < 15 && grid[y][x+1]) n++;
        if (n === 0) grid[y][x] = 0;
      }
    }
  }

  window.ReactNativeWebView.postMessage(JSON.stringify(grid));
};
img.src = 'data:image/png;base64,${imageBase64}';
</script></body></html>`;

  return (
    <View style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }}>
      <WebView
        source={{ html }}
        onMessage={(e) => {
          try {
            onPixelized(JSON.parse(e.nativeEvent.data));
          } catch {}
        }}
        style={{ width: 1, height: 1 }}
        originWhitelist={['*']}
      />
    </View>
  );
}
