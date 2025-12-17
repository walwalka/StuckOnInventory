import Register from "./Register";
import { Link } from 'react-router-dom';

const RegisterButton = ({ destination = '/register' }) => {
  return (
    <div className='flex'>
        <Link to={destination} className='usd-btn-copper px-4 py-2 rounded hover:opacity-90'>
          Register
        </Link>
    </div>
  )
}

export default RegisterButton
