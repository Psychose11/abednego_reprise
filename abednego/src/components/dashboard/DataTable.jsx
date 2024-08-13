import React from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';





const Dashboard = () => {
  const cardContainerStyle = { display: 'flex', flexWrap: 'wrap' };
  const cardStyle = { margin: '16px', flex: '1', minWidth: '300px' };

  const chartData1 = {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#198ccd', '#a00540', '#fdca50'],
        hoverBackgroundColor: ['#0056b3', '#c79100', '#218838'],
      },
    ],
  };

  const chartData2 = {
    labels: ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'],
    datasets: [
      {
        label: 'Sales',
        backgroundColor: '#198ccd',
        borderColor: '#007BFF',
        borderWidth: 1,
        hoverBackgroundColor: '#0056b3',
        hoverBorderColor: '#0056b3',
        data: [65, 59, 80, 81, 56, 55, 40],
      },
    ],
  };

  return (
    <div style={cardContainerStyle}>
      
      



      <Card title="Graphique Circulaire" style={cardStyle}>
        <Chart type="doughnut" data={chartData1} />
      </Card>
      <Card title="Graphique en Barre" style={cardStyle}>
        <Chart type="bar" data={chartData2} />
      </Card>
    </div>
  );
};

export default Dashboard;
