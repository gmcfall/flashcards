# Clone Github repo
git clone https://github.com/gmcfall/flashcards.git

# Set up the react-native development environment

See [Setting up the development environment](https://reactnative.dev/docs/environment-setup)

Per the instructions, I installed JDK11.

I changed JAVA_HOME from
```
C:\Users\Greg\.p2\pool\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_17.0.4.v20220903-1038\jre
```

to
```
C:\java\jdk-11.0.2
```

Following the instructions, I ran the following command to install the react-native project:
```
npx react-native init flashcards --template react-native-template-typescript
```

This resulted in an error. This seems to be a problem with the later versions of yarn.

There is an [issue in Github](https://github.com/react-native-community/react-native-template-typescript/issues/230)
which says to add the `--npm` option to the command line, and that resolves the issue.

I also want the directory name to be "mobile" instead of the package name. So I used the following command line:
```
npx react-native init lerniflash --template react-native-template-typescript --npm --directory mobile --title Flashcards
```

I followed the instructions to run the app in Android Studio and running
```
npx react-native start
```

which starts the Metro Bundler

I also found that I needed to run 
```
adb reverse tcp:8081 tcp:8081
```
# Generate Android Credentials

Here's the output from `./gradlew signingReport`

```
> Task :app:signingReport
Variant: debug
Config: debug
Store: C:\github\flashcards\app\android\app\debug.keystore
Alias: androiddebugkey
MD5: 20:F4:61:48:B7:2D:8E:5E:5C:A2:3D:37:A4:F4:14:90
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
Valid until: Tuesday, April 30, 2052
----------
Variant: release
Config: debug
Store: C:\github\flashcards\app\android\app\debug.keystore
Alias: androiddebugkey
MD5: 20:F4:61:48:B7:2D:8E:5E:5C:A2:3D:37:A4:F4:14:90
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
Valid until: Tuesday, April 30, 2052
----------
Variant: debugAndroidTest
Config: debug
Store: C:\github\flashcards\app\android\app\debug.keystore
Alias: androiddebugkey
MD5: 20:F4:61:48:B7:2D:8E:5E:5C:A2:3D:37:A4:F4:14:90
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
Valid until: Tuesday, April 30, 2052
----------

> Task :react-native-firebase_app:signingReport
Variant: debugAndroidTest
Config: debug
Store: C:\Users\Greg\.android\debug.keystore
Alias: AndroidDebugKey
MD5: D3:4E:27:79:AB:67:54:AC:0E:5C:6C:B8:39:30:42:39
SHA1: 14:63:69:00:E7:A7:0C:A0:CD:2E:B6:B4:D0:3B:5D:AD:1F:00:03:66
SHA-256: 53:CD:22:DF:10:56:21:F1:4B:4C:E3:6E:0A:D0:14:CA:E2:13:42:AF:4E:D2:B6:24:17:97:71:10:0E:5F:14:B4
Valid until: Sunday, November 3, 2052
----------

Deprecated Gradle features were used in this build, making it incompatible with Gradle 8.0.

You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.

See https://docs.gradle.org/7.5.1/userguide/command_line_interface.html#sec:command_line_warnings

```


# Add React Native Firebase
See [React Native Firebase](https://rnfirebase.io/) 
Choose `Getting Started`.

At one point you'll be asked to generate signing credentials using
```
cd android && ./gradlew signingReport
```

This produces `debug.keystore` at
```
C:\github\flashcards\flashcards\android\app\debug.keystore
```

The keystore contains sensitive information. I copied it to 
```
C:\github\flashcards\flashcards
```
which is outside the github repo.

I also removed the following line from `C:\github\flashcards\flashcards\.gitignore`
```
!debug.keystore
```

Unfortunately, this means that it will need to manually be copied to 
```
C:\github\flashcards\flashcards\android\app\debug.keystore
```
whenever a developer clones the repo.



