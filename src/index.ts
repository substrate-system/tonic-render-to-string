import * as parse5 from 'parse5'

// Polyfill the browser environment
if (typeof global.window === 'undefined') {
    global.window = {}
}

if (typeof global.document === 'undefined') {
    global.document = {
        createElement: (tagName: string) => {
            return {
                tagName: tagName.toUpperCase(),
                childNodes: [],
                attributes: [],
                style: {},
                appendChild: () => { },
                cloneNode: () => ({ content: {} }) // Mock for template check
            }
        },
        head: {
            childNodes: [],
            appendChild: () => { }
        }
    }
}

if (typeof global.HTMLElement === 'undefined') {
    class HTMLElement {
        children: any[]
        childNodes: any[]
        attributes: any[]
        tagName: string
        _id: string
        id: string
        elementName: string
        attrs: any
        nodeName: string
        namespaceURI: string
        parentNode: any
        [key: string]: any

        constructor () {
            this.children = []
            this.childNodes = []
            this.attributes = []
            this._id = 'ssr'
            this.id = 'ssr'
            this.elementName = this.constructor.name
            this.tagName = this.constructor.name.toUpperCase()
            this.nodeName = this.tagName
            this.namespaceURI = 'http://www.w3.org/1999/xhtml'
            this.parentNode = null
        }

        getRootNode () {
            return this
        }

        disabledClientSideCallbacks () {
            this.willConnect = () => { }
            this.connected = () => { }
            this.updated = () => { }
            this.disconnected = () => { }
        }

        async visit (node: any) {
            const registry = global.customElements.registry || {}
            const tagName = node.tagName ? node.tagName.toUpperCase() : null
            const Component = registry[tagName]

            if (Component) {
                const c = new Component()
                c.node = node
                c.disabledClientSideCallbacks()
                c.attributes = node.attrs
                // Mock connectedCallback if it exists on the component
                if (c.connectedCallback) {
                    c.connectedCallback()
                }

                // Handle stylesheets
                const Tonic = global.window.Tonic || global.Tonic
                if (c.stylesheet && Tonic && !Tonic._stylesheetRegistry[tagName]) {
                    Tonic._stylesheetRegistry[tagName] = c.stylesheet()
                }

                const t = await c.render()
                const frag = parse5.parseFragment(t.rawText || t)
                node.childNodes.push(...frag.childNodes)
            }

            if (node.childNodes) {
                for (const child of node.childNodes) {
                    if (child.childNodes) await this.visit(child)
                }
            }
        }

        querySelectorAll (s: string) {
            const tags = s.split(',')
            const elements: any[] = []

            const find = (node: any, tagName: string) => {
                if (!node.childNodes) return
                for (const child of node.childNodes) {
                    if (child.tagName && child.tagName.toUpperCase() === tagName) elements.push(child)
                    if (child.childNodes) find(child, tagName)
                }
            }

            for (const tagName of tags) {
                find(this, tagName.trim().toUpperCase())
            }

            return elements
        }

        async preRender () {
            const t = await this.render()
            const content = t.rawText || t
            const parsed = parse5.parseFragment(content)

            // Copy properties from parsed fragment to this
            this.childNodes = parsed.childNodes

            this.disabledClientSideCallbacks()

            if (this.connectedCallback) {
                this.connectedCallback()
            }

            // Get registered custom element tags from the registry
            const registry = global.customElements.registry || {}
            const tags = Object.keys(registry).join(',')
            if (tags) {
                const nodes = this.querySelectorAll(tags)
                for (const node of nodes) {
                    await this.visit(node)
                }
            }

            // Handle styles
            if (global.Tonic && global.Tonic._stylesheetRegistry) {
                const styles = Object.values(global.Tonic._stylesheetRegistry).join('\n')
                if (styles) {
                    const styleNode = parse5.parseFragment(`<style>${styles}</style>`)
                    this.childNodes.unshift(styleNode.childNodes[0])
                }
            }

            return parse5.serialize(this as any)
        }
    }

    global.HTMLElement = HTMLElement
    global.window.HTMLElement = HTMLElement
}

if (typeof global.customElements === 'undefined') {
    const registry: Record<string, any> = {}
    const customElements = {
        define: (id: string, c: any) => {
            registry[id.toUpperCase()] = c
        },
        get: (id: string) => registry[id.toUpperCase()],
        registry
    }
    global.customElements = customElements
    global.window.customElements = customElements
}

if (typeof global.CustomEvent === 'undefined') {
    // @ts-expect-error ssr
    global.CustomEvent = class CustomEvent { }
}

/**
 * Renders a Tonic component to a string.
 * @param componentInstance An instance of a Tonic component.
 * @returns A promise that resolves to the HTML string.
 */
export async function render (componentInstance: any): Promise<string> {
    if (!componentInstance) {
        throw new Error('Component instance is required')
    }

    // If it's a class, instantiate it
    if (typeof componentInstance === 'function') {
        componentInstance = new componentInstance()  // eslint-disable-line
    }

    if (typeof componentInstance.preRender === 'function') {
        return await componentInstance.preRender()
    }

    // Fallback if preRender is not available (should be if extending our mocked HTMLElement)
    const t = await componentInstance.render()
    return t.rawText || t
}

export { render as renderToString }
