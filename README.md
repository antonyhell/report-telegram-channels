# report-telegram-channels

## How to get stasrted?
You'll need to obtain an API ID and hash:

1. Login into your [telegram account](https://my.telegram.org/)
2. Then click "API development tools" and fill your application details (only app title and short name required)
3. Finally, click "Create application"

> ⚠️ **Never** share any API/authorization details, that will compromise your application and account.

## How to use?
### 1. Create text file with list of channels to report
See example in channels.txt

### 2. Run built binary
#### Select required binary

- macOS [Intel x86](dist/telegram-report-macos-x64) / [Apple silicone](dist/telegram-report-macos-arm64)
- Windows [Intel x86](telegram-report-win-x64.exe) / [ARM](telegram-report-win-arm64.exe)
- Linux [Intel x86](telegram-report-linux-x64) / [ARM](telegram-report-linux-arm64)

#### Run command 
This is an example for macOS Intel x86
```sh
telegram-report-macos-x64 channels.txt
```

#### Provide Telegram `apiId` and `apiHash`
You'll need to provide apiId and apiHash from previous step. It will be needed only once.

#### Provide authorization details
1. Provide your phone number in international format
2. Provide code that Telegram will send you
3. Provide password (only if your account has a password)
