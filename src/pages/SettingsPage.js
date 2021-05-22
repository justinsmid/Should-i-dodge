import React from 'react';
import Accordion from '../components/Accordion';
import {getGlobal, useForceUpdate} from '../Util';
import InfoIcon from '@material-ui/icons/Info';
import {Tooltip} from '@material-ui/core';

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

    const handleCheckSelfChanged = e => {
        settings.checkSelf = e.target.checked;
        forceUpdate();
    }

    const handleSaveClick = () => {
        const storage = getGlobal('storage');

        storage.set('settings', getGlobal('settings'), (err) => {
            if (err) {
                console.error('Error while storing settings in storage');
            } else {
                window.alert('Settings saved successfully!\nIf any server ports were changed, a restart of the application will be necessary for these changes to take effect.');
            }
            window.close();
        });
    };

    return (
        <div>
            <h1>Settings</h1>

            <div className="column">
                <Accordion title='Dodge boundaries' defaultExpanded>
                    <SettingInput title='Max winratio' info='Warn me when someone has a lower winrate than this' type="number" value={settings.dodgeBoundaries.maxWinratio} onChange={handleMaxWinratioChange} />
                    <SettingInput title='Min loss-streak' type="number" value={settings.dodgeBoundaries.minStreak} onChange={handleMinStreakChange} />
                    <SettingInput title='Min game count' info='Warn me when someone has more than this many games played this season' type="number" value={settings.dodgeBoundaries.minGameCount} onChange={handleMinGameCountChange} />
                </Accordion>

                <Accordion title='Configuration'>
                    <SettingInput title='Check self' info='Whether this application should check your op.gg aswell' type="checkbox" checked={settings.checkSelf} onChange={handleCheckSelfChanged} />
                </Accordion>

                <Accordion title='Server ports'>
                    <SettingInput title='Express server port' type="number" value={settings.expressServerPort} onChange={handleExpressServerPortChange} />
                    <SettingInput title='Op.gg api server port' type="number" value={settings.opggApiServerPort} onChange={handleOpggApiServerPortChange} />
                </Accordion>
            </div>

            <button onClick={handleSaveClick}>Save</button>
        </div >
    );
};

const SettingInput = ({title, info, ...props}) => {
    return (
        <div className="flex-center">
            <label>
                {title}:
                <input {...props} />
            </label>
            {info && (
                <Tooltip title={info}>
                    <InfoIcon style={{color: '#1976d2'}} />
                </Tooltip>
            )}
        </div>
    );
};

export default SettingsPage;
