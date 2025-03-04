import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, Cloud, TreePine } from 'lucide-react';

interface ClimateData {
  globalTemp: string | null;
  co2Concentration: string | null;
  emissionReduction: string | null;
  treesPlanted: string | null;
  loading: boolean;
  error: boolean;
}

function Stats() {
  const [climateData, setClimateData] = useState<ClimateData>({
    globalTemp: null,
    co2Concentration: null,
    emissionReduction: null,
    treesPlanted: null,
    loading: true,
    error: false
  });

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const fetchClimateData = async () => {
      try {
        // Fetch global temperature data from NASA GISS API
        const tempResponse = await fetch('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv');
        const tempText = await tempResponse.text();
        // Parse the CSV to get the latest temperature anomaly (simplified)
        const tempRows = tempText.split('\n');
        const latestTempRow = tempRows[tempRows.length - 2]; // Get the last complete row
        const tempValue = parseFloat(latestTempRow.split(',')[13]).toFixed(2); // Annual mean

        // Fetch CO2 concentration from NOAA API
        const co2Response = await fetch('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv');
        const co2Text = await co2Response.text();
        // Parse the CSV to get the latest CO2 value
        const co2Rows = co2Text.split('\n').filter(row => !row.startsWith('#'));
        const latestCo2Row = co2Rows[co2Rows.length - 2]; // Get the last complete row
        const co2Value = parseFloat(latestCo2Row.split(',')[3]).toFixed(1); // Monthly mean

        // For emission reduction goal and trees planted, we'll use static data
        // as there's no single free API that provides this global information

        setClimateData({
          globalTemp: tempValue || '1.2',
          co2Concentration: co2Value || '417',
          emissionReduction: '49', // Static value based on common global targets
          treesPlanted: '7.3B', // Static value
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('Error fetching climate data:', error);
        // Fallback to static data if API calls fail
        setClimateData({
          globalTemp: '1.2',
          co2Concentration: '417',
          emissionReduction: '49',
          treesPlanted: '7.3B',
          loading: false,
          error: true
        });
      }
    };

    fetchClimateData();
  }, []);

  const stats = [
    {
      icon: Thermometer,
      value: climateData.globalTemp || '1.2',
      label: 'Global Temperature Rise (°C)',
      description: 'Increase in global temperatures since pre-industrial levels.',
      color: 'from-red-500 to-red-600',
      progress: 75,
    },
    {
      icon: Wind,
      value: climateData.co2Concentration || '417',
      label: 'CO2 Concentration (ppm)',
      description: 'Atmospheric carbon dioxide concentration in parts per million.',
      color: 'from-yellow-500 to-yellow-600',
      progress: 65,
    },
    {
      icon: Cloud,
      value: climateData.emissionReduction || '49',
      label: 'Emission Reduction Goal (%)',
      description: 'Global target to reduce greenhouse gas emissions by 2030.',
      color: 'from-blue-500 to-blue-600',
      progress: 49,
    },
    {
      icon: TreePine,
      value: climateData.treesPlanted || '7.3B',
      label: 'Trees Planted',
      description: 'Total trees planted worldwide in recent environmental campaigns.',
      color: 'from-emerald-500 to-emerald-600',
      progress: 90,
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-60 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
          Climate <span className="text-emerald-400">Statistics</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/50 hover:bg-slate-800/80 hover:translate-y-1 transition-all duration-300"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`h-16 w-16 rounded-md flex items-center justify-center mb-6 mx-auto transition-all duration-300 ${hoveredCard === index
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-900/50 text-emerald-400'
                  }`}
                aria-label={stat.label}
              >
                <stat.icon className="h-8 w-8" />
              </div>

              <div className="text-4xl font-bold text-white mb-2">
                {climateData.loading ? '...' : stat.value}
              </div>

              <div className="text-white font-medium mb-1">{stat.label}</div>

              <div className="text-gray-300 text-sm mb-4">{stat.description}</div>

              <div className="relative bg-slate-700 h-2 w-full rounded-full">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;