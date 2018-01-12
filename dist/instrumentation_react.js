"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instrumentation_js_1 = require("instrumentation.js");
function observed(params = '') {
    return (target, propertyKey, descriptor) => {
        const targetPrototype = target.constructor.prototype;
        if (!targetPrototype.__binds__) {
            targetPrototype.__binds__ = [];
        }
        targetPrototype.__binds__.push([propertyKey, descriptor, typeof params === 'string' ? [params] : params]);
    };
}
exports.observed = observed;
function reactObservedConsumer(value, detail) {
    if (detail.content.changed) {
        console.log('reactObservedConsumer', detail);
        const component = detail.binder.producer;
        if (!detail.carrier.onFinished) {
            detail.carrier.onFinished = (value, result) => {
                const __updatedSeq = component.state.__updatedSeq;
                instrumentation_js_1.bypassNextBinderDispatch();
                component.state.__updatedSeq = !__updatedSeq || __updatedSeq === Number.MAX_SAFE_INTEGER ? 1 : __updatedSeq + 1;
                component.forceUpdate();
            };
        }
    }
}
exports.reactObservedConsumer = reactObservedConsumer;
function reactStateObservedConsumer(value, detail) {
    if (detail.content.changed) {
        detail.binder.producer.forceUpdate();
    }
    detail.carrier.preventDefault = true;
}
function observer(params = '/.*') {
    return (target) => {
        const targetPrototype = target.prototype;
        let binds = null;
        if (targetPrototype.__binds__) {
            binds = targetPrototype.__binds__;
            delete targetPrototype.__binds__;
        }
        else {
            binds = [];
        }
        binds.push(['state', undefined, [typeof params === 'string' ? [params] : params, reactStateObservedConsumer]]);
        const bindOut = function (self, key, element, comsumer) {
            if (element.length === 0) {
                self.bindOut(key, comsumer);
            }
            else if (element.startsWith('/')) {
                self.bindOut(`${key}${element}`, comsumer);
            }
            else {
                self.bindOut(`${key}.${element}`, comsumer);
            }
        };
        const installBinders = function (self) {
            binds.forEach(bindParams => {
                const key = bindParams[0];
                const keyDescriptor = bindParams[1];
                const keyParams = bindParams[2];
                if (keyParams.length === 0) {
                    self.bindOut(key, reactObservedConsumer);
                }
                else {
                    if (keyParams[0] instanceof Array) {
                        keyParams[0].forEach((element) => {
                            bindOut(self, key, element, keyParams[1] || reactObservedConsumer);
                        });
                    }
                    else {
                        bindOut(self, key, keyParams[0], keyParams[1] || reactObservedConsumer);
                    }
                }
            });
        };
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
        })`);
    };
}
exports.observer = observer;

//# sourceMappingURL=instrumentation_react.js.map
