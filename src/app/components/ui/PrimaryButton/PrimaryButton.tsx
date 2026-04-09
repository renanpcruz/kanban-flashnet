import styles from './PrimaryButton.module.css';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
}: Props) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}