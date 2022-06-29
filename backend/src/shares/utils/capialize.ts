function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
export function capitalize(str) {
  return str.split(" ").map(capitalizeFirstLetter).join(" ");
}
