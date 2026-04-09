import styles from './UserBadge.module.css';

type Props = {
  username: string;
};

export default function UserBadge({ username }: Props) {
  const initial = username?.charAt(0).toUpperCase() || 'U';

  return (
    <div className={styles.wrapper}>
      <div className={styles.avatar}>{initial}</div>
      <span className={styles.name}>{username}</span>
    </div>
  );
}