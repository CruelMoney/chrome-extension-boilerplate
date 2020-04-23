# Instruction

## Requirements

- Yarn v1.21.1 (any version >=1.2 should work)
- Node v12

The extension was developed on macOS 10.15.4.

### Create production build

```
    yarn
    yarn build
```

### Start developing

```
    yarn
    yarn dev
```

## Structure

> - `src/` is root directory for the extension. it includes `manifest.json` file and other static stuff.

> - `src/background.js` is main background js file for the chrome extension.

> - `src/popup-page` is the directory which includes react js setup for popup page.

> - `src/content-scripts` is the directory directory which includes react js setup for content script.
