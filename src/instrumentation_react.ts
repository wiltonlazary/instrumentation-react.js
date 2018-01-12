import { getPropertyDescriptorPrototype, bypassNextBinderDispatch } from 'instrumentation.js'

export function observed(params: string | Array<any> = ''): any {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const targetPrototype = target.constructor.prototype

        if (!targetPrototype.__binds__) {
            targetPrototype.__binds__ = []
        }

        targetPrototype.__binds__.push([propertyKey, descriptor, typeof params === 'string' ? [params] : params])
    }
}

export function reactObservedConsumer(value, detail) {
    if (detail.content.changed) {
        console.log('reactObservedConsumer', detail)
        const component = detail.binder.producer

        if (!detail.carrier.onFinished) {
            detail.carrier.onFinished = (value, result) => {
                const __updatedSeq = component.state.__updatedSeq
                bypassNextBinderDispatch()
                component.state.__updatedSeq = !__updatedSeq || __updatedSeq === Number.MAX_SAFE_INTEGER ? 1 : __updatedSeq + 1
                component.forceUpdate()
            }
        }
    }
}

function reactStateObservedConsumer(value, detail) {
    if (detail.content.changed) {
        detail.binder.producer.forceUpdate()
    }

    detail.carrier.preventDefault = true
}

export type ReactConstructorType = { new(props): {} }

export function observer(params: string | Array<any> = '/.*'): any {
    return (target: ReactConstructorType) => {
        const targetPrototype = target.prototype
        let binds: Array<any> = null

        if (targetPrototype.__binds__) {
            binds = targetPrototype.__binds__
            delete targetPrototype.__binds__
        } else {
            binds = []
        }

        binds.push(['state', undefined, [typeof params === 'string' ? [params] : params, reactStateObservedConsumer]])

        const bindOut = function (self, key: string, element: string, comsumer) {
            if (element.length === 0) {
                self.bindOut(key, comsumer)
            } else if (element.startsWith('/')) {
                self.bindOut(`${key}${element}`, comsumer)
            } else {
                self.bindOut(`${key}.${element}`, comsumer)
            }
        }

        const installBinders = function (self) {
            binds.forEach(bindParams => {
                const key = bindParams[0]
                const keyDescriptor = bindParams[1]
                const keyParams = bindParams[2]

                if (keyParams.length === 0) {
                    self.bindOut(key, reactObservedConsumer)
                } else {
                    if (keyParams[0] instanceof Array) {
                        keyParams[0].forEach((element: string) => {
                            bindOut(self, key, element, keyParams[1] || reactObservedConsumer)
                        })
                    } else {
                        bindOut(self, key, keyParams[0], keyParams[1] || reactObservedConsumer)
                    }
                }
            })
        }

        return eval(`(class ${target.name} extends target {
            constructor(props, context) {
                super(props, context)
                installBinders(this)
            }

            componentWillUnmount() {
                if (super.componentWillUnmount) {
                    super.componentWillUnmount()
                }

                this.dispose()
            }
        })`)
    }
}
