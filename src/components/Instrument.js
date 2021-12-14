import React from 'react';
import {PREFIXER} from '../constants';
import Poti from './Poti';
import Toggle from './Toggle';

/**
 * class Instrument creates a channel for an instrument
 * @property {Number} index  the index of the instrument on the board
 * @property {Array}   potis   a list of potis to render/use inside the channel
 * @property {Array}   label   expects an array since an instrument can have
 *                             two labels. can render smallcaps style titles
 *                             - syntax: *C*apitals c*A*n *BE* *E*ve*R*ywhere
 */
export default class Instrument extends React.Component {
    /**
     * construct the component
     * @param  {Object} props sent via Component call
     *                        see list of properties in comment above
     */
    constructor(props) {
        super(props);
        this.onToggle = this.onToggle.bind(this);
        this.poti_0 = this.poti_0.bind(this);
        this.poti_1 = this.poti_1.bind(this);
        this.poti_2 = this.poti_2.bind(this);
        // create names from the labels
        this.names = this.props.label.map((item, index) => {
            // look for ampersands to identify capitals
            let parts = item.split('*');
            let word = parts.map((item, index) => {
                let group =<span key={index}>{item}</span> ;
                // every even match is a capital
                if (Math.floor(index / 2) !== Math.round(index / 2)) {
                    group = <span key={index} style={ {  fontSize: '1.75em'} }>{ item }</span>;
                }
                return group;
            });
            return <span key={index}> word</span>;
        });
        // show potis for channel
        this.potis = this.props.potis.map((item, index) => {
            let poti;
            // optionally show an empty space (lyout,visual)
            if (!item.empty) {
                let potiCallback = `poti_${index}`;
                poti = <Poti
                    className={ item.className }
                             label={ item.label }
                             size={ item.size }
                             onUpdate={this[potiCallback]}
                             fullAngle={ item.fullAngle }
                             markers={ item.markers }
                             resolution={ item.resolution }
                             value={ item.value }
                             range={ item.range }/>;
            } else {
                poti = <div style={ {  height: this.props.potis[index - 1].size * 2} }/>;
            }
            return (<div key={index}>
                { poti }
            </div>);
        });

        let styles = PREFIXER.prefix({
            instrument: {
                cursor: 'default',
                display: 'inline-flex',
                flexDirection: 'column',
            },
            name: {
                fontSize: 6,
                fontFamily: 'sans-serif',
                textTransform: 'uppercase'
            }
        });

        // add first name
        let names = [];
        names.push(
            <div className='InstrumentName'
                 style={ styles.name }>
                { this.names[0] }
            </div>);
        // render a toggle and show the second label if given
        if (this.names[1]) {
            names.push(
                <div style={ PREFIXER.prefix({
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                }
            }).style }>
                    <div style={ PREFIXER.prefix({
                style: {
                    height: 40,
                    display: 'flex',
                    flexDirection: 'column'
                }
            }).style }>
        <span style={ PREFIXER.prefix({
                style: {
                    flex: 1
                }
            }).style }/>
                        <Toggle steps={ 2 }
                                onUpdate={ this.onToggle }
                                selected={ 1 }/>
                <span style={ PREFIXER.prefix({
                style: {
                    flex: 1
                }
            }).style }/>
                    </div>
                    <div className='InstrumentName'
                         style={ styles.name }>
                        { this.names[1] }
                    </div>
                </div>
            );
        }

        // map new values
        this.styles = styles;
        this.names = names;
        this.spacer = (<span style={ PREFIXER.prefix({
            style: {
                flex: 1
            }
        }).style }/>);
    }


    /**
     * Poti callbacks
     */
    poti_0(value) {
        if (typeof this.props.onInstrumentPoti_0 === 'function') {
            this.props.onInstrumentPoti_0(this.props.index, value);
        }
    }

    poti_1(value) {
        if (typeof this.props.onInstrumentPoti_1 === 'function') {
            this.props.onInstrumentPoti_1(this.props.index, value);
        }
    }

    poti_2(value) {
        if (typeof this.props.onInstrumentPoti_2 === 'function') {
            this.props.onInstrumentPoti_2(this.props.index, value);
        }
    }

    /**
     * toggles the primary secondary instrument
     * @param {Number}  selected  should be 0 or 1
     */
    onToggle(selected) {
        if (typeof this.props.onToggle === 'function') {
            this.props.onToggle(this.props.index, selected);
        }
    }

    render() {
        let styles = this.styles;


        return (
            <div className='Instrument'
                 style={ styles.instrument }>
                { this.potis }
                { this.spacer }
                { this.names[0] }
                { this.names[1] }
            </div>
        );
    }
}