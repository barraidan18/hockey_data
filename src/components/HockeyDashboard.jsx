import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const HockeyDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [players, setPlayers] = useState([]);
  const AVAILABLE_SEASONS = [2024,2023,2022,2021];  // We'll expand this as more seasons are added
  const [selectedSeason, setSelectedSeason] = useState(AVAILABLE_SEASONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredPlayers = players.filter(player =>
    player.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://raw.githubusercontent.com/barraidan18/hockey_data/main/data/hockey_stats_${selectedSeason}.csv`);
        const csvText = await response.text();
        console.log('Response status:', response.status);
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
  }, [selectedSeason]);

  // Function to determine bar color based on value
  const getBarColor = (value) => {
    if (value === undefined || value === null) return 'rgb(128, 128, 128)';
    
    // For positive values: more green (red goes down)
    // For negative values: more red (green goes down)
    const intensity = Math.min(Math.abs(value) / 3, 1); // Scale by the maximum expected value (3)
    const baseColor = value >= 0 ? 
      `rgb(${Math.round(255 * (1 - intensity))}, 255, 0)` : // Positive: reduce red
      `rgb(255, ${Math.round(255 * (1 - intensity))}, 0)`; // Negative: reduce green
    
    return baseColor;
  };

  const getPlayerData = (situation) => {
    return data.find(row => row.name === selectedPlayer && row.situation === situation) || {};
  };

  const getMetricDescription = (metricName) => {
    const descriptions = {
      'G60': 'Goals/60',
      'A160': 'Primary Assists/60',
      'xGImpact': 'Expected Goals Impact',
      'CFImpact': 'Shot Attempts Impact',
      'xGF60': 'Expected Goals For/60',
      'CF60': 'Shot Attempts For/60',
      'xGA60': 'Expected Goals Against/60',
      'CA60': 'Shot Attempts Against/60'
    };
    return descriptions[metricName] || metricName;
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

  return (
    <div className="p-2 sm:p-4 w-full max-w-[2000px] mx-auto">
      <div className="flex gap-4 mb-4">
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="w-32 p-2 border rounded text-white bg-gray-800"
        >
          {AVAILABLE_SEASONS.map(season => (
            <option key={season} value={season} className="text-black bg-white">
              {season}
            </option>
          ))}
        </select>
        <div className="relative w-full sm:w-64">
          <input
            list="players"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSelect={(e) => {
              setSelectedPlayer(e.target.value);
              setSearchQuery(e.target.value);
            }}
            className="w-full p-2 border rounded text-white bg-gray-800"
            placeholder="Search for a player..."
          />
          <datalist id="players">
            {filteredPlayers.map(player => (
              <option key={player} value={player} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 max-w-full w-full">
        <div className="p-4 sm:p-6 border rounded bg-white">
          <div className="mb-5">
            <h2 className="text-lg sm:text-xl font-bold">5 on 5 Performance</h2>
            {selectedPlayer && (
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {getPlayerData('5on5').name} | {getPlayerData('5on5').team} | {getPlayerData('5on5').position} | Ice time: {(getPlayerData('5on5').icetime / 60).toFixed(1)} minutes
              </p>
            )}
          </div>
          <div className="h-[400px] sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={getFiveOnFiveMetrics(getPlayerData('5on5'))}
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="description" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}  
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
                  shape={(props) => {
                    const { x, y, width, height, value } = props;
                    if (value === undefined || value === null) return null;

                    // For negative values, we need to adjust the y position and height
                    const adjustedY = value >= 0 ? y : y + height;
                    const adjustedHeight = Math.abs(height);

                    return (
                      <rect 
                        x={x} 
                        y={adjustedY}
                        width={width} 
                        height={adjustedHeight} 
                        fill={getBarColor(value)}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 sm:p-6 border rounded bg-white">
          <div className="mb-5">
            <h2 className="text-lg sm:text-xl font-bold">Penalty Kill (4 on 5)</h2>
            {selectedPlayer && (
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {getPlayerData('4on5').name} | {getPlayerData('4on5').team} | {getPlayerData('4on5').position} | Ice time: {(getPlayerData('4on5').icetime / 60).toFixed(1)} minutes
              </p>
            )}
          </div>
          <div className="h-[400px] sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={getFourOnFiveMetrics(getPlayerData('4on5'))}
                margin={{ top: 20, right: 40, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="description" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120} 
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
                  shape={(props) => {
                    const { x, y, width, height, value } = props;
                    if (value === undefined || value === null) return null;

                    const adjustedY = value >= 0 ? y : y + height;
                    const adjustedHeight = Math.abs(height);

                    return (
                      <rect 
                        x={x} 
                        y={adjustedY}
                        width={width} 
                        height={adjustedHeight} 
                        fill={getBarColor(value)}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 sm:p-6 border rounded bg-white">
          <div className="mb-5">
            <h2 className="text-lg sm:text-xl font-bold">Power Play (5 on 4)</h2>
            {selectedPlayer && (
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {getPlayerData('5on4').name} | {getPlayerData('5on4').team} | {getPlayerData('5on4').position} | Ice time: {(getPlayerData('5on4').icetime / 60).toFixed(1)} minutes
              </p>
            )}
          </div>
          <div className="h-[400px] sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={getFiveOnFourMetrics(getPlayerData('5on4'))}
                margin={{ top: 20, right: 40, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="description" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120} 
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
                  shape={(props) => {
                    const { x, y, width, height, value } = props;
                    if (value === undefined || value === null) return null;

                    const adjustedY = value >= 0 ? y : y + height;
                    const adjustedHeight = Math.abs(height);

                    return (
                      <rect 
                        x={x} 
                        y={adjustedY}
                        width={width} 
                        height={adjustedHeight} 
                        fill={getBarColor(value)}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HockeyDashboard;