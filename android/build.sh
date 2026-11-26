#!/bin/bash
# Baut die Lifetime-APK ohne Gradle. Passwort kommt aus der Datei (nie ausgeben).
set -euo pipefail
cd /workspace/lifetime/android
VC=${1:-1}; VN=${2:-0.1}
SDK=/workspace/android/sdk; BT=$SDK/build-tools/34.0.0; AJ=$SDK/platforms/android-34/android.jar
export JAVA_HOME=/workspace/android/jdk; export PATH=$JAVA_HOME/bin:$PATH
rm -rf build; mkdir -p build/classes build/dex build/gen build/assets
cp -a ../www build/assets/www
sed -e "s/android:versionCode=\"[0-9]*\"/android:versionCode=\"$VC\"/" -e "s/android:versionName=\"[^\"]*\"/android:versionName=\"$VN\"/" src/AndroidManifest.xml > build/AndroidManifest.xml
$BT/aapt2 compile --dir src/res -o build/res.zip
$BT/aapt2 link -o build/base.apk -I $AJ --manifest build/AndroidManifest.xml -A build/assets --java build/gen build/res.zip --min-sdk-version 24 --target-sdk-version 34
javac -source 8 -target 8 -nowarn -bootclasspath $AJ -classpath $AJ -d build/classes $(find src/java build/gen -name '*.java') 2>build/javac.log || { cat build/javac.log; exit 1; }
$BT/d8 --release --min-api 24 --lib $AJ --output build/dex $(find build/classes -name '*.class')
cp build/base.apk build/unsigned.apk
python3 -c "import zipfile;z=zipfile.ZipFile('build/unsigned.apk','a',zipfile.ZIP_DEFLATED);z.write('build/dex/classes.dex','classes.dex');z.close()"
$BT/zipalign -f -p 4 build/unsigned.apk build/aligned.apk
KS_PASS=$(cat /workspace/gissapk/keys/release.pass) $BT/apksigner sign --ks /workspace/gissapk/keys/gissmoe-release.jks --ks-key-alias gissmoe --ks-pass env:KS_PASS --key-pass env:KS_PASS --out Lifetime.apk build/aligned.apk
$BT/apksigner verify Lifetime.apk && ls -l Lifetime.apk
