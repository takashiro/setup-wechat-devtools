# Setup WeChat Developer Tools

This action helps you run end-to-end automated tests against WeChat miniprograms.

As required by WeChat Developer Tools, it's still necessary to login via your WeChat app.

1. Downloads and installs WeChat Developer Tools.

1. Send a login QR code to your email. Please scan it using WeChat.

1.

# Usage

<!-- start usage -->
```yaml
- uses: takashiro/setup-wechat-devtools@v0
  with:
    ## SMTP settings to send QR code to your email address.
    smtp-host: ${{ secrets.SMTP_HOST }}
    smtp-port: ${{ secrets.SMTP_HOST }}
    smtp-secure: true
    smtp-username: ${{ secrets.SMTP_USERNAME }}
    smtp-password: ${{ secrets.SMTP_PASSWORD }}
    smtp-sender: ${{ secrets.SMTP_SENDER }}
    smtp-receiver: ${{ secrets.SMTP_RECEIVER }}
```
<!-- end usage -->

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
