class Keyframes {
    constructor(elem) {
        this.elem = elem;
    }

    isSupported() {
        return document.body.style.animationName !== undefined;
    }

    reset(callback) {
        this.removeEvents();
        this.elem.style.animationPlayState = 'running';
        this.elem.style.animation = 'none';

        if (callback) {
            setTimeout(callback, 0);
        }
    }

    pause() {
        this.elem.style.animationPlayState = 'paused';
    }

    resume() {
        this.elem.style.animationPlayState = 'running';
    }
    
    play(frameOptions, callback) {
        if (this.elem.style.animationName === frameOptions.name) {
            this.reset(() => this.play(frameOptions, callback));
            return this;
        }
        
        const animationcss = Keyframes.playCSS(frameOptions);
        
        const addEvent = (type, eventCallback) => {
            const listenerName = `${type}Listener`;
            this.elem.removeEventListener(type, this[listenerName]);
            this[listenerName] = eventCallback;
            this.elem.addEventListener(type, this[listenerName]);
        };
        
        this.elem.style.animationPlayState = 'running';
        this.elem.style.animation = animationcss;
        this.frameOptions = frameOptions;
        
        addEvent('animationiteration', callback || frameOptions.complete);
        addEvent('animationend', callback || frameOptions.complete);
        return this;
    }
    
    removeEvents() {
        this.elem.removeEventListener('animationiteration', this.animationiterationListener);
        this.elem.removeEventListener('animationend', this.animationendListener);
    }
    
    static playCSS(frameOptions) {
        const animObjToStr = function (obj) {
            const newObj = Object.assign({}, {
                duration: '0s',
                timingFunction: 'ease',
                delay: '0s',
                iterationCount: 1,
                direction: 'normal',
                fillMode: 'forwards',
            }, obj);

            return [
                newObj.name,
                newObj.duration,
                newObj.timingFunction,
                newObj.delay,
                newObj.iterationCount,
                newObj.direction,
                newObj.fillMode,
            ].join(' ');
        };

        let animationcss = '';

        if (frameOptions.constructor === Array) {
            const frameOptionsStrings = [];
            for (let i = 0; i < frameOptions.length; i += 1) {
                frameOptionsStrings.push(typeof frameOptions[i] === 'string' ?
                    frameOptions[i] :
                    animObjToStr(frameOptions[i]));
            }
            animationcss = frameOptionsStrings.join(', ');
        } else if (typeof frameOptions === 'string') {
            animationcss = frameOptions;
        } else {
            animationcss = animObjToStr(frameOptions);
        }
        return animationcss;
    }

    static createKeyframeTag(id, css) {
        const elem = document.createElement('style');
        elem.innerHTML = css;
        elem.setAttribute('class', 'keyframe-style');
        elem.setAttribute('id', id);
        elem.setAttribute('type', 'text/css');
        document.getElementsByTagName('head')[0].appendChild(elem);
    }

    static generateCSS(frameData) {
        const frameName = frameData.name || '';
        let css = `@keyframes ${frameName} {`;
        for (const key in frameData) {
            if (key !== 'name' && key !== 'media' && key !== 'complete') {
                css += `${key} {`;

                for (const property in frameData[key]) {
                    css += `${property}:${frameData[key][property]};`;
                }

                css += '}';
            }
        }
        css += '}';

        if (frameData.media) {
            css = `@media ${frameData.media}{${css}}`;
        }
        return css;
    }

    static generate(frameData) {
        const frameName = frameData.name || '';
        const css = this.generateCSS(frameData);

        const kfTagId = `Keyframes${frameName}`;
        const frameStyle = document.getElementById(kfTagId);

        if (frameStyle) {
            frameStyle.innerHTML = css;
        } else {
            Keyframes.createKeyframeTag(kfTagId, css);
        }
    }

    static define(frameData) {
        if (frameData.length) {
            for (let i = 0; i < frameData.length; i += 1) {
                this.generate(frameData[i]);
            }
        } else {
            this.generate(frameData);
        }
    }

    static defineCSS(frameData) {
        if (frameData.length) {
            let css = "";
            for (let i = 0; i < frameData.length; i += 1) {
                css += this.generateCSS(frameData[i]);
            }
            return css;
        } else {
            return this.generateCSS(frameData);
        }
    }

    static plugin(pluginFunc) {
        pluginFunc(Keyframes);
    }
}

export default Keyframes;