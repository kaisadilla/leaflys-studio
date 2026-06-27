import DormantTextbox from 'components/DormantTextbox';
import { useActiveElement } from "context/useActiveElement";
import { Boxes, Circle, Eye, EyeOff, Folder, MapPin, Pentagon, Square, Waypoints } from 'lucide-react';
import { isPseudoContainer, isShape, type MapperElement } from "models/MapDocument";
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getElement, MapperDocActions } from 'state/mapper/doc/slice';
import useMapperDoc from "state/mapper/doc/useDoc";
import { $cl } from 'utils';
import MaterialSymbol from '../../../components/MaterialSymbol';
import styles from './Element.module.scss';
import useElementDrag from "./useElementDrag";
import { useElementDragCtx } from "./useElementDragContext";

type DropTarget = 'before' | 'inside' | 'after'

const HIERARCHY_INDENT_WIDTH = 16

export interface ElementProps {
  element: MapperElement;
  parent?: MapperElement | null;
  depth: number;
  validDropTarget?: boolean;
}

function Element ({
  element,
  parent = null,
  depth,
}: ElementProps) {
  const [expanded, setExpanded] = useState(
    element.type === 'Group' || element.type === 'Collection'
  );
  const [isNameActive, setNameActive] = useState(false);

  const doc = useMapperDoc();
  const active = useActiveElement();
  const ctx = useElementDragCtx();
  const dispatch = useDispatch();

  const { ref, dropTarget } = useElementDrag(
    element, parent, expanded, isNameActive
  );

  useEffect(() => {
    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    }
  }, [handleDocumentKeyDown]);

  // When an element is selected, if that element is somewhere in this group's
  // branch, expand it automatically.
  useEffect(() => {
    if (active.id === null) return;
    if (active.id === element.id) return;

    const child = getElement(element, active.id, true);
    if (child) setExpanded(true);
  }, [active.id]);

  const isPseudo = !!parent && isPseudoContainer(parent);
  
  let children = null as MapperElement[] | null;
  let type = element.type;

  if (element.type === 'Group') {
    children = element.elements;
  }
  else if (element.type === 'Collection') {
    children = element.elements;
  }
  else if (
    element.type === 'Polygon'
    || element.type === 'Rectangle'
    || element.type === 'Circle'
  ) {
    if (!parent || parent.type === 'Group' || parent.type === 'Collection') {
      if (element.holes.length > 0) {
        children = [
          ...element.holes.map((h, i) => ({
            type: 'Polygon',
            id: h.id,
            name: `< Hole #${i} >`,
            properties: [],
            isHidden: false,
            vertices: [],
            holes: [],
          } satisfies MapperElement)),
        ]
      }
    }
  }

  const hierarchyIndent = HIERARCHY_INDENT_WIDTH * depth;
  const isHidden = doc.isElementHidden(element.id) ?? false;

  let invalidTarget = false;

  if (ctx.element) {
    // If this is part of the dragged target's tree, then it's not a drop target.
    if (ctx.isNestedElement(element.id)) {
      invalidTarget = true;
    }
    // If the element being dragged is not a shape, and this element is a pseudo
    // element (i.e. one that is part of a shape), then it's not a drop target.
    else if (isShape(ctx.element) === false && isPseudo) {
      invalidTarget = true;
    }
  }

  return (<>
    {depth >= 0 && <div
      ref={ref}
      className={$cl(
        styles.element,
        type === 'Group' && styles.folder
      )}
      role='button'
      onClick={handleClick}
      data-selected={active.id === element.id}
      data-dragged={ctx.element?.id === element.id}
      data-drop-target={dropTarget}
      data-invalid-drop-target={invalidTarget}
      data-hidden={isHidden}
      data-pseudo={isPseudo}
    >
      {invalidTarget === false
        && (dropTarget === 'before' || dropTarget === 'after')
        && <div
          className={styles.dropTarget}
          style={{
            width: `calc(100% - ${hierarchyIndent})`,
            left: hierarchyIndent,
            top: dropTarget === 'before' ? -2 : undefined,
            bottom: dropTarget === 'after' ? -2 : undefined,
          }}
        />
      }

      <div
        className={styles.hierarchy}
        style={{width: hierarchyIndent}}
      >
        <div className={styles.bar} />
      </div>

      <div className={styles.collapseContainer}>
        {children !== null && <button
          className={styles.collapseButton}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded && <MaterialSymbol icon="arrow_drop_down" />}
          {expanded === false && <MaterialSymbol icon="arrow_right" />}
        </button>}
      </div>

      <div className={styles.type}>
        {type === 'Group' && <Folder />}
        {type === 'Point' && <MapPin />}
        {type === 'LineString' && <Waypoints />}
        {type === 'Polygon' && <Pentagon />}
        {type === 'Rectangle' && <Square />}
        {type === 'Circle' && <Circle />}
        {type === 'Collection' && <Boxes />}
      </div>

      <div className={styles.name}>
        <DormantTextbox
          value={element.name}
          placeholder={`(${element.type})`}
          isActive={isNameActive}
          onChange={handleChangeName}
          onActivate={handleActivateName}
          onSubmit={() => setNameActive(false)}
          onCancel={() => setNameActive(false)}
        />
      </div>

      {isPseudo === false && isNameActive === false && <div
        className={$cl(styles.ribbon, "hoverOnly")}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={handleToggleVisibility}>
          {element.isHidden === false && <Eye />}
          {element.isHidden && <EyeOff />}
        </button>
      </div>}
    </div>}

    {children !== null && <div
      className={styles.folderContent}
      data-visible={expanded}
      data-drop-target={dropTarget}
    >
      {children.map((c, i) => <Element
        key={c.id}
        element={c}
        parent={element}
        depth={depth + 1}
        validDropTarget={invalidTarget}
      />)}
    </div>}
  </>)

  function handleClick (evt: React.MouseEvent) {
    evt.stopPropagation();

    if (active.id === element.id) return;

    active.setElement(element.id);
  }

  function handleToggleVisibility () {
    dispatch(MapperDocActions.setHidden({
      elementId: element.id,
      value: !element.isHidden,
    }));
  }

  function handleActivateName (active: boolean) {
    if (isPseudo) return;

    setNameActive(active);
  }

  function handleChangeName (name: string) {
    dispatch(MapperDocActions.setElementName({
      elementId: element.id,
      name,
    }));
  }

  function handleDocumentKeyDown (evt: KeyboardEvent) {
    if (isNameActive) return;
    if (active.id !== element.id) return;
    if (isPseudo) return;

    if (evt.key === 'F2') {
      setNameActive(true);
    }
    else if (evt.ctrlKey && evt.key === 'Enter') {
      setNameActive(true);
    }
  }
}

export default Element;
