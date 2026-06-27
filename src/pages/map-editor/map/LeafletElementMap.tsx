import { useActiveElement } from 'context/useActiveElement';
import { isPseudoContainer, shapeToPolygon, type MapperElement } from 'models/MapDocument';
import useMapperDoc from 'state/mapper/doc/useDoc';
import ActiveFeature from '../features/ActiveFeature';
import MapPolygon from '../features/MapPolygon';
import PointLayer from './PointLayer';
import ShapeLayer from './ShapeLayer';

export interface LeafletElementMapProps {
  
}

function LeafletElementMap (props: LeafletElementMapProps) {  
  const doc = useMapperDoc();
  const active = useActiveElement();

  const selected = active.getElement();

  let siblings: MapperElement[] | null = null;

  if (selected && isPseudoContainer(selected)) {
    // If this element has holes, then it's a shape with holes.
    if (selected.holes.length > 0) {
      siblings = selected.holes;
    }
    // If it doesn't, then it may be a hole itself.
    else {
      const parent = doc.getParent(selected.id);
      if (parent && isPseudoContainer(parent)) {
        // The siblings are all the holes in its parent, except itself.
        siblings = parent.holes.filter(h => h.id !== selected.id);
      }
    }
  }

  return (
    <>
      <ShapeLayer group={doc.content} />
      <PointLayer group={doc.content} />
      {siblings && siblings.map(s => <MapPolygon
        key={s.id + "_" + active.id}
        polygon={shapeToPolygon(s as any)}
        isSibling
      />)}

      <ActiveFeature />
    </>
  );
}

export default LeafletElementMap;
