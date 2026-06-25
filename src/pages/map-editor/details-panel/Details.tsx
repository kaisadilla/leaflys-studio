import { useActiveElement } from 'context/useActiveElement';
import useMapperDoc from 'state/mapper/useDoc';
import ElementDetails from './ElementDetails';

export interface DetailsProps {
  
}

function Details (props: DetailsProps) {
  const doc = useMapperDoc();
  const active = useActiveElement();

  const element = active.getElement();

  if (!element) return null;

  return <ElementDetails element={element} />;
}

export default Details;
