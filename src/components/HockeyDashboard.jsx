import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const HockeyDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [players, setPlayers] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/barraidan18/hockey_data/main/data/hockey_stats_2023.csv');
        const csvText = await response.text();
        const result = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        setData(result.data);
        const uniquePlayers = [...new Set(result.data.map(row => row.name))];
        setPlayers(uniquePlayers.sort());
        if (uniquePlayers.length > 0) {
          setSelectedPlayer(uniquePlayers[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    fetchData();
  }, []);

  const getBarColor = (value) => {
    if (value === undefined || value === null) return 'rgb(128, 128, 128)';
    return value >= 0 ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)';
  };

  const getPlayerData = (situation) => {
    return data.find(row => row.name === selectedPlayer && row.situation === situation) || {};
  };

  const getFiveOnFiveMetrics = (playerData) => {
    return [
      { name: 'G60', description: 'Goals/60', value: playerData.G60 },
      { name: 'A160', description: 'Primary Assists/60', value: playerData.A160 },
      { name: 'xGImpact', description: 'Expected Goals Impact', value: playerData.xGImpact },
      { name: 'CFImpact', description: 'Shot Attempts Impact', value: playerData.CFImpact },
      { name: 'xGF60', description: 'Expected Goals For/60', value: playerData.xGF60 },
      { name: 'CF60', description: 'Shot Attempts For/60', value: playerData.CF60 },
      { name: 'xGA60', description: 'Expected Goals Against/60', value: playerData.xGA60 },
      { name: 'CA60', description: 'Shot Attempts Against/60', value: playerData.CA60 }
    ].filter(metric => metric.value !== undefined);
  };

  const getFourOnFiveMetrics = (playerData) => {
    return [
      { name: 'xGA60', description: 'Expected Goals Against/60', value: playerData.xGA60 },
      { name: 'CA60', description: 'Shot Attempts Against/60', value: playerData.CA60 }
    ].filter(metric => metric.value !== undefined);
  };

  const getFiveOnFourMetrics = (playerData) => {
    return [
      { name: 'xGF60', description: 'Expected Goals For/60', value: playerData.xGF60 },
      { name: 'CF60', description: 'Shot Attempts For/60', value: playerData.CF60 }
    ].filter(metric => metric.value !== undefined);
  };

  const ChartComponent = ({ data, title, situation }) => {
    const playerData = getPlayerData(situation);
    return (
      <div className="p-2 sm:p-4 border rounded bg-white">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
          {selectedPlayer && (
            <p className="text-xs sm:text-sm text-gray-600 break-words">
              {playerData.name} | {playerData.team} | {playerData.position} | Ice time: {(playerData.icetime / 60).toFixed(1)} minutes
            </p>
          )}
        </div>
        <div className="h-[300px] sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="description" 
                angle={-45} 
                textAnchor="end" 
                height={100} 
                interval={0}
                tick={{fontSize: 12}}
              />
              <YAxis 
                domain={[-3, 3]} 
                tickFormatter={(value) => value.toFixed(1)}
                allowDataOverflow={true}
              />
              <Tooltip 
                formatter={(value) => value.toFixed(2)}
                labelFormatter={(label) => label}
              />
              <Bar 
                dataKey="value"
                fill="#8884d8"
                isAnimationActive={false}
              >
                {
                  data.map((entry, index) => (
                    <rect
                      key={`bar-${index}`}
                      x={0}
                      y={0}
                      width={0}
                      height={0}
                      fill={getBarColor(entry.value)}
                    />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-4">
        <select 
          value={selectedPlayer} 
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="w-full sm:w-64 p-2 border rounded text-white bg-gray-800"
        >
          {players.map(player => (
            <option key={player} value={player} className="text-black bg-white">
              {player}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:gap-4 grid-cols-1">
        <ChartComponent 
          data={getFiveOnFiveMetrics(getPlayerData('5on5'))} 
          title="5 on 5 Performance"
          situation="5on5"
        />
        <ChartComponent 
          data={getFourOnFiveMetrics(getPlayerData('4on5'))} 
          title="Penalty Kill (4 on 5)"
          situation="4on5"
        />
        <ChartComponent 
          data={getFiveOnFourMetrics(getPlayerData('5on4'))} 
          title="Power Play (5 on 4)"
          situation="5on4"
        />
      </div>
    </div>
  );
};

export default HockeyDashboard;