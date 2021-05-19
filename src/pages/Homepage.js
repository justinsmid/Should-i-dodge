import React, {useState} from 'react';
import {get} from '../Api';
import {useEffectOnce} from '../Util';
import './Homepage.css';
import OPGGClient from '../../op.gg-api/client';

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
            {inChampSelect ?
                <ChampSelectView data={champSelectData} />
                : <p>Waiting for champ select...</p>
            }
        </div>
    );
};

const ChampSelectView = ({data}) => {
    const [summonerNames, setSummonerNames] = useState([]);
    const opggClient = new OPGGClient();

    useEffectOnce(() => {
        const getSummonerNames = async () => {
            const summonerNames = await Promise.all(
                data.myTeam.map(async playerData => {
                    const response = await get(`/lol-summoner/v1/summoners/${playerData.summonerId}`);

                    return response.displayName;
                })
            );

            summonerNames.forEach(async name => {
                console.log(`OP.GG data for summoner '${name}':`);

                // TODO: Un-hardcode server 'na'
                const response = await opggClient.SummonerStats('na', name);

                console.log(response);
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