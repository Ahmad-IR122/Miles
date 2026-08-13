import { mergeClasses } from "@griffel/react";
import { useRecommendationsStyles } from "../styles/recommendations.styles";
import type {
  BudgetFilterLabel,
  RecommendationCategory,
  RecommendationCategoryFilter,
} from "../types/types";

type RecommendationsFiltersProps = {
  categories: readonly ["All", ...RecommendationCategory[]];
  budgets: readonly BudgetFilterLabel[];
  activeCategory: RecommendationCategoryFilter;
  activeBudget: BudgetFilterLabel;
  onCategoryChange: (category: RecommendationCategoryFilter) => void;
  onBudgetChange: (budget: BudgetFilterLabel) => void;
};

const RecommendationsFilters = ({
  categories,
  budgets,
  activeCategory,
  activeBudget,
  onCategoryChange,
  onBudgetChange,
}: RecommendationsFiltersProps) => {
  const styles = useRecommendationsStyles();
  const isBudgetLabel = (value: string): value is BudgetFilterLabel =>
    budgets.some((budget) => budget === value);

  return (
    <div className={styles.filtersPanel}>
      <div className={styles.categoryTabs}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={mergeClasses(
              styles.categoryTab,
              activeCategory === category && styles.categoryTabActive,
            )}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.divider} />

      <select
        className={styles.budgetSelect}
        value={activeBudget}
        onChange={(event) => {
          const { value } = event.target;
          if (isBudgetLabel(value)) {
            onBudgetChange(value);
          }
        }}
      >
        {budgets.map((budget) => (
          <option key={budget} value={budget}>
            {budget}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RecommendationsFilters;
