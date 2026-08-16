import { useRecommendationsStyles } from "../styles/recommendations.styles";

type RecommendationsHeaderProps = {
  count: number;
};

const RecommendationsHeader = ({ count }: RecommendationsHeaderProps) => {
  const styles = useRecommendationsStyles();

  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Discover</h1>
        <p className={styles.subtitle}>
          Here are some recommendations based on your preferences. Explore and
          find the perfect places for your trip!
        </p>
      </div>
      <div className={styles.countBadge}>{count} places found</div>
    </div>
  );
};

export default RecommendationsHeader;
