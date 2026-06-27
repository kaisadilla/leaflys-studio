import { useActiveElement } from "context/useActiveElement";
import useMapperDoc from "state/mapper/doc/useDoc";
import Point from "./Point";
import Polygon from "./Polygon";
import Rectangle from "./Rectangle";
import styles from './Ribbon.module.scss';
import Ribbon_Toggle from "./Ribbon.Toggle";

export interface RibbonProps {
  
}

function Ribbon (props: RibbonProps) {
  const doc = useMapperDoc();
  const active = useActiveElement();

  const el = active.getElement();
  if (!el || el.isHidden) return <div className={styles.ribbon} />;

  return (
    <div className={styles.ribbon}>
      {el.type === 'Point' && <Point />}
      {el.type === 'Polygon' && <Polygon />}
      {el.type === 'Rectangle' && <Rectangle />}
    </div>
  );
}

Ribbon.Toggle = Ribbon_Toggle;

export default Ribbon;
