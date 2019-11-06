cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-qr-barcode-scanner/www/barcodescanner.js",
        "id": "cordova-plugin-qr-barcode-scanner.BarcodeScanner",
        "pluginId": "cordova-plugin-qr-barcode-scanner",
        "clobbers": [
            "cordova.plugins.barcodeScanner"
        ]
    },
    {
        "file": "plugins/cordova-plugin-qr-barcode-scanner/src/browser/BarcodeScannerProxy.js",
        "id": "cordova-plugin-qr-barcode-scanner.BarcodeScannerProxy",
        "pluginId": "cordova-plugin-qr-barcode-scanner",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.3.2",
    "cordova-plugin-qr-barcode-scanner": "8.0.3"
}
// BOTTOM OF METADATA
});