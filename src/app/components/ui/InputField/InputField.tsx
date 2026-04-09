import styles from './InputField.module.css';

type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}