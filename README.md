# Setup WeChat Developer Tools

This action installs WeChat Developer Tools in your CI environment.

# Usage

<!-- start usage -->
```yaml
- uses: takashiro/setup-wechat-devtools@v1
  with:
    ## Add an alias command to the cli (or cli.bat on Windows) in WeChat DevTools.
    ## So that the command can be used anywhere. Default: wxdev
    cli: 'wxdev'
```
<!-- end usage -->

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
