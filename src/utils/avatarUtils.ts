export const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(" ");
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

export const stringToColor = (string: string) => {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    // Ensure the color is light (vibrant/pastel)
    // We mix with white to lighten it
    const lightValue = Math.floor((value + 255) / 2);
    color += `00${lightValue.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
};

export const getColorFromName = (name: string) => {
  if (!name) return "#f1f1f1";
  return stringToColor(name);
};
