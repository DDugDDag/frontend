### Android simulator 실행 커맨드
npm install
npx react-native run-android

### 실행 환경

1. node v23.11.0
2. npm 11.4.0
3. javac 17.0.16
4. Android Gradle Plugin 8.8.0
5. Gradle 8.14.3

### Android Emulator 설치 가이드
해당 ebook의 1.3.1 참고했습니다.
https://ebook-product.kyobobook.co.kr/dig/preview/E000002950814#j_p03_html


# 로컬 실행 가이드 (Android / React Native)

## 1) 레포 클론 & 패키지 설치

```bash
git clone <REPO_URL>
cd <REPO_DIR>
npm install   # 또는 yarn
```


## 2) JDK 경로 지정 (환경변수 미사용 버전)

`android/gradle.properties`의 17번째 줄에 **JDK 17 경로**를 직접 지정합니다.

### Windows

```properties
org.gradle.java.home=C:/Program Files/Java/jdk-17
```

### macOS (Apple Silicon / Homebrew)

```properties
org.gradle.java.home=/opt/homebrew/opt/openjdk@17
# 또는: /opt/homebrew/Cellar/openjdk@17/<버전>/libexec/openjdk.jdk/Contents/Home
```

> 위 경로는 각자 설치 경로에 맞게 조정하세요.
### 트러블슈팅 (선택)

* Gradle이 인식한 Java Home 확인:

  ```bash
  cd android
  # Windows
  gradlew.bat -v
  # macOS / Linux
  ./gradlew -v
  ```

  출력의 **Java home**이 위에서 설정한 경로와 일치해야 합니다.

## 3) 카카오맵 해시키 등록 및 .env 준비

프로젝트 루트 폴더에서 .env에 아래와 같이 등록
```
KAKAO_MAP_JS_API_KEY=`js키`
KAKAO_NATIVE_APP_KEY=`app키`
```

[카카오맵 해시 키 등록 방법](https://developers.kakao.com/docs/latest/ko/android/getting-started#before-you-begin-add-key-hash)

## 4) 빌드 준비 (Gradle 정리)

```bash
cd android
# Windows
gradlew.bat --stop && gradlew.bat clean
# macOS / Linux
./gradlew --stop && ./gradlew clean
cd ..
```


## 5) 실행

Metro(번들러) 실행 후, Android 빌드/설치:

```bash
# 터미널 1
npm start   # 메트로 실행

# 터미널 2
npx react-native run-android
```

> 에뮬레이터를 켜두었거나, 실제 기기를 USB 디버깅으로 연결해야 합니다.


---


This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
