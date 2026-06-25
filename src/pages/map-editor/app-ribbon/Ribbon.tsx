import { Menu } from '@mantine/core';
import { InfoIcon } from '@phosphor-icons/react';
import Local from 'Local';
import Button from 'components/Button';
import DescriptiveTooltip from 'components/DescriptiveTooltip';
import { getLocaleIcon, getLocaleName, LOCALE_NAMES } from 'i18n';
import { useTranslation } from 'react-i18next';
import styles from './Ribbon.module.scss';

export interface AppRibbonProps {
  onRunTour: () => void;
}

function AppRibbon ({
  onRunTour,
}: AppRibbonProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className={styles.ribbon}>
      <Menu
        classNames={{
          dropdown: styles.languageMenu,
          item: styles.languageMenuItem,
        }}
      >
        <Menu.Target>
          <DescriptiveTooltip
            label={t("ribbon.language.name")}
            description={t("ribbon.language.desc")}
          > 
            <Button className={styles.langButton}>
              <img
                className={styles.langIcon}
                src={getLocaleIcon(i18n.language)}
              />
            </Button>
          </DescriptiveTooltip>
        </Menu.Target>

        <Menu.Dropdown>
            <Menu.Label>{t("ribbon.language.name")}</Menu.Label>
          {Object.keys(LOCALE_NAMES).map(k => (
            <Menu.Item
              key={k}
              onClick={() => handleChangeLanguage(k)}
              data-active={k === i18n.language}
            >
              <div className={styles.container}>
                <img className={styles.langIcon} src={getLocaleIcon(k)} />
                <div className={styles.name}>{getLocaleName(k)}</div>
              </div>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      
      <DescriptiveTooltip
        label={t("ribbon.tour.name")}
        description={t("ribbon.tour.desc")}
      > 
        <Button
          onClick={onRunTour}
        >
          <InfoIcon size={24} weight='thin' />
        </Button>
      </DescriptiveTooltip>
    </div>
  );

  function handleChangeLanguage (key: string) {
    i18n.changeLanguage(key);
    Local.setLocale(key);
  }
}

export default AppRibbon;
