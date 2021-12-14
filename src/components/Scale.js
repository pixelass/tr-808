import React from 'react';
import {PREFIXER} from '../constants';

/**
 * @class  Scale displays a scale for a rhythm
 * @property {Array}   measure  an Array of [1,0,0...] Arrays where the
 *                              1 or 0 define a note
 * @property {Number} swing    shows a bow from 0 to this note (index)
 */
export default class Scale extends React.Component {
    /**
     * construct the component
     * @param  {Object} props sent via Component call
     *                        see list of properties in comment above
     */
    constructor(props) {
        super(props);
        this.styles = PREFIXER.prefix({
            scale: {
                display: 'flex',
                width: '100%',
                justifyContent: 'space-around'
            }
        });
        // map measures
        this.measures = this.props.measures.map((items, index) => {
            let lastItem = index === (this.props.measures.length - 1);
            let swing = this.props.swing;
            // measures styles
            let styles = PREFIXER.prefix({
                measure: {
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'space-around',
                    flex: items.length,
                    padding: '6px 0 0',
                    margin: '2px 0',
                    borderTopRightRadius: swing && lastItem ? 0 : false,
                    borderBottomRightRadius: swing && lastItem ? 0 : false,

                }
            });

            // map notes from item
            let notes = items.map((item, index) => {
                let styles = PREFIXER.prefix({
                    note: {
                        position: 'relative',
                        flex: '0 0 26px',
                        display: 'flex',
                        justifyContent: 'center',
                        fontSize: 14,
                    },
                    bow: {
                        position: 'absolute',
                        top: -3,
                        left: 18,
                        width: `${(Math.floor((swing || 0) / 2) * 2) * 130 + Math.pow(swing, 2) * 1.5}%`,
                        height: 8,
                        borderRadius: '100%',
                        boxShadow: '0 -1px 0'
                    }
                });
                let bow;
                // add the bow if needed
                if (swing && index === 0) {
                    bow = <div className='note-bow'
                               style={ styles.bow }/>;
                }
                let note;
                // only show if item == 1 (true) and not if item == 0 (false)
                if (item) {
                    note = '♪';
                }

                return (
                    <div key={index}  className="note"
                         style={ styles.note }>
                        { note }
                        { bow }
                    </div>
                );
            });

            return <div  key={index} className="ScaleMeasure"
                        style={ styles.measure }>
                { notes }
            </div>;
        });
    }

    render() {

        let styles = this.styles;
        return (
            <div className='Scale'
                 style={ styles.scale }>
                { this.measures }
            </div>
        );
    }
}
