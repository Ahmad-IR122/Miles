import { mergeClasses } from "@griffel/react";
import { useRecommendationsStyles } from "../styles/recommendations.styles";
import type { RecommendationPlace } from "../types/types";

type RecommendationCardProps = {
  place: RecommendationPlace;
  isAdding?: boolean;
  isAdded?: boolean;
  onAddToTrip?: (place: RecommendationPlace) => void;
};

const RecommendationCard = ({
  place,
  isAdding = false,
  isAdded = false,
  onAddToTrip,
}: RecommendationCardProps) => {
  const styles = useRecommendationsStyles();
  const shortDescription =
    place.desc.length > 110 ? `${place.desc.slice(0, 110)}...` : place.desc;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={place.img} alt={place.title} className={styles.image} />
        <span className={styles.categoryPill}>{place.category}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.titleRow}>
          <h3 className={styles.cardTitle}>{place.title}</h3>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.location}>📍 {place.location}</span>
          <span className={styles.price}>{place.price}</span>
        </div>

        <p className={styles.description}>{shortDescription}</p>

        <div className={styles.tags}>
          {place.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            className={mergeClasses(styles.actionButton, styles.primaryButton)}
            type="button"
            onClick={() => onAddToTrip?.(place)}
            disabled={!onAddToTrip || isAdding || isAdded}
          >
            {isAdding ? "Adding..." : isAdded ? "Added" : "Add to Trip"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
