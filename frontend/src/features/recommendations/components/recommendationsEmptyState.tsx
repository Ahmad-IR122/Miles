import { useRecommendationsStyles } from "../styles/recommendations.styles";

const RecommendationsEmptyState = () => {
  const styles = useRecommendationsStyles();

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>(ㅠ﹏ㅠ)</div>
      <div className={styles.emptyTitle}>No places found</div>
      <div className={styles.emptySubtitle}>
        Try adjusting your filters to see more recommendations.
      </div>
    </div>
  );
};

export default RecommendationsEmptyState;
