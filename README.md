# Tonic Render To String
![tests](https://github.com/substrate-system/tonic-render-to-string/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@substrate-system/tonic-render-to-string?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/tonic-render-to-string)](https://packagephobia.com/result?p=@substrate-system/tonic-render-to-string)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)


Create strings from web components.

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Install](#install)
- [Use](#use)
  * [Example](#example)

<!-- tocstop -->

</details>

## Install

```sh
npm i -S @substrate-system/tonic-render-to-string
```

## Use

>
> [!IMPORTANT]  
> `renderToString` must be imported before `Tonic`, so the browser polyfills
> are set up.
>

### Example

```js
import { renderToString } from '@substrate-system/tonic-render-to-string'
// import `renderToString` before `Tonic`
import Tonic from '@substrate-system/tonic'

class MyComponent extends Tonic {
    render () {
        return this.html`<div>Hello, World!</div>`
    }
}

const html = await renderToString(MyComponent)
```
