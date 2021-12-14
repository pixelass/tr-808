import React from 'react';
import {PREFIXER} from '../constants';
import classNames from 'classNames';

/**
 * @class Step defines a step with three states [off,selected,active]
 * @property {Boolean} selected  initial selected state
 * @property {Boolean} active    active state
 * @property {Number} count     number above && index + 1
 * @property {Number} rhythm    number below
 * @property {Function}       onUpdate  a callback to communicate with other
 *                                      components
 */
export default class Step extends React.Component {
    /**
     * construct the component
     * @param  {Object} props sent via Component call
     *                        see list of properties in comment above
     */
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        // set initial state
        this.state = {
            selected: this.props.selected
        };
        // component styles
        this.styles = PREFIXER.prefix({
            step: {
                position: 'relative',
                height: 55,
                width: 26,
                margin: '20px 6px 30px',
                backgroundColor: 'currentColor'
            },
            light: {
                position: 'absolute',
                top: 5,
                height: 5,
                width: 5,
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '100%',
            },
            glow: {
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                borderRadius: 'inherit'
            },
            count: {
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: 5,
                fontSize: 8,
                width: '100%',
                textAlign: 'center',
                fontFamily: 'sans-serif'
            },
            rhythm: {
                position: 'absolute',
                top: '100%',
                left: this.props.count === 13 ? -2 : this.props.count === 1 ? -60 : -6,
                right: this.props.count === 12 ? -2 : this.props.count === 16 ? -12 : -6,
                marginTop: 10,
                paddingTop: 1,
                paddingBottom: 1,
                paddingLeft: this.props.count === 13 ? 2 : this.props.count === 1 ? 60 : 6,
                paddingRight: this.props.count === 12 ? 2 : this.props.count === 16 ? 12 : 6,
                fontSize: 12,
                lineHeight: 1,
                borderRadius: this.props.count === 12 ? '0 2px 2px 0' : this.props.count === 13 ? '2px 0 0 2px' : false,
                textAlign: 'center',
                fontFamily: 'sans-serif'
            }
        });
    }

    /**
     * handle clicks and toggle the state
     * @param  {Event} e the event
     */
    onClick(e) {
        let selected = this.props.selected;
        selected = !selected;

        // send action to parent
        // no internal state
        if (typeof this.props.onUpdate === 'function') {
            this.props.onUpdate((this.props.count - 1), selected);
        }
    }

    render() {
        let classes = classNames(
            'Step',
            this.props.className,
            {
                selected: this.props.selected,
                active: this.props.active,
            });

        // add dynamic styles
        let dynamicStyles = {
            light: {
                backgroundColor: this.props.selected || this.props.active ? 'red' : 'black'
            }
        };

        Object.assign(this.styles.light, dynamicStyles.light);

        let styles = this.styles;

        return (
            <div className={ classes }
                 onClick={ this.onClick }
                 style={ styles.step }>
                <div className='count'
                     style={ styles.count }>
                    { this.props.count }
                </div>
                <div className='rhythm'
                     style={ styles.rhythm }>
                    { this.props.rhythm }
                </div>
                <div className='StepLight'
                     style={ styles.light }>
                    <div className='glow'
                         style={ styles.glow }/>
                </div>
            </div>
        );
    }
}