import React from 'react';
import Accordion from '../components/Accordion';
import {getGlobal, useForceUpdate} from '../Util';

const SettingsPage = () => {
    const forceUpdate = useForceUpdate();
    const settings = getGlobal('settings');

    const handleExpressServerPortChange = e => {
        settings.expressServerPort = parseInt(e.target.value, 10);
        forceUpdate();
    };

    const handleOpggApiServerPortChange = e => {
        settings.opggApiServerPort = parseInt(e.target.value, 10);
        forceUpdate();
    };

    const handleMaxWinratioChange = e => {
        settings.dodgeBoundaries.maxWinratio = parseInt(e.target.value, 10);
        forceUpdate();
    };

    const handleMinStreakChange = e => {
        settings.dodgeBoundaries.minStreak = parseInt(e.target.value, 10);
        forceUpdate();
    };

    const handleMinGameCountChange = e => {
        settings.dodgeBoundaries.minGameCount = parseInt(e.target.value, 10);
        forceUpdate();
    };

    const handleSaveClick = () => {
        console.log('Saving settings...');

        // TODO: Store settings in file
        // window.alert('Settings saved successfully!');

        window.close();
    };

    return (
        <div>
            <h1>Settings page</h1>

            <div className="column">
                <Accordion title='Dodge boundaries' defaultExpanded>
                    <label>
                        Max winratio:
                            <input type="number" value={settings.dodgeBoundaries.maxWinratio} onChange={handleMaxWinratioChange} />
                    </label>
                    <label>
                        Min loss-streak:
                            <input type="number" value={settings.dodgeBoundaries.minStreak} onChange={handleMinStreakChange} />
                    </label>
                    <label>
                        Min game count:
                            <input type="number" value={settings.dodgeBoundaries.minGameCount} onChange={handleMinGameCountChange} />
                    </label>
                </Accordion>

                <Accordion title='Server ports'>
                    <label>
                        Express server port:
                            <input type="number" value={settings.expressServerPort} onChange={handleExpressServerPortChange} />
                    </label>
                    <label>
                        Op.gg api server port:
                            <input type="number" value={settings.opggApiServerPort} onChange={handleOpggApiServerPortChange} />
                    </label>
                </Accordion>
            </div>

            <button onClick={handleSaveClick}>Save</button>
        </div >
    );
};

export default SettingsPage;
