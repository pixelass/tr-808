import React from 'react';
import classNames from 'classNames';
import {PREFIXER} from '../constants';

/**
 * @class  Button creates a simple button with a callback
 * @property {Function} onClick passes a fubction to clicks
 */
export default class Button extends React.Component {
    /**
     * construct the component
     * @param  {Object} props sent via Component call
     *                        see list of properties in comment above
     */
    constructor(prop) {
        super(prop);
        this.onClick = this.onClick.bind(this);
        this.styles = PREFIXER.prefix({
            button: {
                display: 'inline-flex',
                height: 40,
                minWidth: 40,
                boxSizing: 'border-box',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'uppercase',
                fontSize: 10,
                fontFamily: 'sans-serif',
                margin: '4px auto',
                cursor: 'pointer',
                userSelect: 'none'
            }
        });
    }

    /**
     * handle clicks and call the callback
     * @param  {Event} e the event
     */
    onClick(e) {
        if (typeof this.props.onClick === 'function') {
            this.props.onClick();
        }
    }

    render() {
        let classes = classNames('Button', this.props.className);
        let styles = this.styles;
        return (
            <div className={ classes }
                 onClick={ this.onClick }
                 style={ styles.button }>
                { this.props.children }
            </div>
        );
    }
}