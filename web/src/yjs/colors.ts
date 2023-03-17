
/**
 * List of 20 visually distinct colors.
 * Source: https://sashamaps.net/docs/resources/20-colors/
 */
const colorList = [
    "#800000",  // Maroon
    "#9A6324",  // Brown
    "#808000",  // Olive
    "#469990",  // Teal
    "#000075",  // Navy
    "#e6194B",  // Red
    "#f58231",  // Orange
    "#ffe119",  // Yellow
    "#bfef45",  // Lime
    "#3cb44b",  // Green
    "#42d4f4",  // Cyan
    "#4363d8",  // Blue
    "#911eb4",  // Purple
    "#f032e6",  // Magenta
    "#a9a9a9",  // Grey
    "#fabed4",  // Pink
    "#ffd8b1",  // Apricot
    "#fffac8",  // Beige
    "#aaffc3",  // Mint
    "#dcbeff"   // Lavender
]

/**
 * Map a string to one of 20 visually distinct colors.
 * 
 * This function is especially useful when trying to choose the cursor color 
 * for a user. Simply pass the user's name (or some other identifier), and this 
 * function maps the name to a color selected from a list of 20 visually distinct 
 * colors.
 * @param name An arbitrary string
 * @returns One of 20 visually distinct colors in hex format.
 */
export function getColor(name: string) {
    const index = stringHash(name)%colorList.length;
    return colorList[index];

}

/**
 * Adapted from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */
function stringHash(value: string) {var hash = 0,
    i, chr;
  for (i = 0; i < value.length; i++) {
    chr = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}