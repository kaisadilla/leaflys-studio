import { Table, TextInput, Tooltip } from '@mantine/core';
import { LockSimpleIcon, XCircleIcon } from '@phosphor-icons/react';
import useUuid from 'hook/useUuid';
import { YEREVAN_PROP_PREFIX, type MapperElement, type MapperProperty } from 'models/MapDocument';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { MapperDocActions } from 'state/mapper/doc/slice';
import { type AppDispatch } from 'state/store';
import styles from './Properties.module.scss';

export interface PropertiesProps {
  element: MapperElement;
}

function Properties ({
  element,
}: PropertiesProps) {
  const dispatch = useDispatch<AppDispatch>();
  const uuid = useUuid();

  const { t } = useTranslation();

  return (
    <Table
      classNames={{
        table: styles.table,
        thead: styles.thead,
        tbody: styles.tbody,
        tr: styles.tr,
        td: styles.td,
      }}
      striped
      withTableBorder
      withColumnBorders
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            {t("properties.field.key.name")}
          </Table.Th>
          <Table.Th>
            {t("properties.field.value.name")}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        <_PropRow
          name="id"
          value={element.id}
        />

        <_PropRow
          name="name"
          value={element.name}
          onChangeValue={handleChangeName}
        />

        {element.properties.map(prop => {
          return <_PropRow
            key={prop.id}
            name={prop.name}
            value={prop.value}
            onChangeName={n => handleChangePropName(prop.id, n)}
            onChangeValue={v => handleChangePropValue(prop.id, v)}
            nameError={getNameError(prop)}
          />
        })}

        <_PropRow
          key={uuid.peek()}
          name=""
          value=""
          onChangeName={handleNewPropName}
          onChangeValue={handleNewPropValue}
        />
      </Table.Tbody>
    </Table>
  );

  function handleChangeName (name: string) {
    dispatch(MapperDocActions.setElementName({
      elementId: element.id,
      name,
    }));
  }

  function handleChangePropName (id: string, name: string) {
    dispatch(MapperDocActions.setPropertyName({
      elementId: element.id,
      propertyId: id,
      name,
    }));
  }

  function handleChangePropValue (id: string, value: string) {
    dispatch(MapperDocActions.setPropertyValue({
      elementId: element.id,
      propertyId: id,
      value,
    }));
  }

  function handleNewPropName (name: string) {
    dispatch(MapperDocActions.addProperty({
      elementId: element.id,
      propertyId: uuid.next(),
      name,
      value: "",
    }));
  }

  function handleNewPropValue (value: string) {
    dispatch(MapperDocActions.addProperty({
      elementId: element.id,
      propertyId: uuid.next(),
      name: "",
      value,
    }));
  }

  function getNameError (prop: MapperProperty) : string | undefined {
    let errors: string[] = [];

    if (prop.name === "") {
      errors.push("Property must have a name.")
    }
    else if (
      prop.name === "id"
      || prop.name === "name"
      || element.properties.filter(p => p.name === prop.name).length > 1
    ) {
      errors.push("Duplicate name.");
    }

    if (prop.name.startsWith(YEREVAN_PROP_PREFIX)) {
      errors.push(
        "'_yerevan_' is a prefix reserved for this app. Using it for " +
        " user-defined properties will result in undefined behavior."
      );
    }

    return errors.length === 0 ? undefined : errors.join("\n");
  }
}



interface _PropRowProps {
  name: string;
  value: string;
  onChangeName?: (name: string) => void;
  onChangeValue?: (value: string) => void;
  nameError?: string;
}

function _PropRow ({
  name,
  value,
  onChangeName,
  onChangeValue,
  nameError,
}: _PropRowProps) {
  return (
    <Table.Tr>
      <Table.Td>
        <div>
          {onChangeName === undefined && <LockSimpleIcon
            className={styles.lockIcon}
            size={16}
            weight='thin'
          />}
          <TextInput
            classNames={{
              root: styles.inputRoot,
              input: styles.input,
            }}
            placeholder='(Name)'
            value={name}
            size='xs'
            readOnly={onChangeName === undefined}
            data-name={true}
            data-has-error={nameError !== undefined}
            onChange={evt => onChangeName?.(evt.target.value)}
          />
          {nameError && <Tooltip
            label={nameError}
          >
            <XCircleIcon
              className={styles.errorIcon}
              size={24}
            />  
          </Tooltip>}
        </div>
      </Table.Td>
      <Table.Td>
        <div>
          {onChangeValue === undefined && <LockSimpleIcon
            className={styles.lockIcon}
            size={16}
            weight='thin'
          />}
          <TextInput
            classNames={{
              root: styles.inputRoot,
              input: styles.input,
            }}
            placeholder='(Value)'
            value={value}
            size='xs'
            readOnly={onChangeValue === undefined}
            onChange={evt => onChangeValue?.(evt.target.value)}
          />
        </div>
      </Table.Td>
    </Table.Tr>
  );
}

export default Properties;
