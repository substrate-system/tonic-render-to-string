import { test } from '@substrate-system/tapzero'
import { renderToString } from '../src/index.js'
import Tonic from '@substrate-system/tonic'

class MyComponent extends Tonic {
    render () {
        return this.html`<div>Hello, World!</div>`
    }
}

class NestedComponent extends Tonic {
    render () {
        return this.html`
            <div class="wrapper">
                <my-component></my-component>
            </div>
        `
    }
}

test('render simple component', async t => {
    const html = await renderToString(MyComponent)
    t.ok(html.includes('<div>Hello, World!</div>'),
        'should render simple component')
})

test('render nested component', async t => {
    Tonic.add(MyComponent)
    const html = await renderToString(NestedComponent)
    t.ok(html.includes('<div class="wrapper">'),
        'should render wrapper')
    t.ok(html.includes('<div>Hello, World!</div>'),
        'should render nested component')
})
