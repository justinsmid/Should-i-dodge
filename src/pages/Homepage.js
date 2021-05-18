import React, {useState} from 'react';
import {get} from '../Api';
import {useEffectOnce} from '../Util';
import './Homepage.css';

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
            <p>Homepage!</p>
            <div>
                {
                    inChampSelect ?
                        <ChampSelectView data={champSelectData} />
                        : <p>Waiting for champ select...</p>
                }
            </div>
        </div>
    );
};

const ChampSelectView = ({data}) => {
    const [summonerNames, setSummonerNames] = useState([]);

    useEffectOnce(() => {
        const getSummonerNames = async () => {
            const summonerNames = await Promise.all(
                data.myTeam.map(async playerData => {
                    const response = await get(`/lol-summoner/v1/summoners/${playerData.summonerId}`);

                    return response.displayName;
                })
            );

            setSummonerNames(summonerNames);
        }

        getSummonerNames();
    });

    return (
        <div>
            <p>Champ select found!</p>
            <div className="flex">
                {summonerNames.map(name => (
                    <div className="summoner">
                        <p>{name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Homepage;