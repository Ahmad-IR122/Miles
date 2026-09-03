import { Autocomplete, TextField } from "@mui/material";
import { mergeClasses } from "@griffel/react";
import { Country } from "country-state-city";
import { fieldSx } from "../../../components/tripPlanningForm/tripPlanningForm.styles";
import { layout, typography } from "../../../common/theme/typography";
import { useRecommendationsStyles } from "../styles/recommendations.styles";
import type {
  BudgetFilterLabel,
  RecommendationCategory,
  RecommendationCategoryFilter,
} from "../types/types";

const ANY_COUNTRY = "Any Country";

// Matches .budgetSelect's footprint (width/height/radius) so the two filters
// sit at the same size next to each other, on top of the shared field
// border/focus styling from the trip planning form.
const countryFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
    ...fieldSx["& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root"],
    height: layout.controlSize.lg,
    borderRadius: layout.radius.md,
    fontSize: typography.fontSize.size3,
    paddingTop: 0,
    paddingBottom: 0,
  },
};

// Every country, not just the ones that happen to show up in whatever's
// currently loaded on the page - same full list the trip planning form
// searches, so this stays useful as more destinations/activities get added.
const allCountryNames = Country.getAllCountries()
  .map((country) => country.name)
  .sort((a, b) => a.localeCompare(b));

type RecommendationsFiltersProps = {
  categories: readonly ["All", ...RecommendationCategory[]];
  budgets: readonly BudgetFilterLabel[];
  activeCategory: RecommendationCategoryFilter;
  activeBudget: BudgetFilterLabel;
  activeCountry: string;
  onCategoryChange: (category: RecommendationCategoryFilter) => void;
  onBudgetChange: (budget: BudgetFilterLabel) => void;
  onCountryChange: (country: string) => void;
};

const RecommendationsFilters = ({
  categories,
  budgets,
  activeCategory,
  activeBudget,
  activeCountry,
  onCategoryChange,
  onBudgetChange,
  onCountryChange,
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

      <Autocomplete
        onChange={(_event, value) => onCountryChange(value ?? ANY_COUNTRY)}
        options={allCountryNames}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={ANY_COUNTRY}
            sx={countryFieldSx}
          />
        )}
        size="small"
        sx={{ width: "170px", maxWidth: "100%" }}
        value={activeCountry === ANY_COUNTRY ? null : activeCountry}
      />
    </div>
  );
};

export { ANY_COUNTRY };

export default RecommendationsFilters;
