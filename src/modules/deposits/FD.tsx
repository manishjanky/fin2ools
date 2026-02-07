import FDForm from './components/FDForm';
import Deposit from './Deposit';

export default function FD() {
  return (
    <Deposit type='FD'>
      <FDForm></FDForm>
    </Deposit>
  );
}
