import { $cl } from 'utils';
import styles from './Button.module.scss';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>
{

}

function Button ({
  className,
  children,
  ...buttonProps
}: ButtonProps) {

  return (
    <button
      {...buttonProps}
      className={$cl(styles.button, className)}
    >
      {children}
    </button>
  );
}

export default Button;
