import React from 'react';
import classNames from 'classNames';
import {PREFIXER} from '../constants/';

/**
 * @class Toggle creates a toggle with multiple steps and an optinal visual stem
 * @property {Array|Integer}  steps       if given an Array of values they will
 *                                        be used as labels
 *                                        if given an Integer it defines
 *                                        snappable points and/or return values.
 *                                        - required
 * @property {Number}        activeLight the active light index
 * @property {Number}        selected    initially selected state
 * @property {String}         label       optionally show label
 * @property {Boolean}        stem        optionally show a visual stem
 * @property {Boolean}        horizontal  optionally show as horizontal
 * @property {Array}          lights      an array of Integers
 *                                        if the Integer equals the selected
 *                                        index the light is on. this allows to
 *                                        render lights for speciffic selections
 * @property {Function}       onUpdate    a callback to communicate with other
 *                                        components
 */
export default class Toggle extends React.Component {
    /**
     * construct the component
     * @param  {Object} props sent via Component call
     *                        see list of properties in comment above
     */
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.size = 14;
        // save stem for easy access
        this.stem = this.props.stem;
        // save lights for easy access
        this.lights = this.props.lights;
        // support horizontal layout (vetical is default)
        this.horizontal = this.props.orientation === 'horizontal';
        // build steps
        this.steps = [];
        let isNumber = typeof this.props.steps === 'number';
        if (isNumber) {
            let n = this.props.steps;
            while (n--) {
                this.steps.push('');
            }
        } else {
            this.steps = this.props.steps;
        }
        // build labels from steps
        this.labels = this.steps.map((item, index) => {
            // label styles
            // make sure we handle the orientation correctly
            let styles = PREFIXER.prefix({
                label: {
                    position: 'absolute',
                    top: this.horizontal ? '100%' : (index * this.size),
                    left: this.horizontal ? (index * this.size) : '100%',
                    pointerEvents: 'none',
                    fontSize: 6,
                    fontFamily: 'sans-serif',
                    paddingLeft: this.horizontal ? 0 : 2,
                    paddingTop: this.horizontal ? 2 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: this.size,
                    width: this.size
                }
            });

            return <div key={index} style={ styles.label }>
                { item }
            </div>;
        });

        // component styles
        // handle orientation
        this.styles = PREFIXER.prefix({
            toggle: {
                position: 'relative',
                height: this.horizontal ? this.size / 2 : this.steps.length * this.size,
                width: this.horizontal ? this.steps.length * this.size : this.size / 2,
                margin: '5px auto 20px',
                cursor: 'pointer'
            },
            switch: {
                position: 'absolute',
                height: this.horizontal ? this.size - 4 : this.size,
                width: this.horizontal ? this.size : this.size - 4,
                top: this.horizontal ? '50%' : 0,
                left: this.horizontal ? 0 : '50%',
                marginLeft: 1,
                backgroundColor: 'currentColor',
                pointerEvents: 'none',
                transition: 'transform 0.2s',
            },
            stem: {
                pointerEvents: 'none',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transformOrigin: this.horizontal ? '0% 50%' : '50% 0%',
                height: this.horizontal ? this.size - 4 : `${50 * this.steps.length}%`,
                width: this.horizontal ? `${50 * this.steps.length}%` : this.size - 4,
                transition: 'transform 0.2s',

            },
            cap: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                height: this.size,
                width: this.size,
                transition: 'transform 0.2s',
            },
            label: {
                fontSize: 8,
                fontFamily: 'sans-serif',
                textTransform: 'uppercase',
                margin: '10px 0'
            },
            lights: {

                height: this.horizontal ? 22 : '100%',
                width: this.horizontal ? '100%' : 22,
                boxSizing: 'border-box',
                display: 'flex',
                margin: this.horizontal ? '0 0 6px' : '0',
                alignItems: 'center',
                justifyContent: 'space-between',
                top: this.horizontal ? '100%' : '0%',
                left: this.horizontal ? '100%' : '100%',
                backgroundColor: 'currentColor',
                padding: '0 6px',
                transform: `scale(0.6)`
            }
        });

        // set initial state
        this.state = {
            selected: this.props.selected || 0
        };
    }

    /**
     * handle clicks and toggle the state
     * @param  {Event} e the event
     */
    onClick(e) {
        // use native event to get access to e.offset{X,Y} and/or e.layer{X,Y}
        e = e.nativeEvent;
        // use offset or layer
        // and respect orientation
        let offset = e.offsetY || e.layerY;
        if (this.horizontal) {
            offset = e.offsetX || e.layerX;
        }

        let length = this.steps.length;
        // calculate selected
        let selected = Math.round(offset / (length * this.size) * length - 0.5);
        // ensure bounds
        selected = Math.max(0, Math.min((length - 1), selected));
        // update state
        this.setState({
            selected: selected
        });

        if (typeof this.props.onUpdate === 'function') {
            this.props.onUpdate(selected);
        }
    }

    render() {
        let classes = classNames('Toggle', this.props.classNames, {
            '_horizontal': this.horizontal,
            '_stem': this.stem
        });

        // offset the switch to the current selected index
        let switchOffset = this.state.selected * this.size;
        // build the stem
        let stem = 1;
        if (this.stem) {
            let stemOffset = ((this.steps.length - 1) / 2);
            let baseAngle = (Math.PI / this.steps.length);
            stem = Math.sin((this.state.selected - stemOffset) * baseAngle);
        }

        // extend styles
        let dynamicStyles = PREFIXER.prefix({
            switch: {
                transform: this.horizontal ? `translate(${switchOffset}px, -50%)` :
                    `translate(-50%,${switchOffset}px)`
            },
            stem: {
                transform: `scale${this.horizontal ? 'X' : 'Y'}(${stem * -1})
                    translate${this.horizontal ? 'Y' : 'X'}(-50%)
                    translate${this.horizontal ? 'X' : 'Y'}(${this.size / -4}px)`,
            },
            cap: {
                transform: `translate(-50%,-50%)
                    scale${this.horizontal ? 'X' : 'Y'}(${1.1 - Math.abs(stem / 2)})
                    scale${this.horizontal ? 'Y' : 'X'}(${1.0 - Math.abs(stem / 5)})`
            }
        });

        Object.assign(this.styles.switch, dynamicStyles.switch);
        Object.assign(this.styles.stem, dynamicStyles.stem);
        Object.assign(this.styles.cap, dynamicStyles.cap);

        let styles = this.styles;
        // render optional elements
        let stemElement, label, lights;
        // stem
        if (this.stem) {
            stemElement = (<div>
                <div className='stem'
                     style={ styles.stem }/>
                <div className='cap'
                     style={ styles.cap }/>
            </div>);
        }
        // label
        if (this.props.label) {
            label = <div style={ styles.label }>
                { this.props.label }
            </div>;
        }
        // lights
        if (this.lights) {
            // map lights to include the selected state
            let allLights = this.lights.map((item, index) => {
                let styles = {
                    light: {
                        height: 12,
                        width: 12,
                        borderRadius: '100%',
                        background: index === this.props.activeLight ? 'red' : 'black'
                    }
                };
                return (<div key={index} className='light'
                             style={ styles.light }/>);
            });
            lights = <div style={ styles.lights }>
                { allLights }
            </div>;
        }

        return (
            <div>
                { label }
                <div className={ classes }
                     style={ styles.toggle }
                     onClick={ this.onClick }>
                    <div className='ToggleSwitch'
                         style={ styles.switch }>
                        { stemElement }
                    </div>
                    <div className='labels'>
                        { this.labels }
                    </div>
                </div>
                { lights }
            </div>
        );
    }
}
