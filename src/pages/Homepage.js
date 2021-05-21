import React, {useState} from 'react';
import {get} from '../Api';
import {getGlobal, useEffectOnce} from '../Util';
import './Homepage.css';
import OPGGClient from '../../op.gg-api/client';

const electron = window.require('electron').remote;
const dialog = electron.dialog;
const shell = electron.shell;

const Homepage = () => {
    const [inChampSelect, setInChampSelect] = useState(false);
    const [champSelectData, setChampSelectData] = useState(null);

    useEffectOnce(() => {
        setInterval(updateQueueStatus, 5000);
    });

    const updateQueueStatus = async () => {
        setInChampSelect(await checkForActiveChampSelect());
    }

    const checkForActiveChampSelect = async () => {
        const response = await get('/lol-champ-select/v1/session');

        console.log(response);

        const inChampSelect = ('gameId' in response);

        if (inChampSelect) {
            setChampSelectData(response);
        }

        return inChampSelect;
    }

    return (
        <div>
            <a href="/settings" className="nav-link">Settings</a>
            <div>
                {inChampSelect ?
                    <ChampSelectView data={champSelectData} />
                    : <p>Waiting for champ select...</p>
                }
            </div>
        </div>
    );
};

const ChampSelectView = ({data}) => {
    const [summonerNames, setSummonerNames] = useState([]);
    const opggClient = new OPGGClient({opggApiServerPort: getGlobal('settings').opggApiServerPort});

    useEffectOnce(() => {
        const getSummonerNames = async () => {
            const summonerNames = await Promise.all(
                data.myTeam.map(async playerData => {
                    const response = await get(`/lol-summoner/v1/summoners/${playerData.summonerId}`);

                    return response.displayName;
                })
            );

            summonerNames.forEach(name => {
                const settings = getGlobal('settings');

                const showDodgeWarning = (text) => {
                    return dialog.showMessageBox({
                        title: 'You should consider dodging',
                        type: 'warning',
                        message: text,
                        buttons: [
                            `View ${name}'s OP.GG`,
                            'Dismiss'
                        ],
                        cancelId: 1,
                        noLink: true
                    })
                        .then(({response: clickedBtnIndex}) => {
                            if (clickedBtnIndex === 0) {
                                // TODO: Un-hardcode server 'na'
                                shell.openExternal(`https://na.op.gg/summoner/userName=${name}`);
                            }
                        });
                };

                // TODO: Un-hardcode server 'na'
                opggClient.SummonerStats('na', name)
                    .then(stats => {
                        console.log(`OP.GG data for summoner '${name}':`);
                        console.log(stats);

                        // TODO: Handle `stats` having null values, due to someone being unranked, or not having any recent games 
                        if (stats.winRatio <= settings.dodgeBoundaries.maxWinratio) {
                            showDodgeWarning(`${name} has a winrate of ${stats.winRatio}%.`);
                        } else if (stats.streakType === "LOSS_STREAK" && stats.streak >= settings.dodgeBoundaries.minStreak) {
                            showDodgeWarning(`${name} is on a ${stats.streak} game loss-streak.`);
                        } else if (stats.gameCount >= settings.dodgeBoundaries.minGameCount) {
                            showDodgeWarning(`${name} has over 1000 games played this season.`);
                        }
                    });
            });

            setSummonerNames(summonerNames);
        }

        getSummonerNames();

        return () => {
            opggClient.close();
        };
    });

    return (
        <div>
            <p>Champ select found!</p>
            <div className="flex">
                {summonerNames.map(name => (
                    <div key={name} className="summoner">
                        <p>{name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Homepage;