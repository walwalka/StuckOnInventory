import { useEffect, useState } from "react";
import "../coinsTable.css";
import api from '../../api/client';

// Backend base URL from Vite env
// Uses shared API client baseURL

const Header = ({ columns }) => (
  <thead>
    <tr>
      {columns.map((column) => (
        <th key={column} className='coins-table-cell'>{column}</th>
      ))}
    </tr>
  </thead>
);

const Content = ({ entries }) => (
  <tbody>
    {entries.map((entry) => (
      <tr key={entry.id}>
        <td className="coins-table-cell">{entry.type}</td>
        <td className="coins-table-cell">{entry.mintlocation}</td>
        <td className="coins-table-cell">{entry.mintyear?.slice(0, 4)}</td>
        <td className="coins-table-cell">{entry.circulation}</td>
        <td className="coins-table-cell">{entry.grade}</td>
      </tr>
    ))}
  </tbody>
);

// Fetch coins using backend URL
// Optional: add sorting params later if backend supports them
// Currently fetches full list
useEffect(() => {
  api
    .get('/coins/')
    .then((res) => {
      // Expecting data shape { data: [...] }
      setCoins(res.data.data || []);
    })
    .catch(() => setCoins([]));
}, []);

const CoinsTableFiltered = () => {
  const [coins, setCoins] = useState([]);
  const columns = ["Coin Type", "Mint Location", "Mint Year", "Circulation", "Grade"];

return (
  <div>
    <table className="coins-table">
      <Header columns={columns}/>
      <Content entries={coins} />
    </table>
  </div>
);
};

export default CoinsTableFiltered;