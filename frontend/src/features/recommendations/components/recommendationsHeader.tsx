import { useRecommendationsStyles } from "../styles/recommendations.styles";

type RecommendationsHeaderProps = {
  count: number;
  currentPage: number;
  totalPages: number;
  visibleStart: number;
  visibleEnd: number;
};

const RecommendationsHeader = ({
  count,
  currentPage,
  totalPages,
  visibleStart,
  visibleEnd,
}: RecommendationsHeaderProps) => {
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
      <div className={styles.countBadge}>
        {visibleStart}-{visibleEnd} of {count} | Page {currentPage} of{" "}
        {totalPages}
      </div>
    </div>
  );
};

export default RecommendationsHeader;
