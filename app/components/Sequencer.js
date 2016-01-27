import React from 'react';
import classNames from 'classNames';
import {PREFIXER} from '../constants';
import Step from './Step';
import Toggle from './Toggle';
import Scale from './Scale';

/**
 * class Sequencer defines a collection of steps that can edit the pattern
 * of the selected track
 * @property {Number} activeStep lights a step if active while playing
 * @property {Array}   pattern    defines the steps that are selected (visual)
 * @property {Array}   part       defines which part of the pattern to edit (0,1 equals A,B)
 */
export default class Sequencer extends React.Component {

    /**
     * construct the component
     * @param  {Object} props sent via Component call
     *                        see list of properties in comment above
     */
    constructor(props) {
        super(props);
        this.setStep = this.setStep.bind(this);
        // wrapper styles
        this.styles = PREFIXER.prefix(
            {
                stepsWrapper: {
                    display: 'flex',
                    flex: 1
                }
            }
        );
    }

    /**
     * toggles a step and sends a callback
     * @param {Number} index     the index of the step
     * @param {Boolean} selected  selected state of the step
     */
    setStep(index, selected) {
        if (typeof this.props.onStepChange === 'function') {
            this.props.onStepChange(index, selected);
        }
    }


    render() {
        // desine steps inside the render function to pass the activeStep
        // four different colors will be used to create collection
        let steps = ['red', 'orange', 'yellow', 'white'].map((item, index) => {
            let stepCount = 4;
            let steps = [];
            let classes = classNames('_colored', item);
            let count = index * stepCount;
            while (stepCount--) {
                // build rhythm numbers
                let rhythm = count % 12 + 1;
                count++;
                // check states
                let active = (this.props.activeStep - this.props.part * 16) === (count - 1);
                let selected = this.props.pattern[count - 1 + this.props.part * 16];
                // add steps to collection
                steps.push(<Step className={ classes }
                                 count={ count }
                                 rhythm={ rhythm }
                                 active={ active }
                                 selected={ selected }
                                 onUpdate={ this.setStep }/>);
            }
            return steps;
        });

        /**
         * TODO: move step creation outside the render function
         *       and reduce impact
         */
        return (
            <div>
                <div style={ {  position: 'relative'} }>
                    <div style={ {  position: 'absolute',  top: 0,  right: '100%',  width: 60,  paddingTop: 12} }>
                        <div className='ScaleToggler'>
                            <Toggle steps={ [1, 2, 3, 4] }/>
                        </div>
                        <div className='Arrow right grey'>STEP NO</div>
                        <div className='LightLabel'>
                            <div className='light'
                                 style={{borderRadius: '100%',height: 8, width: 8, background: this.props.part === 0 ? 'red':'black',margin: '1em'}}/>
                            1st PART
                        </div>
                        <div className='LightLabel'>
                            <div className='light'
                                 style={{borderRadius: '100%',height: 8, width: 8, background: this.props.part === 1 ? 'red':'black',margin: '1em'}}/>
                            2nd PART
                        </div>
                    </div>
                    <div>
                        <Scale swing={ 2 }
                               measures={ [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1]] }/>
                        <Scale swing={ 5 }
                               measures={ [[1, 0, 1, 0, 1, 0], [1, 0, 1, 0, 1, 0], [1, 0, 1, 0]] }/>
                        <Scale measures={ [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]] }/>
                        <Scale measures={ [[1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0]] }/>
                    </div>
                </div>
                <div style={ this.styles.stepsWrapper }>
                    { steps }
                </div>
            </div>
        );
    }
}