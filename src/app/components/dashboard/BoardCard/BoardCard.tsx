import styles from './BoardCard.module.css';

type Props = {
  id: string;
  name: string;
  description?: string;
  cardsCount: number;
  membersCount: number;
  permission: string;
  onClick: () => void;
};

export default function BoardCard({
  name,
  description,
  cardsCount,
  membersCount,
  permission,
  onClick,
}: Props) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.topRow}>
        <h3 className={styles.title}>{name}</h3>

        <div className={styles.rightSide}>
          <span className={styles.permission}>{permission}</span>
          <span className={styles.infoIcon}>i</span>
        </div>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.bottomRow}>
        <div className={styles.stats}>
          <span className={styles.statBox}>👤 {membersCount}</span>
          <span className={styles.statBox}>🗂 {cardsCount}</span>
        </div>

        <span className={styles.arrow}>↗</span>
      </div>
    </div>
  );
}