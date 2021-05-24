import React, {useEffect} from 'react';
import Accordion from '../components/Accordion';
import {equalsIgnoreCase, getGlobal, useForceUpdate} from '../Util';
import InfoIcon from '@material-ui/icons/Info';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import {Tooltip} from '@material-ui/core';
import './SettingsPage.css';
import {multiPrompt} from '../Util';

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

    const handleOpenOpggMultiOnLobbyFoundChange = e => {
        settings.openOpggMultiOnLobbyFound = e.target.checked;
        forceUpdate();
    }

    const handleCheckSelfChanged = e => {
        settings.checkSelf = e.target.checked;
        forceUpdate();
    }

    const handleAddToDodgeListClick = () => {
        promptDodgeListItem()
            .then(res => {
                if (res) {
                    if (settings.dodgeList.some(x => equalsIgnoreCase(x.name, res.name))) {
                        alert(`'${res.name}' is already on your dodge list.`);
                        return;
                    }
                    settings.dodgeList = [...settings.dodgeList, {name: res.name, reason: res.reason || ''}];
                    forceUpdate();
                }
            });
    }

    const promptDodgeListItem = () => {
        return multiPrompt({
            title: 'Add to dodge list',
            type: 'multi-input',
            width: 500,
            height: 300,
            resizable: true,
            inputArray: [
                {
                    key: 'name',
                    label: 'Name',
                    attributes: {
                        placeholder: 'Name...',
                        required: true,
                        type: 'text'
                    }
                },
                {
                    key: 'reason',
                    label: 'Reason (Optional)',
                    attributes: {
                        placeholder: 'Reason...',
                        required: false,
                        type: 'text'
                    }
                }
            ]
        }, {});
    }

    const handleRemoveDodgeListItem = item => {
        settings.dodgeList = settings.dodgeList.filter(x => !equalsIgnoreCase(x.name, item.name));
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

                <Accordion title={<TextWithInfo title='Dodge list' info='Show a warning whenever anyone on this list is in your lobby' />}>
                    <div className="dodge-list">
                        <div>
                            {settings.dodgeList.length < 1
                                ? <p>No items found on your dodge list...</p>
                                : settings.dodgeList.map(item => (
                                    <DodgeListItem item={item} onRemove={handleRemoveDodgeListItem} />
                                ))}
                        </div>

                        <button className="add-to-dodge-list-btn" onClick={handleAddToDodgeListClick}>Add</button>
                    </div>
                </Accordion>

                <Accordion title='Configuration'>
                    <SettingInput title='Open OP.GG multi upon entering champ select' type="checkbox" checked={settings.openOpggMultiOnLobbyFound} onChange={handleOpenOpggMultiOnLobbyFoundChange} />
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
            {info && <Info title={info} />}
        </div>
    );
};

const DodgeListItem = ({item, onRemove}) => {
    return (
        <div className="flex-center item">
            <div className="column">
                <p>{item.name}</p>
                {!!item.reason && <small>{item.reason}</small>}
            </div>

            <Tooltip title={`Remove '${item.name}'`}>
                <DeleteIcon onClick={() => onRemove(item)} />
            </Tooltip>
        </div>
    );
};

const TextWithInfo = ({title, info}) => {
    return (
        <div className="flex-center">
            <p>{title}</p>
            {info && <Info title={info} />}
        </div>
    );
}

const Info = ({title = ''}) => {
    return (
        <Tooltip title={title}>
            <InfoIcon style={{color: '#1976d2'}} />
        </Tooltip>
    );
};

export default SettingsPage;
