import React from 'react';
import Tone from 'tone';
import classNames from 'classNames';
import Button from './Button';
import Poti from './Poti';
import Sequencer from './Sequencer';
import Instrument from './Instrument';
import Toggle from './Toggle';

import {PREFIXER, INSTRUMENTS, CODEPENLOGO, ROLANDLOGO, BUCKET} from '../constants';

/**
 * class Eight_O_Eight is the actual instrument
 * It loads an instance of Tone.js (https://github.com/Tonejs/Tone.js)
 * to play the sounds.
 * patterns are stored inside the component and then used by Tone.js
 * Currently activated controls:
 *   - Mater volume       : changes the master volume
 *   - Tempo              : changes the bpm
 *   - Instrument-select  : changes the track
 *   - Start/Stop         : starts or stops the loop
 *   - Sequencer          : Steps change the pattern of the selected track
 *   - Instrument toggle  : the second instrument on some chanels (lc,mc,hc,cl,ma)
 *   - Instrument volume  : volume of single tracks (level)
 */
export default class Eight_O_Eight extends React.Component {
    /**
     * construct the component
     * This component has no properties as it is meant as an app
     * depending on the changes it might get a `samples` property to load different sets.
     */
    constructor() {
        super();
        this.steps = 32;
        let emptyPattern = [];
        for (let i = 0; i < this.steps; i++) {
            emptyPattern.push(false);
        }
        this.state = {
            track: 1,
            pattern: emptyPattern,
            activeStep: -1,
            activePart: 0,
            editingPart: 0,
            style: 0
        };
        this.initBPM = 132;
        this.toggleStyle = this.toggleStyle.bind(this);
        this.togglePlay = this.togglePlay.bind(this);
        this.createSequencer = this.createSequencer.bind(this);
        this.setTempo = this.setTempo.bind(this);
        this.onStepChange = this.onStepChange.bind(this);
        this.setStep = this.setStep.bind(this);
        this.updatePattern = this.updatePattern.bind(this);
        this.changeTrack = this.changeTrack.bind(this);
        this.changeMasterVolume = this.changeMasterVolume.bind(this);
        this.onInstrumentToggle = this.onInstrumentToggle.bind(this);
        this.onInstrumentLevel = this.onInstrumentLevel.bind(this);
        this.onInstrumentPoti_1 = this.onInstrumentPoti_1.bind(this);
        this.onInstrumentPoti_2 = this.onInstrumentPoti_2.bind(this);
        this.createSampler = this.createSampler.bind(this);
        this.onBasicVariation = this.onBasicVariation.bind(this);
        this.toggleEditingPart = this.toggleEditingPart.bind(this);

        this.basicVariation = 0;
        // build the matrix for later manipulation
        this.tracksMap = {};
        this.matrix = {};
        for (let i = 0; i < this.steps; i++) {
            this.matrix[i] = {};
        }
        // extend the matrix by our instruments
        // and build the track map
        INSTRUMENTS.forEach((item, index) => {
            for (let i = 0; i < this.steps; i++) {
                this.matrix[i][index] = 0;
            }
            this.tracksMap[index] = {
                selected: 0,
                poti1: item.potis[1] ? '50' : false,
                poti2: item.potis[2] ? '50' : false,
                tracks: item.tracks
            };
            if (item.potis[1] && item.potis[1].empty) {
                this.tracksMap[index].poti1 = false;
            }
        });
        // let's make sure the pattern is initially set
        this.updatePattern();
        // predefine the tracks
        this.instruments = INSTRUMENTS.map((item, index) => {
            return (
                <Instrument name={ item.name }
                            label={ item.label }
                            index={ index }
                            handle={ item.handle }
                            potis={ item.potis }
                            onInstrumentPoti_0={ this.onInstrumentLevel }
                            onInstrumentPoti_1={ this.onInstrumentPoti_1 }
                            onInstrumentPoti_2={ this.onInstrumentPoti_2 }
                            onToggle={ this.onInstrumentToggle }/>
            );
        });
        // buoild the data for the potis
        this.tracksPoti = INSTRUMENTS.map(item => ({
            label: item.handle
        }));
        this.measuresPoti = ['manual', 16, 12, 8, 4, 2].map(item => ({
            label: item
        }));
        this.tempoPoti = ['0', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(item => ({
            label: item
        }));
        this.masterVolumePoti = ['min', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'max'].map(item => ({
            label: item
        }));
        this.patternWritePoti = ['pattern clear', '1st PART', '2nd PART', 'manual play', 'play', 'com- pose'].map(item => ({
            label: item
        }));
        this.screws = [];
        for (let i = 0; i < 16; i++) {
            this.screws.push(<div className='Screw'/>);
        }

        // component styles
        this.styles = PREFIXER.prefix({
            name: {
                fontFamily: 'Josefin Sans, sans-serif',
                fontSize: 40,
                position: 'relative',
                display: 'flex',
                flex: 1,
                flexWrap: 'wrap',
                paddingRight: 30,
                lineHeight: 1,
                justifyContent: 'flex-end',
                alignItems: 'baseline'
            },
            underline: {
                position: 'absolute',
                top: '1em',
                left: 0,
                width: '100%',
                height: 2,
                background: 'currentColor',
                marginTop: '-0.175em'
            },
            eightoeight: {
                display: 'flex',
                flexDirection: 'column',
                width: 980
            },
            top: {
                display: 'flex',
            },
            flexBox: {
                display: 'flex'
            },
            patternWrite: {
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: 40,
                paddingLeft: 20,
            },
            flexBoxFlex: {
                display: 'flex',
                flex: 1
            },
            flexBoxCenter: {
                display: 'flex',
                alignItems: 'center',
            },
            flexBoxColumn: {
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
            },
            mainControl: {
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                width: 200
            },
            tapArea: {
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                width: 140
            },
            blackLine: {
                height: 2,
                background: 'currentColor',
                width: 'calc(100% - 10px)',
                margin: '10px 0',
            }
        });
        // build the sequencer with Tone.js
        this.createSequencer();
    }

    /**
     * toggles the editing part of the sequencer
     * @param {Number}  selected  either 0 or 1
     */
    toggleEditingPart(selected) {
        this.setState({editingPart: selected});
    }

    /**
     * callback for basic variation changes
     * @param {Number}  selected  either 0, 1 or 2
     */
    onBasicVariation(selected) {
        this.basicVariation = selected;
        this.loop.loopStart = '0m';
        this.loop.loopEnd = '1m';
        if (this.basicVariation > 0) {
            this.loop.loopEnd = '2m';
        }
        if (this.basicVariation > 1) {
            this.loop.loopStart = '1m';
        }
    }

    /**
     * callback for instrument toggles
     * @param {Number}  index     index of the insrument on the board
     * @param {Number}  selected  either 0 or 1
     */
    onInstrumentToggle(index, selected) {
        // change direction due to layout direction
        selected = selected === 1 ? 0 : 1;
        this.tracksMap[index].selected = selected;
    }

    /**
     * callback for instrument volumes
     * @param {Number}  index     index of the insrument on the board
     * @param {Number}  db        value from 1 to 127
     */
    onInstrumentLevel(index, db) {
        if (index > 0) {
            let value = (db - 127 / 2) / 4;
            this.samplers[index].volume.value = value;
        }
    }

    /**
     * callback for instrument poti 1
     * @param {Number}  index     index of the insrument on the board
     * @param {Number}  value     value from 0 to 100 in steps of 25
     */
    onInstrumentPoti_1(index, value) {
        this.tracksMap[index].poti1 = value;
    }

    /**
     * callback for instrument poti 2
     * @param {Number}  index     index of the insrument on the board
     * @param {Number}  value     value from 0 to 100 in steps of 25
     */
    onInstrumentPoti_2(index, value) {
        this.tracksMap[index].poti2 = value;
    }

    /**
     * creates the sequencer with Tone.js (see component description for more info)
     */
    createSequencer() {
        // use the Tone.Sampler to create the tracks (http://tonejs.org/docs/#Sampler)
        this.samplers = [];
        this.loopSteps = [];
        for (let i = 0; i < this.steps; i++) {
            this.loopSteps.push(i);
        }

        // push an empty object to fix the index for the accent channel
        this.samplers.push({});
        // then create all samplers
        this.createSampler(['BD'], 2);
        this.createSampler(['SD'], 2);
        this.createSampler(['LT', 'LC'], 1);
        this.createSampler(['MT', 'MC'], 1);
        this.createSampler(['HT', 'HC'], 1);
        this.createSampler(['RS', 'CL'], 0);
        this.createSampler(['CP', 'MA'], 0);
        this.createSampler(['CB'], 0);
        this.createSampler(['CY'], 2);
        this.createSampler(['OH'], 1);
        this.createSampler(['CH'], 0);

        // define a loop on the component so we can control it
        this.loop = new Tone.Sequence((time, col) => {
            var column = this.matrix[col];
            // on each iteration change the activeStep
            // this will be passed to our <Sequencer> component and
            // visually play the steps
            let steps = this.steps / 2

            this.setState({
                activeStep: col,
                activePart: Math.floor(col / steps) // requires a stop/start if chaged
                // TODO: fix it already!!!
            });
            // loop through all instruments
            // and play a tone for each true value in the pattern
            for (var i = 1; i < INSTRUMENTS.length; i++) {
                if (column[i] === true) {
                    // get the correct sample from the map
                    let track = this.tracksMap[i];
                    let note = track.tracks[track.selected].toUpperCase();
                    if (track.poti1 !== false) {
                        note += `.${track.poti1}`;
                    }
                    if (track.poti2 !== false) {
                        note += `.${track.poti2}`;
                    }
                    let velocity = column[0] ? 1.3 : 0.6;
                    this.samplers[i].triggerAttackRelease(note, '1m', time, velocity);
                }
            }
        }, this.loopSteps, '16n');
        this.loop.loopStart = '0m';
        this.loop.loopEnd = '1m';

        // set initial options to the sequencer and start the transport
        Tone.Transport.bpm.value = this.initBPM;
        Tone.Transport.start();
        // hide the loading message when all buffers are loaded
        Tone.Buffer.on('load', ()=> {
            this.setState({
                buffersLoaded: true
            });
        });
    }

    /**
     * creates a sampler for the given instrument, respects the number of potis
     * @param {String}  handle    uppercase handle of the track
     * @param {Number} potiCount number of potis. describes how many samples are loaded {0|1|2}
     */
    createSampler(handles, potiCount) {
        let steps = ['0', '25', '50', '75', '100'];
        let sampleMap = {}
        /**
         * get the value for the sample Name part
         * @param {String}  the string matches the value of the poti
         */
        let getValue = (item)=> {
            let value = item;
            if (item === '0') {
                value = '00';
            } else if (item === '100') {
                value = '10';
            }
            return value;
        }
        // loop trough the  steps twice if needed
        // TODO: write a recusive function for this
        // some instruments have two different samples
        // lets add each as a main channel
        handles.forEach((handle, index)=> {
            handle = handle.toUpperCase();
            // while the level poti does not count
            // ==>
            // no poti will create 1 sound in total
            sampleMap[handle] = `${BUCKET + handle}.WAV`;
            // first poti will create 5 sounds in total
            if (potiCount >= 1) {
                sampleMap[handle] = {};
                steps.forEach((item, index)=> {
                    let key = item;
                    let value = getValue(item);
                    sampleMap[handle][key] = `${BUCKET + handle + value}.WAV`;
                    // second poti will create 25 sounds in total
                    if (potiCount >= 2) {
                        sampleMap[handle][key] = {};
                        steps.forEach((item, index)=> {
                            let key2 = item;
                            let value2 = getValue(item);
                            sampleMap[handle][key][key2] = `${BUCKET + handle + value + value2}.WAV`
                        });
                    }
                });
            }
        });
        // send the sampler to the master and add it to the list
        let sampler = new Tone.Sampler(sampleMap).toMaster();
        this.samplers.push(sampler);
    }

    /**
     * starts and stops the loop
     */
    togglePlay() {
        let playing = this.state.playing;
        this.playing = !this.playing;
        if (this.playing) {
            this.loop.start();
        } else {
            this.loop.stop();
            // make sure we manually deactivate the activeStep
            this.setState({activeStep: -1});
        }
    }

    /**
     * sets the tempo
     * @param {Number} bpm the beats per minute
     */
    setTempo(bpm) {
        Tone.Transport.bpm.value = bpm;
    }

    /**
     * changes the track for the pattern display
     * @param  {Number} handle lookup for the track
     */
    changeTrack(handle) {
        this.setState({
            track: handle
        });
        this.updatePattern(handle);
    }

    /**
     * changes the master volume
     * @param  {Number} db  decibel to change by
     */
    changeMasterVolume(db) {
        Tone.Master.volume.value = db;

    }

    /**
     * sends the pattern to the state so the Sequencer can recognize it
     * @param  {Number} track the index of the track column
     */
    updatePattern(track = this.state.track) {
        let pattern = [];
        // set the correct steps in the pattern
        for (let step in this.matrix) {
            pattern.push(this.matrix[step][track]);
        }
        this.setState({
            pattern: pattern
        });
    }

    /**
     * used in callback for the Sequencer
     * @param {Number} index    index of step
     * @param {Boolean} selected state of step
     */
    setStep(index, selected) {
        let col = index + this.steps / 2 * this.state.editingPart;
        this.matrix[col][this.state.track] = selected;
        this.updatePattern();
    }

    /**
     * callback for sequencer calls setStep to send to the pattern
     * @param {Number} index    index of step
     * @param {Boolean} selected state of step
     */
    onStepChange(index, selected) {
        this.setStep(index, selected);
    }

    /**
     * changes the style from original (Roland) to CodePen
     */
    toggleStyle() {
        let style = this.state.style === 1 ? 0 : 1;
        this.setState({
            style: style
        })
    }

    render() {
        let loadingBuffers;
        if (!this.state.buffersLoaded) {
            loadingBuffers = (<div className='LoadingBuffers'>
                <div className='Loader'>
                    <div/>
                    <div/>
                    <div/>
                </div>
                <div>Loading buffers, please be patient ...</div>
            </div>);
        }

        let styles = this.styles;
        let tracks = this.tracksPoti;
        let measures = this.measuresPoti;
        let tempo = this.tempoPoti;
        let masterVolume = this.masterVolumePoti;
        let patternWrite = this.patternWritePoti;
        let titleLeft = this.state.style === 1 ? 'Thank you followers' : 'Rhythm Controller';
        let titleRight = this.state.style === 1 ? 'CP-888' : 'TR-808';
        let subTitle = this.state.style === 1 ? 'CodePen Controlled' : 'Computer Controlled';
        let logo = this.state.style === 1 ? CODEPENLOGO : ROLANDLOGO;

        let classes = classNames(
            'Eight_0_Eight',
            {
                roland: this.state.style === 0,
                codepen: this.state.style === 1,
            }
        );
        return (
            <div className={ classes }
                 style={ styles.eightoeight }>
                <div>
                    { loadingBuffers }
                    <div className="onOfflabels">
                        <div>Power</div>
                        <div>on</div>
                        <div>off</div>
                    </div>
                    <Button className='onOffButton' onClick={this.toggleStyle}/>
                    <div className='Screws'>{ this.screws }</div>
                    { logo }
                </div>
                <div className='top'
                     style={ styles.top }>
                    <div className='left'
                         style={ {  width: 230} }>
                        <div style={ styles.flexBox }>
                            <div className="FAKECLEAR">
                                <div>step number</div>
                                <div>pre-scale</div>
                                <div>track clear</div>
                                <div className="FAKECLEARBUTTON"/>
                            </div>
                            <div style={ styles.patternWrite }>
                                <Poti className='pattern-write'
                                      label='pattern write'
                                      size='60'
                                      snap={ true }
                                      fullAngle={ 160 }
                                      value={ 4 }
                                      snap={ true }
                                      range={[ 1, 6 ]}
                                      steps={ patternWrite }/>
                            </div>
                            <Poti className='instrument-select'
                                  label='instrument-select'
                                  label2='rhythm track'
                                  size='60'
                                  snap={ true }
                                  value={ 1 }
                                  numbered={ true }
                                  steps={ tracks }
                                  range={ [0, 11] }
                                  onUpdate={ this.changeTrack }/>
                        </div>
                        <div style={ styles.flexBox }>
                            <div style={ {  width: 140, position: 'relative'} }>
                                <div className='tempoBoxBorder'/>
                                <Poti label='tempo'
                                      className='_ring'
                                      size='130'
                                      fullAngle='300'
                                      markers={ 51 }
                                      value={ this.initBPM }
                                      range={ [80, 200] }
                                      steps={ tempo }
                                      onUpdate={ this.setTempo }/>
                            </div>
                            <div style={ styles.flexBoxColumn }>
                                <Poti className='measures'
                                      label='measures'
                                      label2='auto fill in'
                                      size='60'
                                      snap={ true }
                                      fullAngle='160'
                                      steps={ measures }
                                      labelsBelow={ true }/>
                                <Poti label='fine'
                                      className=''
                                      size='40'
                                      resolution={0.2}
                                      fullAngle='340'
                                      range={ [-5, 5] }
                                      value={ 5 }
                                      steps={ [{ label: 'slow'},{},{},{},{},{},{},{},{},{ label: 'fast'}] }/>
                            </div>
                        </div>
                    </div>
                    <div className='right'>
                        <div style={ styles.flexBox }>
                            { this.instruments }
                        </div>
                        <div style={ styles.flexBoxCenter }>
                            <div className='title-area'
                                 style={ styles.name }>
    <span className='primary'
          style={ {  position: 'relative',  zIndex: 1,  paddingRight: 30} }>{titleLeft}</span>
        <span className='primary'
              style={ {  position: 'relative',  zIndex: 1,  fontSize: '0.5em'} }>{titleRight}</span>
        <span className='underline'
              style={ styles.underline }/>
                                <span className='secondary'>{subTitle}</span>
                            </div>
                            <div style={ {  margin: '5px 20px 0'} }>
                                <Poti label='master volume'
                                      size='60'
                                      fullAngle='300'
                                      range={ [-30, 30] }
                                      value={ 0 }
                                      labelsBelow={ true }
                                      steps={ masterVolume }
                                      onUpdate={this.changeMasterVolume}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='bottom'
                     style={ styles.flexBox }>
                    <div className='main-control'
                         style={ styles.mainControl }>
                        <div>
                            <div>
                                <Toggle stem={ true }
                                        label='basic-variation'
                                        orientation='horizontal'
                                        lights={ [0, 2] }
                                        activeLight={this.state.activePart}
                                        onUpdate={ this.onBasicVariation }
                                        steps={ ['A', 'AB', 'B'] }/>
                            </div>
                        </div>
                        <div style={ styles.blackLine }/>
                        <Button onClick={ this.togglePlay }>
                            <div style={ {  textAlign: 'center',  padding: '0 10px'} }>
                                <div style={ {  padding: '0 20px'} }>
                                    Start
                                </div>
                                <div style={ {  height: 1,  background: 'currentColor'} }/>
                                <div style={ {  padding: '0 20px'} }>
                                    Stop
                                </div>
                            </div>
                        </Button>
                        <div className='Arrow right basic-rhythm'>basic rhythm</div>
                    </div>
                    <Sequencer activeStep={ this.state.activeStep }
                               onStepChange={ this.onStepChange }
                               pattern={ this.state.pattern }
                               part={ this.state.editingPart }
                               activePart={ this.state.activePart }/>
                    <div className='tap-area'
                         style={ styles.tapArea }>
                        <div>
                            <Toggle stem={ true }
                                    label='I/F — variation'
                                    orientation='horizontal'
                                    steps={ ['A', 'B'] }
                                    onUpdate={this.toggleEditingPart}/>
                        </div>
                        <div style={ styles.blackLine }/>
                        <div
                            style={ {  margin: '4px 2px',  height: 20,  fontFamily: 'sans-serif',  fontSize: 8,  textTransform: 'uppercase',  textAlign: 'center',  lineHeight: 1} }>
                            intro set
                            <div
                                style={ {  height: 1,  background: 'currentColor',  width: '100%',  margin: '2px 0',} }/>
                            Fill in trigger
                        </div>
                        <Button onClick={ this.onTap }>
                            <div style={ {  textAlign: 'center',  padding: '0 10px'} }>
                                Tap
                            </div>
                        </Button>
                        <div className='Arrow left'>intro/fill in</div>
                    </div>
                </div>
            </div>);
    }
}