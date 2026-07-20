import React, { useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { debounce } from "@mui/material/utils";
import { inputSx } from "@/utils/styles/commonSx";

export interface AsyncPageResult {
  items: any[];
  hasMore: boolean;
}

export interface AsyncPaginatedSelectProps {
  // Fetches one page of options from the server. `page` is 1-indexed.
  fetchPage: (page: number, search: string) => Promise<AsyncPageResult>;
  value: any;
  onChange: (value: any) => void;
  // Optional: also receive the full selected option object (not just its id)
  // — useful when the caller needs to display something about the selection
  // (e.g. a name) without keeping its own copy of the whole options list.
  onOptionSelect?: (option: any | null) => void;
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => any;
  // Full option object for the current `value`, if the caller already has it
  // (e.g. an Add/Edit form editing an existing record) — lets the input show
  // the right label immediately, even before that item's page has loaded.
  selectedOption?: any;
  placeholder?: string;
  disabled?: boolean;
  pageSize?: number;
  debounceMs?: number;
}

const LOADING_SENTINEL = { __asyncSelectLoadingSentinel: true };

const defaultGetOptionLabel = (option: any) =>
  option?.label ?? option?.name ?? option?.role ?? String(option ?? "");

const defaultGetOptionValue = (option: any) =>
  typeof option === "object" && option !== null
    ? (option._id ?? option.value)
    : option;

const AsyncPaginatedSelect: React.FC<AsyncPaginatedSelectProps> = ({
  fetchPage,
  value,
  onChange,
  onOptionSelect,
  getOptionLabel = defaultGetOptionLabel,
  getOptionValue = defaultGetOptionValue,
  selectedOption,
  placeholder = "Select",
  disabled = false,
  debounceMs = 400,
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const requestIdRef = useRef(0);
  // Rapid-fire scroll events (browsers fire many per second) can call
  // handleScroll several times before React re-renders with loading:true —
  // the `loading` state check alone isn't enough to stop a duplicate fetch
  // for the same page. This ref is set synchronously, closing that race.
  const loadingRef = useRef(false);

  const loadPage = async (targetPage: number, searchVal: string, replace: boolean) => {
    // A fresh search/reset always supersedes whatever's in flight (the
    // requestId check below discards the stale response when it lands);
    // only "load more" (replace:false) calls respect the in-flight lock,
    // since that's the one path that can race itself via rapid scroll events.
    if (!replace && loadingRef.current) return;
    loadingRef.current = true;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await fetchPage(targetPage, searchVal);
      if (requestId !== requestIdRef.current) return; // a newer request already superseded this one
      setItems((prev) => {
        if (replace) return res.items;
        // Defensive de-dupe in case of any residual overlap (e.g. items
        // shifting between pages while new rows were inserted concurrently).
        const existingIds = new Set(prev.map((it) => getOptionValue(it)));
        const fresh = res.items.filter((it) => !existingIds.has(getOptionValue(it)));
        return [...prev, ...fresh];
      });
      setHasMore(res.hasMore);
      setPage(targetPage);
    } catch (err) {
      console.error("AsyncPaginatedSelect: fetchPage failed", err);
      if (replace) setItems([]);
      setHasMore(false);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (open && items.length === 0 && !loadingRef.current) {
      loadPage(1, "", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        loadPage(1, val, true);
      }, debounceMs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debounceMs],
  );

  const handleInputChange = (_: React.SyntheticEvent, newInputValue: string, reason: string) => {
    if (reason === "input") {
      setSearch(newInputValue);
      debouncedSearch(newInputValue);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48 && hasMore && !loadingRef.current) {
      loadPage(page + 1, search, false);
    }
  };

  // Show the pre-selected option's label even if its page hasn't loaded yet.
  const options = useMemo(() => {
    let base = items;
    if (selectedOption) {
      const selVal = getOptionValue(selectedOption);
      const alreadyLoaded = items.some((it) => getOptionValue(it) === selVal);
      if (!alreadyLoaded) base = [selectedOption, ...items];
    }
    // Append a non-selectable sentinel row so a spinner can render at the
    // bottom of the open listbox while a "load more" fetch is in flight.
    if (loading && items.length > 0) base = [...base, LOADING_SENTINEL];
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedOption, loading]);

  const selectedValueObject =
    options.find((opt) => opt !== LOADING_SENTINEL && getOptionValue(opt) === value) ??
    (selectedOption && getOptionValue(selectedOption) === value ? selectedOption : null);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      disabled={disabled}
      options={options}
      loading={loading && items.length === 0}
      loadingText="Loading..."
      getOptionLabel={(option) =>
        option === LOADING_SENTINEL ? "" : typeof option === "string" ? option : getOptionLabel(option)
      }
      isOptionEqualToValue={(option, val) => getOptionValue(option) === getOptionValue(val)}
      value={selectedValueObject}
      filterOptions={(x) => x} // the server already applies the search filter
      onChange={(_, newValue) => {
        if (newValue === LOADING_SENTINEL) return;
        onChange(newValue ? getOptionValue(newValue) : "");
        onOptionSelect?.(newValue ?? null);
      }}
      onInputChange={handleInputChange}
      slotProps={{
        popper: { sx: { zIndex: "999999 !important" } },
        listbox: { onScroll: handleScroll },
      }}
      renderOption={(props, option) => {
        if (option === LOADING_SENTINEL) {
          const { key, ...rest } = props as any;
          return (
            <li
              key={key ?? "loading-more"}
              {...rest}
              style={{ display: "flex", justifyContent: "center", padding: "8px 0", pointerEvents: "none" }}
            >
              <CircularProgress size={16} color="inherit" />
            </li>
          );
        }
        const { key, ...rest } = props as any;
        return (
          <li key={key ?? getOptionValue(option)} {...rest}>
            {typeof option === "string" ? option : getOptionLabel(option)}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} sx={inputSx} />
      )}
    />
  );
};

export default AsyncPaginatedSelect;
