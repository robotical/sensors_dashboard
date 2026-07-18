import List from "@mui/material/List";
import { useId, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Addon from "../../models/addons/Addon";
import AddonItem from "./AddonItem";
import styles from "./styles.module.css";

interface AddonsListProps {
  addons: Addon[];
}

export default function AddonsList({ addons }: AddonsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const reactId = useId();
  const listId = `available-signals-${reactId.replace(/:/g, "")}`;
  const selectedCount = addons.reduce(
    (count, addon) =>
      count +
      addon.addonInputs.reduce(
        (addonCount, input) => addonCount + (input.selected ? 1 : 0),
        0
      ),
    0
  );

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.disclosureButton}
        onClick={() => setIsExpanded((value) => !value)}
        aria-expanded={isExpanded}
        aria-controls={listId}
      >
        <span className={styles.disclosureCopy}>
          <strong>Available signals</strong>
          <small aria-live="polite">
            {selectedCount === 0
              ? "None selected"
              : `${selectedCount} selected`}
          </small>
        </span>
        <FaChevronDown
          className={[
            styles.disclosureIcon,
            isExpanded ? styles.disclosureIconOpen : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      <div
        className={styles.listRegion}
        id={listId}
        ref={parentRef}
        hidden={!isExpanded}
      >
        {addons.length > 0 ? (
          <List
            dense
            className={styles.list}
            component="nav"
            aria-label="Available sensor signals"
          >
            {addons.map((addon, index) => (
              <AddonItem
                key={`${addon.whoAmI}-${index}`}
                addon={addon}
                parentRef={parentRef}
              />
            ))}
          </List>
        ) : (
          <p className={styles.emptyMessage} role="status">
            No signals are available yet.
          </p>
        )}
      </div>
    </div>
  );
}
