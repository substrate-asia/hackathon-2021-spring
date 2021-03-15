#### Development Steps:

1. `yarn install` in `extension` folder and `ui` folder
2. in `ui` folder and run `yarn polkadot-dev-copy-to extension`
3. in `extension` folder and run `yarn watch`
4. install the extension

  - go to `chrome://extensions/`
	- ensure you have the Development flag set
	- "Load unpacked" and point to `extension/packages/extension/build`
	- if developing, after making changes - refresh the extension
