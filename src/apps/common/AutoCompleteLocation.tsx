import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Autocomplete, TextField, Typography, FormHelperText } from "@mui/material";
import { debounce } from "@mui/material/utils";
import parse from "autosuggest-highlight/parse";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface AutoCompleteLocationProps {
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  errors: any;
  touched: any;
  values: any;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  focusedColor?: string;
}

const AutoCompleteLocation: React.FC<AutoCompleteLocationProps> = ({
  setFieldValue,
  errors,
  touched,
  values,
  placeholder = "Enter Location",
  name = "address",
  disabled = false,
  focusedColor = "#ff8c00",
}) => {
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placeService = useRef<google.maps.places.PlacesService | null>(null);
  const [placeInputValue, setPlaceInputValue] = useState("");
  const [placeOptions, setPlaceOptions] = useState<readonly any[]>([]);

  const fetch = useMemo(
    () =>
      debounce((request: { input: string }, callback: (results?: readonly any[]) => void) => {
        if (autocompleteService.current) {
          autocompleteService.current.getPlacePredictions(
            request,
            (predictions, status) => {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error("Error fetching place predictions:", status);
                callback([]);
                return;
              }
              callback(predictions || []);
            }
          );
        }
      }, 400),
    []
  );

  useEffect(() => {
    if (!autocompleteService.current && typeof window !== "undefined" && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    if (!placeService.current && typeof window !== "undefined" && window.google) {
      // Need a dummy div for PlacesService
      const dummyDiv = document.createElement("div");
      placeService.current = new window.google.maps.places.PlacesService(dummyDiv);
    }
  }, []);

  useEffect(() => {
    if (!autocompleteService.current) return;

    if (placeInputValue.length === 0) {
      setPlaceOptions(values[name] ? [{ description: values[name] }] : []);
      return;
    }

    fetch({ input: placeInputValue }, (results) => {
      let newOptions: readonly any[] = [];
      if (results) {
        newOptions = results;
      }
      setPlaceOptions(newOptions);
    });
  }, [placeInputValue, fetch, values, name]);

  const inputSx = {
    height: '40px',
    backgroundColor: 'white !important',
    borderRadius: '6px !important',
    '&.MuiOutlinedInput-root, & .MuiOutlinedInput-root': {
      height: '40px',
      backgroundColor: 'white !important',
      borderRadius: '6px !important',
      '& fieldset': {
        borderColor: '#ced4da !important',
        transition: 'all 0.3s ease !important',
      },
      '&:hover fieldset': {
        borderColor: '#ced4da !important',
      },
      '&.Mui-focused fieldset': {
        borderColor: `${focusedColor} !important`,
        borderWidth: '1.5px !important',
      },
    },
    '& .MuiOutlinedInput-input, & input': {
      padding: '0 10px !important',
      fontFamily: "'Poppins', sans-serif !important",
      fontSize: '14px !important',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
    },
  };

  return (
    <Box>
      <Autocomplete
        fullWidth
        size="small"
        id="google-map-autocomplete"
        disabled={disabled}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.description
        }
        filterOptions={(x) => x}
        options={placeOptions}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={values[name] ? { description: values[name] } : null}
        noOptionsText="No locations"
        onChange={(_event, newValue: any) => {
          if (newValue === null) {
            setFieldValue(name, "");
            setFieldValue("latitude", "");
            setFieldValue("longitude", "");
          } else {
            setFieldValue(name, newValue.description);
            if (placeService.current && newValue.place_id) {
              const request = {
                placeId: newValue.place_id,
                fields: ["geometry", "address_components", "formatted_address"],
              };

              placeService.current.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                  const components = place.address_components || [];
                  const locality = components.find((ele) => ele.types.includes("locality"));
                  const sublocality = components.find((ele) =>
                    ele.types.includes("sublocality_level_1") || ele.types.includes("sublocality")
                  );
                  const state = components.find((ele) =>
                    ele.types.includes("administrative_area_level_1")
                  );
                  const country = components.find((ele) =>
                    ele.types.includes("country")
                  );
                  const zipCode = components.find((ele) =>
                    ele.types.includes("postal_code")
                  );

                  setFieldValue("city", locality?.long_name || sublocality?.long_name || "");
                  setFieldValue("state", state?.long_name || "");
                  setFieldValue("country", country?.long_name || "India");
                  setFieldValue("zipCode", zipCode?.long_name || "");

                  if (place.geometry?.location) {
                    setFieldValue("latitude", place.geometry.location.lat());
                    setFieldValue("longitude", place.geometry.location.lng());
                  }
                }
              });
            }
          }
        }}
        onInputChange={(_event, newInputValue) => {
          setPlaceInputValue(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            id={name}
            name={name}
            fullWidth
            placeholder={placeholder}
            variant="outlined"
            inputProps={{
              ...params.inputProps,
              autoComplete: "new-password",
              autoCorrect: "off",
              autoCapitalize: "off",
              spellCheck: "false",
            }}
            sx={inputSx}
            error={touched[name] && Boolean(errors[name])}
            disabled={disabled}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          const matches =
            option.structured_formatting?.main_text_matched_substrings || [];

          const parts = parse(
            option.structured_formatting?.main_text || "",
            matches.map((match: any) => [match.offset, match.offset + match.length])
          );

          return (
            <li key={key} {...optionProps}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ display: "flex", width: 44, flexShrink: 0 }}>
                  <LocationOnIcon sx={{ color: "text.secondary" }} />
                </Box>
                <Box
                  sx={{
                    width: "calc(100% - 44px)",
                    wordWrap: "break-word",
                  }}
                >
                  {parts.map((part, index) => (
                    <Box
                      key={index}
                      component="span"
                      sx={{
                        fontWeight: part.highlight ? "bold" : "regular",
                      }}
                    >
                      {part.text}
                    </Box>
                  ))}

                  <Typography variant="body2" color="text.secondary">
                    {option.structured_formatting?.secondary_text}
                  </Typography>
                </Box>
              </Box>
            </li>
          );
        }}
        sx={{
          '& .MuiAutocomplete-inputRoot': {
            padding: '0 !important',
            height: '40px',
          }
        }}
      />
      {touched[name] && errors[name] && (
        <FormHelperText className="error-text">{(touched[name] && errors[name]) ? (errors[name] as string) : ""}</FormHelperText>
      )}
    </Box>
  );
};

export default AutoCompleteLocation;

