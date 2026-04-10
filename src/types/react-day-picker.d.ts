declare module "react-day-picker" {
  // Provide the minimal types you need here
  export interface DayPickerProps {
    mode?: "range";
    selected?: any;
    onSelect?: (range: any) => void;
  }

  export const DayPicker: React.FC<DayPickerProps>;
}
