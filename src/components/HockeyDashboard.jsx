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
        // Using raw GitHub URL for your data
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

  // Function to determine bar color based on value
  const getBarColor = (value) => {
    // Normalize value between 0 and 1 based on our -3 to 3 scale
    const normalizedValue = (value + 3) / 6;
    // Generate color between red (low) and green (high)
    const red = Math.round(255 * (1 - normalizedValue));
    const green = Math.round(255 * normalizedValue);
    return `rgb(${red}, ${green}, 0)`;
  };

  const getPlayerData = (situation) => {
    return data.find(row => row.name === selectedPlayer && row.situation === situation) || {};
  };

  const getFiveOnFiveMetrics = (playerData) => {
    return [
      { name: 'G60', value: playerData.G60 },
      { name: 'A160', value: playerData.A160 },
      { name: 'xGImpact', value: playerData.xGImpact },
      { name: 'CFImpact', value: playerData.CFImpact },
      { name: 'xGF60', value: playerData.xGF60 },
      { name: 'CF60', value: playerData.CF60 },
      { name: 'xGA60', value: playerData.xGA60 },
      { name: 'CA60', value: playerData.CA60 }
    ].filter(metric => metric.value !== undefined);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <select 
          value={selectedPlayer} 
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="w-64 p-2 border rounded text-white bg-gray-800"
        >
          {players.map(player => (
            <option key={player} value={player} className="text-black bg-white">
              {player}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="col-span-1 md:col-span-3 p-4 border rounded bg-white">
          <div className="mb-4">
            <h2 className="text-xl font-bold">5 on 5 Performance</h2>
            {selectedPlayer && (
              <p className="text-sm text-gray-600">
                {getPlayerData('5on5').name} | {getPlayerData('5on5').team} | {getPlayerData('5on5').position} | Ice time: {(getPlayerData('5on5').icetime / 60).toFixed(1)} minutes
              </p>
            )}
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getFiveOnFiveMetrics(getPlayerData('5on5'))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  domain={[-3, 3]} 
                  tickFormatter={(value) => value.toFixed(1)}
                  allowDataOverflow={true}
                />
                <Tooltip 
                  formatter={(value) => value.toFixed(2)}
                />
                <Bar 
                  dataKey="value" 
                  shape={(props) => {
                    const { fill, x, y, width, height } = props;
                    return (
                      <rect 
                        x={x} 
                        y={y} 
                        width={width} 
                        height={height} 
                        fill={getBarColor(props.value)}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 border rounded bg-white">
          <h2 className="text-xl font-bold mb-4">4 on 5 Performance</h2>
          <p className="text-center text-gray-500">Coming soon</p>
        </div>

        <div className="p-4 border rounded bg-white">
          <h2 className="text-xl font-bold mb-4">5 on 4 Performance</h2>
          <p className="text-center text-gray-500">Coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default HockeyDashboard;